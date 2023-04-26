import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Form, Select, InputNumber, Modal, Input, Button, Space } from 'antd'
import { Fragment } from 'react'
import cx from 'classnames'

import SliderSettingItem from 'components/SliderSettingItem'
import modelInfoStore from 'stores/modelInfoStore'
import Icon, { PlusOutlined } from '@ant-design/icons'
import { flushSync } from 'react-dom'
import _ from 'lodash'

import { ReactComponent as IconRecycle } from 'assets/images/icon-recycle.svg'
import { ReactComponent as IconRandom } from 'assets/images/icon-random.svg'
import uiStore from 'stores/uiStore'

interface ModelFormGroupProps {
  label?: string
  name?: string
}
const ModelFormGroup = (props: ModelFormGroupProps) => {
  const modelsData = modelInfoStore.modelInfos.Models.map((model) => {
    return {
      value: model.hash,
      label: model.name,
    }
  })

  return (
    <Form.Item
      label={props.label ? props.label : 'Model'}
      name={props.name ? props.name : 'model'}
      initialValue={modelsData[0].value}
      tooltip={uiStore.isMobile ? '' : 'The model used to generate the image.'}
    >
      <Select size='large' options={modelsData} />
    </Form.Item>
  )
}

interface SelectLoraModal {
  loraInfo?: {
    hash?: string
    weight?: number
  }
  onClose: () => void
  onConfirm: (hash: string, weight: number) => void
}

const SelectLoraModal = (props: SelectLoraModal) => {
  const { loraInfo, onClose, onConfirm } = props

  const loras = useRef(
    modelInfoStore.modelInfos.LoRAs.map((lora) => {
      return {
        value: lora.hash,
        label: lora.name,
      }
    }),
  )

  const [hash, setHash] = useState<string | undefined>(loraInfo?.hash)
  const [weight, setWeight] = useState(loraInfo?.weight ?? 0.7)
  const [loraPreview, setLoraPreview] = useState('')

  const updateLoraPreview = useCallback(() => {
    const loraModelInfo = _.find(modelInfoStore.modelInfos.LoRAs, { hash })
    if (loraModelInfo !== undefined) {
      const modelDetail = modelInfoStore.modelDetails[loraModelInfo.name]
      if (modelDetail !== undefined) {
        const imageUrl = modelDetail.images?.[0]
        if (imageUrl !== undefined) {
          setLoraPreview(imageUrl)
        }
      }
    }
  }, [hash])

  const handleHashChanged = useCallback((hash: string) => {
    setHash(hash)
  }, [])

  const handleWeightChanged = useCallback((weight: number | null) => {
    setWeight(weight || 0.7)
  }, [])

  const handleClickOkButton = useCallback(() => {
    if (hash === undefined) {
      onClose()
      return
    }
    onConfirm(hash, weight)
  }, [hash, onClose, onConfirm, weight])

  useEffect(() => {
    updateLoraPreview()
  }, [updateLoraPreview])

  return (
    <Modal
      open
      centered
      destroyOnClose
      closable
      cancelText='Cancel'
      okText='Confirm'
      onCancel={onClose}
      onOk={handleClickOkButton}
    >
      <div className={cx('flex gap-4 items-center')}>
        <div
          className={cx(
            'w-[200px] h-[200px] flex justify-center items-center bg-neutral-200',
          )}
        >
          {loraPreview === '' ? (
            <span className={cx('text-2xl text-gray-400')}>Preview</span>
          ) : (
            <img
              src={loraPreview}
              alt=''
              className={cx('w-full h-full object-contain')}
            />
          )}
        </div>
        <div
          className={cx(
            'w-full h-full flex flex-1 flex-col justify-center items-start max-w-[250px]',
          )}
        >
          <Form layout='vertical' className={cx('w-full')}>
            <Form.Item label='LoRA'>
              <Select
                className={cx('w-full')}
                size='large'
                placeholder='Choose a LoRA'
                value={hash}
                onChange={handleHashChanged}
              >
                {loras.current.map((lora) => {
                  return (
                    <Select.Option value={lora.value} key={lora.value}>
                      {lora.label}
                    </Select.Option>
                  )
                })}
              </Select>
            </Form.Item>
            <Form.Item label='Weight' style={{ marginBottom: 0 }}>
              <SliderSettingItem
                min={0}
                max={1}
                value={weight}
                onChange={handleWeightChanged}
              />
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  )
}

interface LoraFormItemProps {
  label: string
  loraName: string
  weightName: string
  loraInfo: {
    hash: string
    weight: number
  }
  onClickRemove: () => void
}

const LoraFormItem = (props: LoraFormItemProps) => {
  const { loraInfo } = props

  const form = Form.useFormInstance()

  const [hash, setHash] = useState<string>(loraInfo.hash)
  const [weight, setWeight] = useState<number>(loraInfo.weight)
  const [showModal, setShowModal] = useState(false)

  const loraModelInfo = _.find(modelInfoStore.modelInfos.LoRAs, { hash })

  return (
    <Fragment>
      <Form.Item name={props.loraName} initialValue={hash} className='hidden'>
        <Input />
      </Form.Item>
      <Form.Item
        name={props.weightName}
        initialValue={weight}
        className='hidden'
      >
        <Input />
      </Form.Item>
      <div className={cx('relative')}>
        <Button
          className={cx('w-full')}
          size='large'
          onClick={() => {
            setShowModal(true)
          }}
          style={{
            overflowWrap: 'break-word',
          }}
        >
          <div
            className={cx(
              'max-w-full flex flex-row justify-start items-center',
            )}
          >
            <div className={cx('max-w-[80%] truncate ')}>
              {loraModelInfo?.name}
            </div>
            <div className=''>:{weight}</div>
          </div>
        </Button>
        <Button
          shape='circle'
          icon={
            <PlusOutlined
              className={cx('')}
              style={{ transform: 'rotate(45deg)' }}
            />
          }
          className={cx('absolute -top-4 -right-4 z-[2]')}
          onClick={props.onClickRemove}
        />
      </div>
      {showModal && (
        <SelectLoraModal
          loraInfo={{ hash, weight }}
          onClose={() => {
            setShowModal(false)
          }}
          onConfirm={(hash, weight) => {
            flushSync(() => {
              setHash(hash)
              setWeight(weight)
              setShowModal(false)
            })
            form.setFieldValue(props.loraName, hash)
            form.setFieldValue(props.weightName, weight)
          }}
        />
      )}
    </Fragment>
  )
}

