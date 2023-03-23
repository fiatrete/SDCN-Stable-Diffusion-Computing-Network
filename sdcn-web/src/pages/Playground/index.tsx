import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import Txt2img from 'components/Txt2img';
import cx from 'classnames'

import styles from './index.module.css';

const items: TabsProps['items'] = [
  {
    key: '1',
    label: `txt2img`,
    children: <Txt2img />
  },
  {
    key: '2',
    label: `img2img`,
    children: `img2img content`,
    disabled: true,
  },
];

const Playground = () => {
  return (
    <div className={cx(styles.wrap)}>
      <Tabs className={cx(styles.tabs)} defaultActiveKey="1" items={items} />
    </div>
  )
}

export default Playground

