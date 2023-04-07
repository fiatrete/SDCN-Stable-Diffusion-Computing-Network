import React from 'react'
import cx from 'classnames'
import { Outlet } from 'react-router-dom'

import 'antd/dist/reset.css'
import 'App.css'
import ReactGA from 'react-ga4'

import Footer from 'components/Footer'
import Header from 'components/Header'

function App() {
  ReactGA.initialize('G-KEQX55HT1W')

  return (
    <div className={cx('App min-h-full w-full flex flex-col')}>
      <Header />
      <Outlet />
      <Footer />
    </div>
  )
}

export default App
