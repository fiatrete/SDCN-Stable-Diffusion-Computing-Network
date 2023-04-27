import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import cx from 'classnames'
import check from 'check-types'
import {
  Form,
  Button,
  Input,
  Typography,
  message,
  InputNumber,
  FormInstance,
} from 'antd'
import {
  ModelFormGroup,
  LoRAFormGroup,
  SamplingFormGroup,
  SeedFormGroup,
  SizeFormGroup,
  NegativePromptsFromGroup,
  DenoisingStrengthFormGroup,
} from 'components/SettingsFormGroup'
import ImageOutputWidget from 'components/ImageOutputWidget'
import ImageInputWidget, {
  ImageInputWidgetRefHandle,
} from 'components/ImageInputWidget'
import GeneratingMask from 'components/GeneratingMask'
import { observer } from 'mobx-react-lite'

import styles from './index.module.css'

import uiStore from 'stores/uiStore'
import to from 'await-to-js'
import { Task } from 'typings/Task'
import { AxiosError } from 'axios'
import {
  Img2imgParams,
  TaskResponseData,
  getTaskStatus,
  img2imgAsync,
} from 'api/playground'
import { flushSync } from 'react-dom'
import playgroundStore from 'stores/playgroundStore'
import { StoreValue } from 'antd/es/form/interface'

const { Title } = Typography
const { TextArea } = Input

function calclImgSize(
  inWid: number,
  inHei: number,
  setWid: number,
  setHei: number,
) {
  // Set out image size
  let width = setWid > 0 ? setWid : inWid
  let height = setHei > 0 ? setHei : inHei
  // Set limited image size
  if (width > 1024) {
    height = (1024 / width) * height
    width = 1024
  }
  if (height > 1024) {
    width = (1024 / height) * width
    height = 1024
  }
  return [Math.round(width), Math.round(height)]
}

const sizes = [
  { value: '-1x-1', label: 'same as input' },
  { value: '512x512', label: '512x512' },
  { value: '512x768', label: '512x768' },
  { value: '768x512', label: '768x512' },
  { value: '768x1024', label: '768x1024' },
  { value: '1024x768', label: '1024x768' },
]

const Img2img = ({ form }: { form: FormInstance }) => {
  const imageUploaderRef = useRef<ImageInputWidgetRefHandle>(null)
  const [outputImgUri, setOutputImgUri] = useState<string | undefined>()
  const [lastSeed, setLastSeed] = useState(-1)
  const [inputImg, setInputImg] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [task, setTask] = useState<Task | undefined>(undefined)

  const setGeneratingTask = useCallback(
    (_isGenerating: boolean, _task: Task | undefined = undefined) => {
      setIsGenerating(_isGenerating)
      setTask(_task)
    },
    [],
  )

  const activeTabKey = playgroundStore.activePlaygroundTabKey
  useEffect(() => {
    const inputImageValue = form.getFieldValue('input_image')
    if (activeTabKey === 'img2img' && inputImageValue) {
      imageUploaderRef.current?.updateImage(inputImageValue)
      form.setFieldValue('input_image', undefined)
    }
  }, [form, activeTabKey])

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
              setOutputImgUri(`data:image/png;base64,${_resp.images[0]}`)
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
        check.assert(inputImg, 'input image must be existed')

        setGeneratingTask(true)

        // Get input image size
        const [widthStr, heightStr] = values.size.split('x')
        delete values.size
        const inWid: number = values.input_width
        delete values.input_width
        const inHei: number = values.input_height
        delete values.input_height

        const apiParams: Img2imgParams = Object.assign(values)

        const setWid = parseInt(widthStr)
        const setHei = parseInt(heightStr)
        // Set submit image size
        const [subWidth, subHeight] = calclImgSize(inWid, inHei, setWid, setHei)
        apiParams.width = subWidth
        apiParams.height = subHeight

        apiParams.cfg_scale = 7
        apiParams.init_image = inputImg?.split(',')[1]
        //console.log('submit', apiParams)

        const [_error, _task] = await to<Task, AxiosError>(
          img2imgAsync(apiParams),
        )

        if (_error !== null) {
          message.error(_error.message)
          console.error('img2img Async Error', _error)
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
    [inputImg, setGeneratingTask, pollingTaskResult],
  )

  const onInputSize = useCallback(
    (width: number, height: number) => {
      form.setFieldValue('input_width', width)
      form.setFieldValue('input_height', height)
    },
    [form],
  )

  const handleClickRandomSeedButton = useCallback(() => {
    form.setFieldValue('seed', -1)
  }, [form])

  const handleClickLastSeedButton = useCallback(() => {
    form.setFieldValue('seed', lastSeed)
  }, [form, lastSeed])

  const onImageOutputWidgetJump = useCallback(
    (key: string) => {
      playgroundStore.getForm(key)?.setFieldsValue(form.getFieldsValue(true))
      playgroundStore.getForm(key)?.setFieldValue('input_image', outputImgUri)

      playgroundStore.activePlaygroundTabKey = key
    },
    [form, outputImgUri],
  )

  return (
    <Form
      form={form}
      name='img2imgForm'
      layout='vertical'
      onFinish={onFormFinish}
    >
      <GeneratingMask
        open={isGenerating}
        defaultTip='Generating...'
        task={task}
      />
      <Fragment>
        <Form.Item hidden={true} name='input_width'>
          <InputNumber />
        </Form.Item>
        <Form.Item hidden={true} name='input_height'>
          <InputNumber />
        </Form.Item>
      </Fragment>
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
              ? ['flex flex-col gap-6']
              : ['flex flex-col flex-1 gap-6'],
          )}
        >
          <div className={cx('flex flex-col items-start gap-6')}>
            <Title level={5}>Input keyword and generate</Title>
            <div className={cx('flex flex-col w-full items-start gap-6')}>
              <Form.Item
                name='prompt'
                className={cx('self-stretch')}
                style={{ marginBottom: '0px' }}
                rules={[{ required: true, message: 'Please input prompts' }]}
              >
                <TextArea
                  size='large'
                  rows={6}
                  placeholder='Enter prompts here'
                  className={cx('text-base leading-6 px-4 py-2')}
                />
              </Form.Item>
              <Button type='primary' htmlType='submit' size='large'>
                Generate
              </Button>
            </div>
          </div>
          <div
            className={cx(
              uiStore.isMobile
                ? ['flex flex-col gap-2.5']
                : ['min-h-[388px] flex gap-2.5'],
            )}
          >
            <ImageInputWidget
              onChanged={setInputImg}
              onSize={onInputSize}
              ref={imageUploaderRef}
            />
            <ImageOutputWidget
              src={outputImgUri}
              onJump={onImageOutputWidgetJump}
            />
          </div>
        </div>
        <div className={cx('flex flex-col w-80 gap-6')}>
          <Title level={5}>Settings</Title>
          <div className={cx('gap-0')}>
            <ModelFormGroup label='Model' name='model' />

            <SizeFormGroup sizes={sizes} />

            <LoRAFormGroup />

            <NegativePromptsFromGroup />

            <DenoisingStrengthFormGroup />

            <SamplingFormGroup methodName='sampler_name' stepsName='steps' />

            <SeedFormGroup
              seedName='seed'
              onClickRandomSeed={handleClickRandomSeedButton}
              onClickLastSeed={handleClickLastSeedButton}
            />
          </div>
        </div>
      </div>
    </Form>
  )
}

export default observer(Img2img)
