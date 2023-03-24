import React, { useRef, useEffect, useState } from 'react'
import cx from 'classnames'
import { Form, Select, Button, Input, Typography } from 'antd'
import {
  ModelFormGroup,
  LoraFormGroup,
  SamplingFormGroup,
} from 'components/SettingsFormGroup'
import txt2img from 'api/txt2img'

import ImageWidget from 'components/ImageWidget'

import styles from './index.module.css'

const { Title } = Typography
const { TextArea } = Input

function InputAndGenerateArea(props: any) {
  return (
    <div className={cx('flex flex-col items-start gap-6')}>
      <Title level={5}>Input keyword and generate</Title>
      <div className={cx('flex flex-col w-full items-start gap-6')}>
        <Form
          ref={props.promptRef}
          name='txt2imgPromptForm'
          style={{ width: '100%' }}
        >
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
        </Form>
        <Button type='primary' ref={props.buttonRef} size='large'>
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

function SettingsArea(props: any) {
  return (
    <div className={cx('flex flex-col w-80 gap-6 bg-green-000')}>
      <Title level={5}>Settings</Title>
      <Form
        ref={props.settingsRef}
        name='txt2imgSettingsForm'
        layout='vertical'
      >
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
      </Form>
    </div>
  )
}

const Txt2img = () => {
  const GenerateButtonRef = useRef<HTMLButtonElement>(null)
  const SettingsFormRef = useRef<HTMLFormElement>(null)
  const PromptFormRef = useRef<HTMLFormElement>(null)

  const [imgUri, setImgUri] = useState<string | undefined>()
  const [imgLoading, setImgLoading] = useState<boolean>(false)

  useEffect(() => {
    if (GenerateButtonRef.current)
      // Bind click event
      GenerateButtonRef.current.onclick = onGenerationButtonClicked
  })

  const onGenerationButtonClicked = () => {
    // First form submit
    if (SettingsFormRef.current) SettingsFormRef.current.submit()
    // Second form submit
    if (PromptFormRef.current) PromptFormRef.current.submit()
  }

  let formData: any = {} // For merging form data

  const onFormSubmit = (name: any, { values }: any) => {
    if (name === 'txt2imgSettingsForm') {
      // Received data in first submit, partial data
      formData = Object.assign(values)
      console.log('first submit', formData)
    }
    if (name === 'txt2imgPromptForm') {
      // Received data in second submit, full data
      formData = Object.assign(formData, values)
      const [width, height] = formData.size.split('x')
      delete formData.size
      formData.width = width
      formData.height = height
      formData.cfg_scale = '7'
      console.log('second submit, merged', formData)
      ;(async () => {
        setImgLoading(true)
        setImgUri(await txt2img(formData))
        setImgLoading(false)
      })()
    }
  }

  return (
    /* when Form submitted, the parent Form.Provider received the submittion via onFormFinish */
    <Form.Provider onFormFinish={onFormSubmit}>
      <div
        className={cx(
          styles.wrap +
            ' flex flex-col md:flex-row w-full bg-yellow-000 gap-24 mt-8',
        )}
      >
        <div className={cx('flex flex-col flex-1 bg-red-000')}>
          <InputAndGenerateArea
            buttonRef={GenerateButtonRef}
            promptRef={PromptFormRef}
          />
          <ImageWidget src={imgUri} loading={imgLoading} />
        </div>
        <SettingsArea settingsRef={SettingsFormRef} />
      </div>
    </Form.Provider>
  )
}

export default Txt2img
