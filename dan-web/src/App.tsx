import React, { useLayoutEffect, useEffect } from 'react'
import cx from 'classnames'
import { Outlet } from 'react-router-dom'
import ReactGA from 'react-ga4'

import 'antd/dist/reset.css'
import 'App.css'

import Footer from 'components/Footer'
import HeaderForPC from 'components/HeaderForPC'
import HeaderForMobile from 'components/HeaderForMobile'
import { env } from 'env'
import { observer } from 'mobx-react-lite'
import uiStore from 'stores/uiStore'
import to from 'await-to-js'
import { AxiosError } from 'axios'
import { updatePublicApiKey } from 'api/user'
import config from 'api/config'
import useUser from 'hooks/useUser'
import { message } from 'antd'
import userStore from 'stores/userStore'

function App() {
  console.log(env)

  try {
    ReactGA.initialize(env.REACT_APP_GOOGLE_ANALYTICS_ID)
  } catch (error) {
    console.error(error)
  }

  const { updateUser } = useUser()

  useLayoutEffect(() => {
    const handleWindowResize = () => {
      if (window.innerWidth < 768) {
        uiStore.isMobile = true
      } else {
        uiStore.isMobile = false
      }

      console.log('isMobile', uiStore.isMobile)
    }

    handleWindowResize()
    window.addEventListener('resize', handleWindowResize)

    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  useEffect(() => {
    // Public Api Key
    const _updatePublicApiKey = async () => {
      const [_error, _publicApiKey] = await to<string, AxiosError>(
        updatePublicApiKey(),
      )

      if (_error !== null) {
        console.error('UpdatePublicApiKeyError', _error)
        return
      }

      if (_publicApiKey) {
        config.setPublicApiKey(_publicApiKey)
      }
    }

    // User
    const _updateUserInfo = async () => {
      await updateUser()

      if (userStore.user.firstTimeLogin) {
        message.success(`100 honors as a gift for your registration`)
      }
    }

    _updatePublicApiKey()
    _updateUserInfo()
  }, [updateUser])

  return (
    <div className={cx('App min-h-full w-full flex flex-col')}>
      {uiStore.isMobile ? <HeaderForMobile /> : <HeaderForPC />}
      <Outlet />
      <Footer />
    </div>
  )
}

export default observer(App)
