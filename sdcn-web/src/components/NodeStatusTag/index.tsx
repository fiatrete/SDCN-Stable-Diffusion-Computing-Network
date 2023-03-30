import { Tag } from 'antd'
import React from 'react'
import { NodeStatus } from 'typings/Node'

export interface NodeStatusTagProps {
  status: number
}

const NodeStatusTag = (props: NodeStatusTagProps) => {
  let desc = 'offline'
  let color = 'red'
  switch (props.status) {
    case NodeStatus.Online:
      desc = 'online'
      color = 'green'
      break
    case NodeStatus.Processing:
      desc = 'processing'
      color = 'geekblue'
      break
    default:
      desc = 'offline'
      color = 'red'
      break
  }

  return <Tag color={color}>{desc}</Tag>
}

export default NodeStatusTag
