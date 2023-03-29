import React, { useState } from 'react'
import cx from 'classnames'
import { Form, Select, Button, Input, Typography } from 'antd'
import {
  ModelFormGroup,
  LoraFormGroup,
  SamplingFormGroup,
} from 'components/SettingsFormGroup'
import { img2img, img2imgParams } from 'api/img2img'
import ImageOutputWidget from 'components/ImageOutputWidget'
import ImageInputWidget from 'components/ImageInputWidget'
import { FormFinishInfo } from 'rc-field-form/es/FormContext'
import GeneratingMask from 'components/GeneratingMask'
import SliderSettingItem from 'components/SliderSettingItem'

import styles from './index.module.css'

const { Title } = Typography
const { TextArea } = Input

function InputAndGenerateArea() {
  return (
    <div className={cx('flex flex-col items-start gap-6')}>
      <Title level={5}>Input keyword and generate</Title>
      <div className={cx('flex flex-col w-full items-start gap-6')}>
        <Form.Item
          name='prompt'
          className={cx('self-stretch')}
          style={{ marginBottom: '0px' }}
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
  )
}

const sizes = [
  { value: '512x512', label: '512x512' },
  { value: '512x768', label: '512x768' },
  { value: '768x512', label: '768x512' },
]

function SettingsArea() {
  return (
    <div className={cx('flex flex-col w-80 gap-6 bg-green-000')}>
      <Title level={5}>Settings</Title>
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

      <Form.Item
        label='Denoising strength'
        name='denoising_strength'
        initialValue={0.5}
      >
        <SliderSettingItem />
      </Form.Item>

      <SamplingFormGroup
        methodName='sampling_method'
        stepsName='steps'
        seedName='seed'
      />
    </div>
  )
}

const Img2img = () => {
  const [form] = Form.useForm()
  const [outputImgUri, setOutputImgUri] = useState<string | undefined>()
  const [inputImgUri, setInputImgUri] = useState<string>('')
  const [imgLoading, setImgLoading] = useState<boolean>(false)

  const onFormSubmit = (name: string, { values }: FormFinishInfo) => {
    const [widthStr, heightStr] = values.size.split('x')
    delete values.size
    const apiParams: img2imgParams = Object.assign(values)
    apiParams.width = parseInt(widthStr)
    apiParams.height = parseInt(heightStr)
    apiParams.cfg_scale = 7
    apiParams.init_image = inputImgUri?.split(',')[1]
    console.log('submit', apiParams)
    ;(async () => {
      setImgLoading(true)
      setOutputImgUri(await img2img(apiParams))
      setImgLoading(false)
    })()
  }

  return (
    /* when Form submitted, the parent Form.Provider received the submittion via onFormFinish */
    <Form.Provider onFormFinish={onFormSubmit}>
      <Form form={form} name='img2imgForm'>
        <GeneratingMask open={imgLoading} />
        <div
          className={cx(
            styles.wrap,
            'flex flex-col md:flex-row w-full bg-yellow-000 gap-24 mt-8',
          )}
        >
          <div className={cx('flex flex-col flex-1 bg-red-000')}>
            <InputAndGenerateArea />
            <div className={cx('flex h-[788px] gap-2.5')}>
              <ImageInputWidget onChanged={setInputImgUri} />
              <ImageOutputWidget src={outputImgUri} />
            </div>
          </div>
          <SettingsArea />
        </div>
      </Form>
    </Form.Provider>
  )
}

export default Img2img
