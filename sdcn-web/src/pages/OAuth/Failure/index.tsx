import React, { useEffect } from 'react'
import cx from 'classnames'
import { useLocation } from 'react-router-dom'

const OAuthFailure = () => {
  const location = useLocation()
  const urlSearchParams = new URLSearchParams(location.search)
  const reason = urlSearchParams.get('reason')

  useEffect(() => {
    setTimeout(() => {
      window.close()
    }, 3000)
  }, [])

  return (
    <div className={cx('flex justify-center mt-48 text-xl text-gray-600')}>
      {reason || 'Sign In Failed, Please try again.'}
    </div>
  )
}

export default OAuthFailure
