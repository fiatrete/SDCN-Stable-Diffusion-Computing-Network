import React from 'react'
import cx from 'classnames'
import { Navigate, Route, Routes } from 'react-router-dom'

import 'antd/dist/reset.css'
import 'App.css'

import Footer from 'components/Footer'
import Header from 'components/Header'
import Nodes from 'pages/Nodes'
import Playground from 'pages/Playground'
import Portal from 'pages/Portal'

function App() {
  return (
    <div className={cx('App min-h-full w-full flex flex-col')}>
      <Header />
      <Routes>
        <Route path='/' element={<Portal />} />
        <Route path='/play' element={<Playground />} />
        <Route path='/nodes' element={<Nodes />} />
        <Route path='*' element={<Navigate replace to='/' />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
