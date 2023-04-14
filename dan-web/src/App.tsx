import React, { useLayoutEffect } from 'react'
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

function App() {
  console.log(env)

  try {
    ReactGA.initialize(env.REACT_APP_GOOGLE_ANALYTICS_ID)
  } catch (error) {
    console.error(error)
  }

  useLayoutEffect(() => {
    const handleWindowResize = () => {
      if (window.innerWidth < 768) {
        uiStore.isMobile = true
      } else {
        uiStore.isMobile = false
      }
    }

    handleWindowResize()
    window.addEventListener('resize', handleWindowResize)

    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  return (
    <div className={cx('App min-h-full w-full flex flex-col')}>
      {uiStore.isMobile ? <HeaderForMobile /> : <HeaderForPC />}
      <Outlet />
      <Footer />
    </div>
  )
}

export default observer(App)
