import React from 'react'
import cx from 'classnames'
import { Modal, Spin } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

import styles from './index.module.css'
import { Task, getTaskStatusDesc } from 'typings/Task'

interface GeneratingMaskProps {
  open: boolean
  defaultTip?: string
  task?: Task
}

const GeneratingMask = ({ open, defaultTip, task }: GeneratingMaskProps) => {
  const icon = <LoadingOutlined style={{ fontSize: 36 }} spin />
  const tip = task ? (
    <div className={cx('text-[#333] font-bold py-2')}>
      <div>{`Status: ${task.status} - ${getTaskStatusDesc(task.status)}`}</div>
      <div>{`QueuePosition: ${task.queuePosition}`}</div>
    </div>
  ) : (
    <div className={cx('text-[#333] font-bold py-2')}>
      {defaultTip ?? 'Loading...'}
    </div>
  )

  return (
    <Modal
      open={open}
      closeIcon={<div></div>}
      maskClosable={false}
      footer={null}
      width={248}
      centered={true}
    >
      <div className={cx('flex flex-col justify-center items-center py-2')}>
        <Spin className={cx(styles.spin)} indicator={icon} tip={tip} />
      </div>
    </Modal>
  )
}

export default GeneratingMask
