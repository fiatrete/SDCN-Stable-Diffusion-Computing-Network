import React, { useCallback, useState } from 'react'
import cx from 'classnames'
import { Form, Select, Button, Input, Typography, message } from 'antd'
import {
  ModelFormGroup,
  LoraFormGroup,
  SamplingFormGroup,
} from 'components/SettingsFormGroup'
import { txt2img, txt2imgParams } from 'api/txt2img'
import ImageWidget from 'components/ImageOutputWidget'
import { FormFinishInfo } from 'rc-field-form/es/FormContext'
import GeneratingMask from 'components/GeneratingMask'

import styles from './index.module.css'
import { observer } from 'mobx-react-lite'
import uiStore from 'stores/uiStore'

const { Title } = Typography
const { TextArea } = Input

const sizes = [
  { value: '512x512', label: '512x512' },
  { value: '512x768', label: '512x768' },
  { value: '768x512', label: '768x512' },
  { value: '768x1024', label: '768x1024' },
  { value: '1024x768', label: '1024x768' },
]

const Txt2img = () => {
  const [form] = Form.useForm()

  const [imgUri, setImgUri] = useState<string | undefined>()
  const [imgLoading, setImgLoading] = useState<boolean>(false)

  const onFormSubmit = useCallback(
    async (name: string, { values }: FormFinishInfo) => {
      try {
        const [widthStr, heightStr] = values.size.split('x')
        delete values.size
        const apiParams: txt2imgParams = Object.assign(values)
        apiParams.width = parseInt(widthStr)
        apiParams.height = parseInt(heightStr)
        apiParams.cfg_scale = 7
        //console.log('submit txt2img', apiParams)

        setImgLoading(true)
        setImgUri(await txt2img(apiParams))
      } catch (err) {
        if (err instanceof String) message.error(err)
        if (err instanceof Error) message.error(err.message)
      } finally {
        setImgLoading(false)
      }
    },
    [],
  )

  return (
    /* when Form submitted, the parent Form.Provider received the submittion via onFormFinish */
    <Form.Provider onFormFinish={onFormSubmit}>
      <Form name='txt2imgForm' form={form} layout='vertical'>
        <GeneratingMask open={imgLoading} />
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
                : ['w-full flex flex-col flex-1 gap-8'],
            )}
          >
            <div className={cx('flex flex-col items-start gap-6')}>
              <Title level={5}>Input keyword and generate</Title>
              <div className={cx('flex flex-col w-full items-start gap-6')}>
                <Form.Item name='prompt' className={cx('self-stretch mb-0')}>
                  <TextArea
                    size='large'
                    rows={6}
                    placeholder='Enter prompts here'
                    className={cx('text-base leading-6 px-4 py-2')}
                  />
                </Form.Item>
              </div>
              <Button type='primary' htmlType='submit' size='large'>
                Generate
              </Button>
            </div>
            <div
              className={cx(
                uiStore.isMobile
                  ? ['w-full mt-4']
                  : ['h-[388px] w-full flex justify-center'],
              )}
            >
              <div
                className={cx(
                  uiStore.isMobile ? ['w-full h-full'] : ['w-[500px] flex'],
                )}
              >
                <ImageWidget src={imgUri} />
              </div>
            </div>
          </div>
          <div className={cx('flex flex-col w-80 gap-6')}>
            <Title level={5}>Settings</Title>
            <div className={cx('gap-0')}>
              <ModelFormGroup label='Model' name='model' />
              <Form.Item label='Size' name='size' initialValue={sizes[0].value}>
                <Select size='large' options={sizes} />
              </Form.Item>
              <LoraFormGroup
                label='LoRA1'
                loraName='lora1'
                weightName='weight1'
              />
              <LoraFormGroup
                label='LoRA2'
                loraName='lora2'
                weightName='weight2'
              />
              <Form.Item label='Negative Prompts' name='negative_prompt'>
                <TextArea
                  size='large'
                  rows={4}
                  placeholder='Negative Prompts'
                  className={cx('self-stretch text-base leading-6 px-4 py-2')}
                />
              </Form.Item>
              <SamplingFormGroup
                methodName='sampler_name'
                stepsName='steps'
                seedName='seed'
              />
            </div>
          </div>
        </div>
      </Form>
    </Form.Provider>
  )
}

export default observer(Txt2img)
