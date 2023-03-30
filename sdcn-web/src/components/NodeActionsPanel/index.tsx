import { Button, Popconfirm } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { Node, NodeStatus } from 'typings/Node'

export type NodeActionHandler = (node: Node) => void

export interface NodeActionsPanelProps {
  node: Node
  onLaunch: NodeActionHandler
  onStop: NodeActionHandler
  onRevoke: NodeActionHandler
}

const NodeActionsPanel = (props: NodeActionsPanelProps) => {
  const { node, onLaunch, onStop, onRevoke } = props

  const [isLaunchButtonDisabled, setIsLaunchButtonDisabled] = useState(false)
  const [isStopButtonDisabled, setIsStopButtonDisabled] = useState(false)
  const [isRevokeButtonDisabled, setIsRevokeButtonDisabled] = useState(false)

  useEffect(() => {
    switch (node.status) {
      case NodeStatus.Online:
        setIsLaunchButtonDisabled(true)
        setIsStopButtonDisabled(false)
        setIsRevokeButtonDisabled(false)
        break
      case NodeStatus.Processing:
        setIsLaunchButtonDisabled(true)
        setIsStopButtonDisabled(true)
        setIsRevokeButtonDisabled(true)
        break
      default:
        setIsLaunchButtonDisabled(false)
        setIsStopButtonDisabled(true)
        setIsRevokeButtonDisabled(false)
        break
    }
  }, [node])

  const handleOnLaunch = useCallback(() => {
    onLaunch(node)
  }, [onLaunch, node])

  const handleOnStop = useCallback(() => {
    onStop(node)
  }, [onStop, node])

  const handleOnRevoke = useCallback(() => {
    onRevoke(node)
  }, [onRevoke, node])

  return (
    <>
      <Button
        type='link'
        size='small'
        disabled={isLaunchButtonDisabled}
        onClick={handleOnLaunch}
      >
        Launch
      </Button>
      <Button
        type='link'
        size='small'
        disabled={isStopButtonDisabled}
        onClick={handleOnStop}
      >
        Stop
      </Button>
      <Popconfirm
        title='Are you sure to revoke the node?'
        okText='Yes'
        cancelText='No'
        onConfirm={handleOnRevoke}
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
