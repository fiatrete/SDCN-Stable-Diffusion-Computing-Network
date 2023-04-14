import React, { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'

import userStore from 'stores/userStore'

interface Props {
  children: ReactElement
}

const CheckAuth = ({ children }: Props) => {
  if (userStore.isLoggedIn === false) {
    return <Navigate to='/' />
  }
  return children
}

export default CheckAuth
