import React, { useCallback, useEffect, useState } from 'react'
import { Form, Tabs } from 'antd'
import cx from 'classnames'
import { observer } from 'mobx-react-lite'

import styles from './index.module.css'

import Txt2img from 'components/Txt2img'
import Img2img from 'components/Img2img'
import Interrogate from 'components/Interrogate'
import Inpainting from 'components/Inpainting'

import uiStore from 'stores/uiStore'
import { getModelDetails, getSupportedModelInfo } from 'api/playground'
import { LoadingOutlined } from '@ant-design/icons'
import { flushSync } from 'react-dom'
import modelInfoStore from 'stores/modelInfoStore'
import _ from 'lodash'
import playgroundStore from 'stores/playgroundStore'

const Playground = () => {
  const [txt2imgForm] = Form.useForm()
  const [img2imgForm] = Form.useForm()
  const [inpaintingForm] = Form.useForm()

  playgroundStore.putForm('txt2img', txt2imgForm)
  playgroundStore.putForm('img2img', img2imgForm)
  playgroundStore.putForm('inpainting', inpaintingForm)

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

  useEffect(() => {
    getModelDetails()
      .then((result) => {
        modelInfoStore.modelDetails = _.cloneDeep(result)
      })
      .catch(() => {
        // -
      })
  }, [])

  const onTabChange = useCallback((activeKey: string) => {
    playgroundStore.activePlaygroundTabKey = activeKey
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
          onChange={onTabChange}
          activeKey={playgroundStore.activePlaygroundTabKey ?? 'txt2img'}
          items={[
            {
              key: 'txt2img',
              label: `txt2img`,
              children: <Txt2img form={txt2imgForm} />,
            },
            {
              key: 'img2img',
              label: `img2img`,
              children: <Img2img form={img2imgForm} />,
            },
            {
              key: 'inpainting',
              label: `inpainting`,
              children: <Inpainting form={inpaintingForm} />,
            },
            {
              key: 'interrogate',
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
