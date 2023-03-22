import React from 'react'
import { Button } from 'antd'
import cx from 'classnames'
import { useNavigate } from 'react-router-dom'

import styles from './index.module.css'

const Playground = () => {
  const navigate = useNavigate()

  return (
    <div className={cx(styles.wrap)}>
      <p>Playground</p>
      <Button
        type='primary'
        onClick={() => {
          navigate('/')
        }}
      >
        go to portal
      </Button>
    </div>
  )
}

export default Playground
