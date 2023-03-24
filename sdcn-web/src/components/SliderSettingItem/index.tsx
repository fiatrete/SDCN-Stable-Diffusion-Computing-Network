import React from 'react'
import cx from 'classnames'
import { InputNumber, Slider } from 'antd'

import styles from './index.module.css'

function SliderSettingItem({
  min,
  max,
  step,
  value,
  onChange,
}: {
  min?: number
  max?: number
  step?: number
  value?: number
  onChange?: (value: number | null) => void
}) {
  return (
    <div className={cx(styles.wrap + ' flex')}>
      <div className={cx('flex-1 text-base leading-6 h-10 items-center')}>
        <Slider
          min={min ? min : 0}
          max={max ? max : 1}
          step={step ? step : 0.01}
          onChange={onChange}
          value={typeof value === 'number' ? value : 0}
        />
      </div>
      <InputNumber
        size='large'
        min={min ? min : 0}
        max={max ? max : 1}
        step={step ? step : 0.01}
        controls={false}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default SliderSettingItem
