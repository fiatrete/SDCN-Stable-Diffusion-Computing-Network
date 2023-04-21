import React, { useEffect, useState } from 'react'
import { Tabs } from 'antd'
import cx from 'classnames'
import { observer } from 'mobx-react-lite'

import styles from './index.module.css'

import Txt2img from 'components/Txt2img'
import Img2img from 'components/Img2img'
import Interrogate from 'components/Interrogate'
import Inpainting from 'components/Inpainting'

import uiStore from 'stores/uiStore'
import { getSupportedModelInfo } from 'api/playground'
import { LoadingOutlined } from '@ant-design/icons'
import { flushSync } from 'react-dom'
import modelInfoStore from 'stores/modelInfoStore'
import _ from 'lodash'

const Playground = () => {
  const [isModelInfoInitialized, setIsModelInfoInitialized] = useState(false)

  useEffect(() => {
    getSupportedModelInfo()
      .then((result) => {
        flushSync(() => {
          modelInfoStore.modelInfos = _.cloneDeep(result)
          setIsModelInfoInitialized(true)
        })
      })
      .catch(() => {
        // -
      })
  }, [])

  return (
    <div
      className={cx(uiStore.isMobile ? [styles.wrapForMobile] : [styles.wrap])}
    >
      {isModelInfoInitialized === false && (
        <LoadingOutlined style={{ fontSize: 40, marginTop: 150 }} />
      )}
      {isModelInfoInitialized && (
        <Tabs
          className={cx(
            uiStore.isMobile ? [styles.tabsForMobile] : [styles.tabs],
          )}
          defaultActiveKey='1'
          items={[
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
              label: `inpainting`,
              children: <Inpainting />,
            },
            {
              key: '4',
              label: `interrogate`,
              children: <Interrogate />,
            },
          ]}
        />
      )}
    </div>
  )
}

export default observer(Playground)
