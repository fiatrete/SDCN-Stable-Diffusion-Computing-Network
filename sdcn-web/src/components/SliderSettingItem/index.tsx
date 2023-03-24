import React from 'react'
import cx from 'classnames'
import { InputNumber, Slider } from 'antd'

import styles from './index.module.css'

function SliderSettingItem(props: any) {
  const onChange = (value: number | null) => {
    props.onChange(value)
  }

  return (
    <div className={cx(styles.wrap + ' flex')}>
      <div className={cx('flex-1 text-base leading-6 h-10 items-center')}>
        <Slider
          min={props.min ? props.min : 0}
          max={props.max ? props.max : 1}
          step={props.step ? props.step : 0.01}
          onChange={onChange}
          value={typeof props.value === 'number' ? props.value : 0}
        />
      </div>
      <InputNumber
        size='large'
        min={props.min ? props.min : 0}
        max={props.max ? props.max : 1}
        step={props.step ? props.step : 0.01}
        controls={false}
        value={props.value}
        onChange={onChange}
      />
    </div>
  )
}

export default SliderSettingItem
