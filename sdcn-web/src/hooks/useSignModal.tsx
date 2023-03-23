import React from 'react'
import { Modal, Image, Button, Spin, ModalFuncProps, message } from 'antd'
import cx from 'classnames'
import logo from 'assets/images/logo.svg'
import {
  GithubOutlined,
  GoogleOutlined,
  LoadingOutlined,
} from '@ant-design/icons'

const useSignModal = () => {
  const spinIcon = (
    <LoadingOutlined style={{ fontSize: 36, color: '#FFF' }} spin />
  )

  const signInWithGoogleHandler = () => {
    console.log('GOOGLE')

    // TODO: SIGN IN WITH GOOGLE
    setLoading(true)
    setTimeout(() => {
      setLoading(false)

      message.success('SUCCESS')

      hideSignModel()
    }, 2000)
  }

  const signInWithGithubHandler = () => {
    console.log('GITHUB')

    // TODO: SIGN IN WITH GITHUB
    setLoading(true)
    setTimeout(() => {
      setLoading(false)

      message.error('FAILURE')
    }, 2000)
  }

  let modal: {
    destroy: () => void
    update: (
      configUpdate:
        | ModalFuncProps
        | ((prevConfig: ModalFuncProps) => ModalFuncProps),
    ) => void
  } | null = null

  const setLoading = (loading: boolean) => {
    modal?.update((prevConfig) => ({
      ...prevConfig,
      content: buildContent(loading),
    }))
  }

  const buildContent = (loading: boolean) => {
    return (
      <div
        className={cx('flex flex-col justify-center')}
        style={{ height: '254px' }}
      >
        <div className={cx('flex')}>
          <div className={cx('grow flex justify-center')}>
            <Image src={logo} width={200} preview={false} />
          </div>
          <div className={cx('grow flex flex-col justify-center gap-3')}>
            <Button
              type='default'
              size='large'
              icon={<GoogleOutlined />}
              onClick={signInWithGoogleHandler}
            >
              Sign In with Google
            </Button>
            <Button
              type='default'
              size='large'
              icon={<GithubOutlined />}
              onClick={signInWithGithubHandler}
            >
              Sign In with Github
            </Button>
          </div>
        </div>

        {loading ? (
          <Spin
            indicator={spinIcon}
            className={cx(
              'absolute top-0 left-0 w-full h-full rounded-lg bg-black/60 flex justify-center items-center',
            )}
          />
        ) : null}
      </div>
    )
  }

  const showSignModel = () => {
    modal = Modal.info({
      title: '',
      closable: true,
      icon: null,
      footer: null,
      transitionName: '',
      style: { top: '30%' },
      width: 580,
      afterClose: () => {
        modal = null
      },
      content: buildContent(false),
    })
  }

  const hideSignModel = () => {
    modal?.destroy()
  }

  return {
    showSignModel,
    hideSignModel,
  }
}

export default useSignModal
