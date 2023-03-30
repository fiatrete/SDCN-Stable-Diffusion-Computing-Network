import { Button, Popconfirm } from 'antd'
import React from 'react'
import { NodeStatus } from 'typings/Node'

export type NodeActionHandler = () => void

export interface NodeActionsPanelProps {
  status: number
  onLaunch: NodeActionHandler
  onStop: NodeActionHandler
  onRevoke: NodeActionHandler
}

const NodeActionsPanel = (props: NodeActionsPanelProps) => {
  let isLaunchButtonDisabled = false
  let isStopButtonDisabled = false
  let isRevokeButtonDisabled = false
  switch (props.status) {
    case NodeStatus.Online:
      isLaunchButtonDisabled = true
      break
    case NodeStatus.Processing:
      isLaunchButtonDisabled = true
      isStopButtonDisabled = true
      isRevokeButtonDisabled = true
      break
    default:
      isStopButtonDisabled = true
      break
  }

  return (
    <>
      <Button
        type='link'
        size='small'
        disabled={isLaunchButtonDisabled}
        onClick={props.onLaunch}
      >
        Launch
      </Button>
      <Button
        type='link'
        size='small'
        disabled={isStopButtonDisabled}
        onClick={props.onStop}
      >
        Stop
      </Button>
      <Popconfirm
        title='Are you sure to revoke the node?'
        okText='Yes'
        cancelText='No'
        onConfirm={props.onRevoke}
        disabled={isRevokeButtonDisabled}
      >
        <Button
          type='text'
          size='small'
          danger
          disabled={isRevokeButtonDisabled}
        >
          Revoke
        </Button>
      </Popconfirm>
    </>
  )
}

export default NodeActionsPanel
