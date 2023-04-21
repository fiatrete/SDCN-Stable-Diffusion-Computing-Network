import React from 'react'
import { Form, Select, InputNumber } from 'antd'
import SliderSettingItem from 'components/SliderSettingItem'
import { Fragment } from 'react'
import modelInfoStore from 'stores/modelInfoStore'

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
    >
      <Select size='large' options={modelsData} />
    </Form.Item>
  )
}

interface LoraFormGroupProps {
  label: string
  loraName: string
  weightName: string
}

const LoraFormGroup = (props: LoraFormGroupProps) => {
  const lorasData = modelInfoStore.modelInfos.LoRAs.map((lora) => {
    return {
      value: lora.hash,
      label: lora.name,
    }
  })

  return (
    <Fragment>
      <Form.Item label={props.label} name={props.loraName}>
        <Select
          size='large'
          options={lorasData}
          placeholder='Select a LoRA'
          allowClear={true}
        />
      </Form.Item>
      <Form.Item label='Weight' name={props.weightName} initialValue={0.7}>
        <SliderSettingItem />
      </Form.Item>
    </Fragment>
  )
}

interface SamplingFormGroupProps {
  methodName: string
  stepsName: string
  seedName: string
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
        label='Sampling Method'
        name={props.methodName}
        initialValue={samplingMethodsData[0].value}
      >
        <Select size='large' options={samplingMethodsData} />
      </Form.Item>
      <Form.Item
        label='Sampling Steps'
        name={props.stepsName}
        initialValue={20}
      >
        <SliderSettingItem min={1} max={100} step={1} />
      </Form.Item>
      <Form.Item label='Seed' name={props.seedName} initialValue={-1}>
        <InputNumber size='large' style={{ width: '100%' }} controls={false} />
      </Form.Item>
    </Fragment>
  )
}

interface CFGFormGroupProps {
  scaleName: string
}

const CFGFormGroup = (props: CFGFormGroupProps) => {
  return (
    <Fragment>
      <Form.Item label='CFG Scale' name={props.scaleName} initialValue={7}>
        <SliderSettingItem min={1} max={30} step={0.5} />
      </Form.Item>
    </Fragment>
  )
}

export { ModelFormGroup, LoraFormGroup, SamplingFormGroup, CFGFormGroup }
