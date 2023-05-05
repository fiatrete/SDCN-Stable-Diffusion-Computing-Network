import React, { useCallback, useState } from 'react'
import cx from 'classnames'
import {
  Form,
  Button,
  Input,
  Typography,
  message,
  Tooltip,
  FormInstance,
} from 'antd'
import {
  ModelFormGroup,
  SamplingFormGroup,
  CFGFormGroup,
  LoRAFormGroup,
  SeedFormGroup,
  SizeFormGroup,
  NegativePromptsFromGroup,
} from 'components/SettingsFormGroup'
import ImageOutputWidget from 'components/ImageOutputWidget'

import styles from './index.module.css'
import { observer } from 'mobx-react-lite'
import uiStore from 'stores/uiStore'
import to from 'await-to-js'
import { AxiosError } from 'axios'
import {
  TaskResponseData,
  Txt2imgParams,
  getTaskStatus,
  txt2imgAsync,
} from 'api/playground'
import { Task } from 'typings/Task'
import GeneratingMask from 'components/GeneratingMask'
import { ArrowDownOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import _ from 'lodash'
import modelInfoStore from 'stores/modelInfoStore'
import { flushSync } from 'react-dom'
import playgroundStore from 'stores/playgroundStore'
import { StoreValue } from 'antd/es/form/interface'

const { Title } = Typography
const { TextArea } = Input

const sizes = [
  { value: '512x512', label: '512x512' },
  { value: '512x768', label: '512x768' },
  { value: '768x512', label: '768x512' },
  { value: '768x1024', label: '768x1024' },
  { value: '1024x768', label: '1024x768' },
]

const Txt2img = ({ form }: { form: FormInstance }) => {
  const [imgUri, setImgUri] = useState<string | undefined>()
  const [lastSeed, setLastSeed] = useState(-1)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [task, setTask] = useState<Task | undefined>(undefined)

  const handleClickReadParamsButton = useCallback(() => {
    const promptValue = form.getFieldValue('prompt')
    if (promptValue === undefined) {
      return
    }

    const splitParts = promptValue.split('\n')

    const prompt = splitParts[0]
    const negativePrompt = splitParts[1]?.split('Negative prompt: ')[1]
    const params = splitParts[2]
      ?.split(', ')
      .reduce((s: { [k: string]: string }, v: string) => {
        const [key, value] = v.split(': ')
        s[key] = value
        return s
      }, {})

    if (prompt !== undefined) {
      form.setFieldValue('prompt', prompt)
    }

    if (negativePrompt !== undefined) {
      form.setFieldValue('negative_prompt', negativePrompt)
    }

    if (params !== undefined) {
      const modelTarget = params['Model hash']
      const model = _.find(modelInfoStore.modelInfos.Models, (modelData) =>
        _.startsWith(modelData.hash, modelTarget),
      )
      if (model !== undefined) {
        form.setFieldValue('model', model.hash)
      }

      const sizeTarget = params['Size']
      const size = _.find(sizes, (s) => s.value === sizeTarget)
      if (size !== undefined) {
        form.setFieldValue('size', size.value)
      }

      const samplerTarget = params['Sampler']
      const sampler = _.find(
        modelInfoStore.modelInfos.Samplers,
        (s) => s === samplerTarget,
      )
      if (sampler !== undefined) {
        form.setFieldValue('sampler_name', sampler)
      }

      const steps = parseInt(params['Steps'], 10)
      if (_.isSafeInteger(steps)) {
        form.setFieldValue('steps', steps)
      }

      const seed = parseInt(params['Seed'], 10)
      if (_.isSafeInteger(seed)) {
        form.setFieldValue('seed', seed)
      }

      const cfgScale = parseInt(params['CFG scale'], 10)
      if (_.isSafeInteger(cfgScale)) {
        form.setFieldValue('cfg_scale', cfgScale)
      }
    }
  }, [form])

  const handleClickRandomSeedButton = useCallback(() => {
    form.setFieldValue('seed', -1)
  }, [form])

  const handleClickLastSeedButton = useCallback(() => {
    form.setFieldValue('seed', lastSeed)
  }, [form, lastSeed])

  const setGeneratingTask = useCallback(
    (_isGenerating: boolean, _task: Task | undefined = undefined) => {
      setIsGenerating(_isGenerating)
      setTask(_task)
    },
    [],
  )

  const pollingTaskResult = useCallback(
    (task: Task) => {
      setGeneratingTask(true, task)

      const timerId = setInterval(async () => {
        const [_error, _resp] = await to<TaskResponseData, AxiosError>(
          getTaskStatus(task.taskId),
        )

        if (_error !== null) {
          message.error(_error.message)
          console.error('getTaskStatus Error', _error)
          setGeneratingTask(false)
          return
        }

        setGeneratingTask(true, _resp)

        if (_resp.status !== 0 && _resp.status !== 1) {
          clearInterval(timerId)
          setGeneratingTask(false)

          if (_resp.status === 2) {
            flushSync(() => {
              setImgUri(`data:image/png;base64,${_resp.images[0]}`)
              setLastSeed(_resp.seeds[0])
            })
          } else if (_resp.status === 3) {
            message.error(`Failed: [${_resp.status}]`)
          }
        }
      }, 1000)
    },
    [setGeneratingTask],
  )

  const onFormFinish = useCallback(
    async (values: StoreValue) => {
      try {
        setGeneratingTask(true)

        const [widthStr, heightStr] = values.size.split('x')
        delete values.size
        const apiParams: Txt2imgParams = Object.assign(values)
        apiParams.width = parseInt(widthStr)
        apiParams.height = parseInt(heightStr)
        apiParams.cfg_scale = parseFloat(values.cfg_scale)

        const [_error, _task] = await to<Task, AxiosError>(
          txt2imgAsync(apiParams),
        )

        if (_error !== null) {
          message.error(_error.message)
          console.error('txt2img Async Error', _error)
          setGeneratingTask(false)
          return
        }

        pollingTaskResult(_task)
      } catch (err) {
        if (err instanceof String) message.error(err)
        if (err instanceof Error) message.error(err.message)

        setGeneratingTask(false)
      }
    },
    [pollingTaskResult, setGeneratingTask],
  )

  const onImageOutputWidgetJump = useCallback(
    (key: string) => {
      playgroundStore.getForm(key)?.setFieldsValue(form.getFieldsValue(true))
      playgroundStore.getForm(key)?.setFieldValue('input_image', imgUri)

      playgroundStore.activePlaygroundTabKey = key
    },
    [form, imgUri],
  )

  return (
    <Form
      name='txt2imgForm'
      form={form}
      layout='vertical'
      onFinish={onFormFinish}
      preserve={false}
    >
      <GeneratingMask
        open={isGenerating}
        defaultTip='Generating...'
        task={task}
      />
      <div
        className={cx(
          uiStore.isMobile
            ? [styles.wrap, 'w-full flex flex-col gap-12']
            : [styles.wrap, 'w-full flex flex-row gap-24 mt-8'],
        )}
      >
        <div
          className={cx(
            uiStore.isMobile
              ? ['w-full flex flex-col']
              : ['w-full flex flex-col flex-1 gap-6'],
          )}
        >
          <div className={cx('flex flex-col items-start gap-6')}>
            <Title level={5}>Input keyword and generate</Title>
            <div className={cx('flex flex-col w-full items-start gap-6')}>
              <Form.Item
                name='prompt'
                className={cx('self-stretch mb-0')}
                rules={[{ required: true, message: 'Please input prompts' }]}
              >
                <TextArea
                  size='large'
                  rows={6}
                  placeholder='Enter prompts here'
                  className={cx('text-base leading-6 px-4 py-2')}
                />
              </Form.Item>
            </div>
            <div className={cx('w-full flex justify-between items-start')}>
              <Button type='primary' htmlType='submit' size='large'>
                Generate
              </Button>
              <div className={cx('flex gap-2 justify-center items-center')}>
                <Button
                  icon={
                    <ArrowDownOutlined
                      style={{ transform: 'rotate(-45deg)' }}
                    />
                  }
                  title='Read generation parameters from prompt'
                  onClick={handleClickReadParamsButton}
                />
                <Tooltip
                  placement='top'
                  title='Currently, only generation data copied from civitai.com is supported'
                  arrow={{
                    pointAtCenter: true,
                  }}
                >
                  <ExclamationCircleOutlined style={{ color: 'gray' }} />
                </Tooltip>
              </div>
            </div>
          </div>
          <div
            className={cx(
              uiStore.isMobile
                ? ['w-full mt-4']
                : ['min-h-[388px] w-full flex justify-center'],
            )}
          >
            <div
              className={cx(
                uiStore.isMobile ? ['w-full h-full'] : ['w-[500px] flex'],
              )}
            >
              <ImageOutputWidget
                src={imgUri}
                onJump={onImageOutputWidgetJump}
              />
            </div>
          </div>
        </div>
        <div className={cx('flex flex-col w-80 gap-6')}>
          <Title level={5}>Settings</Title>
          <div className={cx('gap-0')}>
            <ModelFormGroup label='Model' name='model' />

            <SizeFormGroup sizes={sizes} />

            <LoRAFormGroup />

            <NegativePromptsFromGroup />

            <SamplingFormGroup methodName='sampler_name' stepsName='steps' />

            <SeedFormGroup
              seedName='seed'
              onClickRandomSeed={handleClickRandomSeedButton}
              onClickLastSeed={handleClickLastSeedButton}
            />

            <CFGFormGroup scaleName='cfg_scale' />
          </div>
        </div>
      </div>
    </Form>
  )
}

export default observer(Txt2img)