const LoRAFormGroup = () => {
  const [loras, setLoras] = useState<{ hash: string; weight: number }[]>([])
  const [showAddLoRAModal, setShowAddLoRAModal] = useState(false)

  return (
    <Form.Item
      label='LoRA'
      tooltip={
        uiStore.isMobile
          ? ''
          : 'LoRA models are small modifiers of checkpoint models.Mixing multiple LoRA models can have a stacking effect.'
      }
    >
      <div className={cx('flex flex-col gap-4')}>
        {loras.map((lora, i) => {
          const index = i + 1
          return (
            <LoraFormItem
              key={i}
              label={`LoRA${index}`}
              loraName={`lora${index}`}
              weightName={`weight${index}`}
              loraInfo={lora}
              onClickRemove={() => {
                setLoras((prev) => {
                  _.pullAt(prev, [i])
                  return [...prev]
                })
              }}
            />
          )
        })}
      </div>
      {loras.length < 2 && (
        <Button
          className={cx('mt-4 w-full')}
          type='default'
          onClick={() => {
            setShowAddLoRAModal(true)
          }}
        >
          Add LoRA
        </Button>
      )}
      {showAddLoRAModal && (
        <SelectLoraModal
          onClose={() => {
            setShowAddLoRAModal(false)
          }}
          onConfirm={(hash: string, weight: number) => {
            setShowAddLoRAModal(false)
            setLoras((prev) => {
              return [...prev, { hash, weight }]
            })
          }}
        />
      )}
    </Form.Item>
  )
}

interface SamplingFormGroupProps {
  methodName: string
  stepsName: string
}

const SamplingFormGroup = (props: SamplingFormGroupProps) => {
  const samplingMethodsData = modelInfoStore.modelInfos.Samplers.map(
    (sampler) => {
      return {
        value: sampler,
        label: sampler,
      }
    },
  )

  return (
    <Fragment>
      <Form.Item
        tooltip={
          uiStore.isMobile ? '' : 'The name of the sampling algorithm used.'
        }
        label='Sampling Method'
        name={props.methodName}
        initialValue={samplingMethodsData[0].value}
      >
        <Select size='large' options={samplingMethodsData} />
      </Form.Item>
      <Form.Item
        tooltip={
          uiStore.isMobile ? (
            ''
          ) : (
            <div>
              Means sampling steps.
              <br />
              Quality improves as the sampling step increases.
              <br />
              Although the image will still change subtly when stepping through
              to higher values, it will become different but not necessarily
              higher quality.
              <br />
              Recommendation: 20 steps. <br />
              Adjust to higher if you suspect quality is low.
            </div>
          )
        }
        label='Sampling Steps'
        name={props.stepsName}
        initialValue={20}
      >
        <SliderSettingItem min={1} max={100} step={1} />
      </Form.Item>
    </Fragment>
  )
}

interface SeedFormGroupProps {
  seedName: string
  onClickRandomSeed: () => void
  onClickLastSeed: () => void
}

const SeedFormGroup = (props: SeedFormGroupProps) => {
  return (
    <div className={cx('flex justify-start items-end gap-2 mb-6')}>
      <Form.Item
        label='Seed'
        name={props.seedName}
        initialValue={-1}
        className={cx('flex-1 mb-0')}
        tooltip={
          uiStore.isMobile ? (
            ''
          ) : (
            <div>
              The seed determines the initial random noise, which is what
              determines the final image.
              <br />
              -1 for a random seed.
            </div>
          )
        }
      >
        <InputNumber size='large' style={{ width: '100%' }} controls={false} />
      </Form.Item>
      <Button
        icon={<Icon component={IconRandom} />}
        size='large'
        className={cx('!w-[40px] flex-shrink-0')}
        title='Set seed to -1, which will cause a new random number to be used every time'
        onClick={props.onClickRandomSeed}
      />
      <Button
        icon={<Icon component={IconRecycle} />}
        size='large'
        className={cx('!w-[40px] flex-shrink-0')}
        title='Reuse seed from last generation, mostly useful if it was randomed'
        onClick={props.onClickLastSeed}
      />
    </div>
  )
}

interface CFGFormGroupProps {
  scaleName: string
}

const CFGFormGroup = (props: CFGFormGroupProps) => {
  return (
    <Fragment>
      <Form.Item
        label='CFG Scale'
        name={props.scaleName}
        initialValue={7}
        tooltip={
          uiStore.isMobile ? (
            ''
          ) : (
            <div>
              Classifier Free Guidance scale is a parameter to control how much
              the model should respect your prompt.
              <br />
              Smaller values result in higher quality images, and larger values
              yield images closer to the provided prompt.
              <br />
              Recommendation: Starts with 7.
            </div>
          )
        }
      >
        <SliderSettingItem min={1} max={30} step={0.5} />
      </Form.Item>
    </Fragment>
  )
}

export {
  ModelFormGroup,
  LoRAFormGroup,
  SamplingFormGroup,
  SeedFormGroup,
  CFGFormGroup,
}
