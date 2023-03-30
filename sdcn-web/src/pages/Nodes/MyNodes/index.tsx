import { Table } from 'antd'
import { Node } from 'typings/Node'
import { NodesResponseData } from 'api/nodes'
import { AxiosError } from 'axios'
import NodeStatusTag from 'components/NodeStatusTag'
import React, { useEffect, useState } from 'react'
import * as nodesApi from 'api/nodes'
import to from 'await-to-js'
import cx from 'classnames'
import NodeActionsPanel from 'components/NodeActionsPanel'

const MyNodes = () => {
  const onLaunch = (node: Node) => {
    console.log('onLaunch', node)
  }

  const onStop = (node: Node) => {
    console.log('onStop', node)
  }

  const onRevoke = (node: Node) => {
    console.log('onRevoke', node)
  }

  const columns = [
    {
      title: 'Node ID',
      dataIndex: 'nodeSeq',
      width: '25%',
    },
    {
      title: 'Tasks handled',
      dataIndex: 'taskHandlerCount',
      width: '25%',
    },
    {
      title: 'Current Status',
      key: 'status',
      render: (node: Node) => <NodeStatusTag status={node.status} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '30%',
      render: (node: Node) => (
        <NodeActionsPanel
          status={node.status}
          onLaunch={() => {
            onLaunch(node)
          }}
          onStop={() => {
            onStop(node)
          }}
          onRevoke={() => {
            onRevoke(node)
          }}
        />
      ),
    },
  ]

  const [nodes, setNodes] = useState<Node[]>([])

  useEffect(() => {
    const getMyNodesList = async () => {
      const [_nodesError, _nodes] = await to<NodesResponseData, AxiosError>(
        nodesApi.myNodes(1),
      )

      if (_nodesError !== null) {
        console.error('getMyNodesListError', _nodesError)
        setNodes([])
        return
      }

      setNodes(_nodes.items)
    }

    getMyNodesList()
  }, [])

  return (
    <div className={cx('mt-4')}>
      <Table<Node>
        columns={columns}
        dataSource={nodes}
        rowKey='nodeId'
        pagination={{
          hideOnSinglePage: true,
        }}
      />
    </div>
  )
}

export default MyNodes
