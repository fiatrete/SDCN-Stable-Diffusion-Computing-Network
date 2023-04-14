import React, { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'

import { UserRole } from 'typings/User'
import userStore from 'stores/userStore'

interface Props {
  children: ReactElement
  userRole: UserRole
}

const CheckRole = ({ children, userRole }: Props) => {
  if (userStore.user.role !== userRole) {
    return <Navigate to='/' />
  }
  return children
}

export default CheckRole
