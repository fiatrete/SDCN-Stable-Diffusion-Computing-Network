import { Tag } from 'antd'
import React, { useEffect, useState } from 'react'
import { NodeStatus } from 'typings/Node'

export interface NodeStatusTagProps {
  status: number
}

const NodeStatusTag = (props: NodeStatusTagProps) => {
  const { status } = props

  const [desc, setDesc] = useState('unknown')
  const [color, setColor] = useState('')

  useEffect(() => {
    switch (status) {
      case NodeStatus.Online:
        setDesc('online')
        setColor('green')
        break
      case NodeStatus.Offline:
        setDesc('offline')
        setColor('red')
        break
      case NodeStatus.Processing:
        setDesc('processing')
        setColor('geekblue')
        break
      default:
        setDesc('unknown')
        setColor('')
        break
    }
  }, [status])

  return <Tag color={color}>{desc}</Tag>
}

export default NodeStatusTag
