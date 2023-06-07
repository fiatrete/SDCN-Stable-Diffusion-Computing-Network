import React, { useCallback, useEffect, useState } from 'react'
import { Form, Modal, Tabs, Image } from 'antd'
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

import imgStarGithub from 'assets/images/star_github.jpeg'

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

  // AdModal
  const getNowFormatDate = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    let strMonth = month.toString()
    let strDay = day.toString()
    if (month >= 1 && month <= 9) {
      strMonth = '0' + month
    }
    if (day >= 0 && day <= 9) {
      strDay = '0' + day
    }
    const currentdate = year + strMonth + strDay
    return currentdate
  }

  const [callbackFunc, setCallbackFunc] = useState<(() => void) | undefined>(
    undefined,
  )
  const [isModalOpened, setIsModalOpened] = useState(false)

  const handleAdModal = useCallback((callback: () => void) => {
    const latestAdDate = localStorage.getItem('LATEST_AD_DATE')
    const nowDate = getNowFormatDate()
    if (latestAdDate === nowDate) {
      callback()
      return
    }

    setCallbackFunc(callback)
    setIsModalOpened(true)
    localStorage.setItem('LATEST_AD_DATE', nowDate)
  }, [])

  const handleGotoGithub = useCallback(() => {
    window.open('https://github.com/fiatrete/OpenDAN-Personal-AI-OS', '_blank')

    setIsModalOpened(false)
    if (callbackFunc) callbackFunc
  }, [callbackFunc])

  const handleModalClose = useCallback(() => {
    setIsModalOpened(false)
    if (callbackFunc) callbackFunc
  }, [callbackFunc])

  return (
    <>
      <div
        className={cx(
          uiStore.isMobile ? [styles.wrapForMobile] : [styles.wrap],
        )}
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
                children: (
                  <Txt2img form={txt2imgForm} showAdModel={handleAdModal} />
                ),
              },
              {
                key: 'img2img',
                label: `img2img`,
                children: (
                  <Img2img form={img2imgForm} showAdModel={handleAdModal} />
                ),
              },
              {
                key: 'inpainting',
                label: `inpainting`,
                children: (
                  <Inpainting
                    form={inpaintingForm}
                    showAdModel={handleAdModal}
                  />
                ),
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

      <Modal
        open={isModalOpened}
        destroyOnClose={true}
        title=''
        onCancel={handleModalClose}
        footer={null}
        width={600}
        maskClosable={false}
      >
        <div className={cx('mt-6')}>
          <div className={cx('text-3xl font-medium')}>
            Thank you for your support.
          </div>
          <Image
            src={imgStarGithub}
            width={'100%'}
            preview={true}
            className={cx('mt-4')}
          />
          <ol className={cx('mt-6 font-medium')}>
            <li>
              <div>
                Thank you very much for using our service. Please follow the
                instructions in the picture above and click on the star button
                to follow our GitHub project
              </div>
              <div>
                (if you have already starred it, please ignore this message).{' '}
              </div>
            </li>
            <li>
              OpenDAN is an open-source AI operating system, while SDCN is an
              application running on top of this OS.
            </li>
          </ol>
          <div className={cx('mt-6 mb-3', 'flex justify-center items-center')}>
            <button
              className={cx(
                'bg-[#ffcc00] hover:bg-[#ffbb00] text-red-500 text-lg font-medium',
                'px-4 py-1.5',
                'border-none rounded-2xl',
                'cursor-pointer',
              )}
              onClick={handleGotoGithub}
            >
              Goto GitHub
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default observer(Playground)
