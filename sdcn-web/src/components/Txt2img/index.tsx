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

const { Title } = Typography
const { TextArea } = Input

function InputAndGenerateArea() {
  return (
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
  )
}

const sizes = [
  { value: '512x512', label: '512x512' },
  { value: '512x768', label: '512x768' },
  { value: '768x512', label: '768x512' },
  { value: '768x1024', label: '768x1024' },
  { value: '1024x768', label: '1024x768' },
]

function SettingsArea() {
  return (
    <div className={cx('flex flex-col w-80 gap-6 bg-green-000')}>
      <Title level={5}>Settings</Title>
      <div className={cx('gap-0')}>
        <ModelFormGroup label='Model' name='model' />

        <Form.Item label='Size' name='size' initialValue={sizes[0].value}>
          <Select size='large' options={sizes} />
        </Form.Item>

        <LoraFormGroup label='LoRA1' loraName='lora1' weightName='weight1' />
        <LoraFormGroup label='LoRA2' loraName='lora2' weightName='weight2' />

        <Form.Item label='Negative Prompts' name='negative_prompt'>
          <TextArea
            size='large'
            rows={4}
            placeholder='Negative Prompts'
            className={cx('self-stretch text-base leading-6 px-4 py-2')}
          />
        </Form.Item>

        <SamplingFormGroup
          methodName='sampling_method'
          stepsName='steps'
          seedName='seed'
        />
      </div>
    </div>
  )
}

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

        apiParams.sampler_name = values.sampling_method

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
            styles.wrap,
            'w-full flex flex-col md:flex-row bg-yellow-000 gap-24 mt-8',
          )}
        >
          <div className={cx('w-full flex flex-col flex-1 bg-red-000')}>
            <InputAndGenerateArea />
            <div className={cx('h-[788px] w-full flex justify-center')}>
              <div className={cx('w-[576px] flex')}>
                <ImageWidget src={imgUri} />
              </div>
            </div>
          </div>
          <SettingsArea />
        </div>
      </Form>
    </Form.Provider>
  )
}

export default Txt2img
