import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import 'index.css'

import App from 'App'
import Playground from 'pages/Playground'
import Nodes from 'pages/Nodes'
import Portal from 'pages/Portal'
import OAuthSuccess from 'pages/OAuth/Success'
import OAuthFailure from 'pages/OAuth/Failure'
import ApiReference from 'pages/ApiReference'
import Account from 'pages/Account'
import Reward from 'pages/Reward'
import CheckAuth from 'components/CheckAuth'
import CheckRole from 'components/CheckRole'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />}>
        <Route index element={<Portal />} />
        <Route path='play' element={<Playground />} />
        <Route path='nodes' element={<Nodes />} />
        <Route path='api-reference' element={<ApiReference />} />
        <Route
          path='account'
          element={
            <CheckAuth>
              <Account />
            </CheckAuth>
          }
        />
        <Route
          path='reward'
          element={
            <CheckAuth>
              <CheckRole userRole={1}>
                <Reward />
              </CheckRole>
            </CheckAuth>
          }
        />
      </Route>
      <Route path='/oauth/success' element={<OAuthSuccess />} />
      <Route path='/oauth/failure' element={<OAuthFailure />} />
      <Route path='*' element={<Navigate replace to='/' />} />
    </Routes>
  </BrowserRouter>,
)
