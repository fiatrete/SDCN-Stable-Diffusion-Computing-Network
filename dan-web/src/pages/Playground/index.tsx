import React from 'react'
import { Tabs } from 'antd'
import type { TabsProps } from 'antd'
import Txt2img from 'components/Txt2img'
import Img2img from 'components/Img2img'
import cx from 'classnames'

import styles from './index.module.css'
import Interrogate from 'components/Interrogate'

const items: TabsProps['items'] = [
  {
    key: '1',
    label: `txt2img`,
    children: <Txt2img />,
  },
  {
    key: '2',
    label: `img2img`,
    children: <Img2img />,
  },
  {
    key: '3',
    label: `interrogate`,
    children: <Interrogate />,
  },
]

const Playground = () => {
  return (
    <div className={cx(styles.wrap)}>
      <Tabs className={cx(styles.tabs)} defaultActiveKey='1' items={items} />
    </div>
  )
}

export default Playground
