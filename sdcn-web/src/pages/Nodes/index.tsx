import React, { useCallback } from 'react'
import cx from 'classnames'

import styles from './index.module.css'
import NodeList from './NodeList'
import DonorList from './DonorList'
import { Button, Modal } from 'antd'
import MyNodes from './MyNodes'
import DonateNode from './DonateNode'

const Nodes = () => {
  const handleDonateNode = useCallback(() => {
    Modal.info({
      title: 'Donate Node',
      closable: true,
      icon: null,
      footer: null,
      transitionName: '',
      width: 368,
      content: <DonateNode />,
    })
  }, [])

  const handleMyNodesButton = useCallback(() => {
    Modal.info({
      title: 'My Nodes',
      closable: true,
      icon: null,
      footer: null,
      transitionName: '',
      width: 757,
      content: <MyNodes />,
    })
  }, [])

  return (
    <div className={cx(styles.wrap)}>
      <div className={cx(styles.contentWrap)}>
        <NodeList />
        <DonorList />
        <div className={cx('flex justify-center gap-4')}>
          <Button type='primary' onClick={handleDonateNode}>
            Donate Node
          </Button>
          <Button onClick={handleMyNodesButton}>My Nodes</Button>
        </div>
      </div>
    </div>
  )
}

export default Nodes
