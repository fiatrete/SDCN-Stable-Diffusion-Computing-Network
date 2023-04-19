import React, { Fragment, useCallback, useRef, useState } from 'react'
import cx from 'classnames'
import check from 'check-types'
import {
  Form,
  Select,
  Button,
  Input,
  Typography,
  message,
  InputNumber,
} from 'antd'
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
import { observer } from 'mobx-react-lite'
import { flushSync } from 'react-dom'

import styles from './index.module.css'

import uiStore from 'stores/uiStore'
import Paint from 'components/Paint'

const { Title } = Typography
const { TextArea } = Input

function calcImgSize(
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

const Inpainting = () => {
  const [form] = Form.useForm()
  const [outputImgUri, setOutputImgUri] = useState<string | undefined>()
  const [inputImg, setInputImg] = useState<string>('')
  const [inputImgSize, setInputImgSize] = useState({
    width: 0,
    height: 0,
  })
  const [imgLoading, setImgLoading] = useState<boolean>(false)
  const [showPaint, setShowPaint] = useState(false)
  const inpaintMaskRef = useRef('')

  const onFormSubmit = useCallback(
    async (name: string, { values }: FormFinishInfo) => {
      try {
        check.assert(inputImg, 'input image must be existed')

        setImgLoading(true)
        // Get input image size
        const [widthStr, heightStr] = values.size.split('x')
        delete values.size
        const inWid: number = values.input_width
        delete values.input_width
        const inHei: number = values.input_height
        delete values.input_height

        const apiParams: img2imgParams = Object.assign(values)

        const setWid = parseInt(widthStr)
        const setHei = parseInt(heightStr)
        // Set submit image size
        const [subWidth, subHeight] = calcImgSize(inWid, inHei, setWid, setHei)
        apiParams.width = subWidth
        apiParams.height = subHeight

        apiParams.cfg_scale = 7
        apiParams.init_image = inputImg?.split(',')[1]

        if (inpaintMaskRef.current !== '') {
          apiParams.inpaint = {
            mask: inpaintMaskRef.current,
            mask_blur: 0,
            mask_mode: 0,
            inpaint_area: 0,
          }
        }
        //console.log('submit', apiParams)

        setOutputImgUri(await img2img(apiParams))
      } catch (err) {
        if (err instanceof String) message.error(err)
        if (err instanceof Error) message.error(err.message)
      } finally {
        setImgLoading(false)
      }
    },
    [inputImg],
  )

  const onInputSize = useCallback(
    (width: number, height: number) => {
      form.setFieldValue('input_width', width)
      form.setFieldValue('input_height', height)
      console.log('onInputSize', width, height)
      flushSync(() => {
        setInputImgSize({
          width,
          height,
        })
        setShowPaint(true)
      })
    },
    [form],
  )

  const handlePaintUpdate = useCallback((data: string) => {
    inpaintMaskRef.current = data
  }, [])

  const handlePaintClose = useCallback(() => {
    setShowPaint(false)
    inpaintMaskRef.current = ''
  }, [])

  return (
    /* when Form submitted, the parent Form.Provider received the submittion via onFormFinish */
    <Form.Provider onFormFinish={onFormSubmit}>
      <Form form={form} name='img2imgForm' layout='vertical'>
        <GeneratingMask open={imgLoading} />
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
                : ['flex flex-col flex-1'],
            )}
          >
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
            <div
              className={cx(
                uiStore.isMobile
                  ? ['flex flex-col gap-2.5']
                  : ['flex h-[388px] gap-2.5'],
              )}
            >
              {showPaint === false && (
                <ImageInputWidget
                  onChanged={setInputImg}
                  onSize={onInputSize}
                />
              )}
              {showPaint && (
                <div
                  className={cx(
                    'relative w-full h-full flex justify-center items-center',
                  )}
                >
                  <Paint
                    width={inputImgSize.width}
                    height={inputImgSize.height}
                    image={inputImg}
                    onUpdate={handlePaintUpdate}
                    onClose={handlePaintClose}
                  />
                </div>
              )}
              <ImageOutputWidget src={outputImgUri} />
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

              <Form.Item
                label='Denoising strength'
                name='denoising_strength'
                initialValue={0.5}
              >
                <SliderSettingItem />
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

export default observer(Inpainting)
