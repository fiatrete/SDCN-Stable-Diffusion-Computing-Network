import React from 'react'
import { Form, Select, InputNumber } from 'antd'
import SliderSettingItem from 'components/SliderSettingItem'
import { Fragment } from 'react'

export const modelsData = [
  {
    value: '3a17d0deffa4592fd91c711a798031a258ab44041809ade8b4591c0225ea9401',
    label: 'chillout_mix',
  },
  {
    value: '627a6f5c8bf7669d4a224ac041d527debc65d2d435b16e54ead8ee2c901d1634',
    label: 'clarity',
  },
  {
    value: '6e430eb51421ce5bf18f04e2dbe90b2cad437311948be4ef8c33658a73c86b2a',
    label: 'anything-v4.5-pruned',
  },
]

interface ModelFormGroupProps {
  label?: string
  name?: string
}
const ModelFormGroup = (props: ModelFormGroupProps) => {
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

export const lorasData = [
  {
    value: '62efe75048d55a096a238c6e8c4e12d61b36bf59e388a90589335f750923954c',
    label: 'koreanDollLikeness_v10',
  },
  {
    value: 'f1efd7b748634120b70343bc3c3b425c06c51548431a1264a2fcb5368352349f',
    label: 'stLouisLuxuriousWheels_v1',
  },
  {
    value: '5bbaabc04553d5821a3a45e4de5a02b2e66ecb00da677dd8ae862efd8ba59050',
    label: 'taiwanDollLikeness_v10',
  },
  {
    value: '3e5d8fe726b4c0f1e7f0905f32ea3d1c9ce89a54028209e8179d64d323048dac',
    label: 'kobeni_v10',
  },
  {
    value: '759d6fdf539f44f6991efd27ef1767c7779ac8884defc71dd909e5808b5ea74b',
    label: 'thickerLinesAnimeStyle_loraVersion',
  },
]
interface LoraFormGroupProps {
  label: string
  loraName: string
  weightName: string
}
const LoraFormGroup = (props: LoraFormGroupProps) => {
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

export const samplingMethodsData = [
  { value: 'DPM++ SDE Karras', label: 'DPM++ SDE Karras' },
  { value: 'Euler a', label: 'Euler a' },
  { value: 'Euler', label: 'Euler' },
  { value: 'DPM++ SDE', label: 'DPM++ SDE' },
  { value: 'LMS', label: 'LMS' },
  { value: 'DDIM', label: 'DDIM' },
]
interface SamplingFormGroupProps {
  methodName: string
  stepsName: string
  seedName: string
}

const SamplingFormGroup = (props: SamplingFormGroupProps) => {
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
