import React, { useEffect, useState } from 'react'
import cx from 'classnames'

import styles from './index.module.css'
import { Node } from 'typings/Node'
import { Table } from 'antd'
import NodeStatusTag from 'components/NodeStatusTag'
import to from 'await-to-js'
import { NodesResponseData } from 'api/nodes'
import { AxiosError } from 'axios'
import * as nodesApi from 'api/nodes'

const NodeList = () => {
  const columns = [
    {
      title: 'Node ID',
      dataIndex: 'nodeSeq',
      width: '30%',
    },
    {
      title: 'Donor',
      dataIndex: ['account', 'nickname'],
      width: '30%',
    },
    {
      title: 'Tasks handled',
      dataIndex: 'taskHandlerCount',
      width: '30%',
    },
    {
      title: 'Current Status',
      key: 'status',
      render: (node: Node) => <NodeStatusTag status={node.status} />,
    },
  ]

  const [nodes, setNodes] = useState<Node[]>([])

  useEffect(() => {
    const getNodesList = async () => {
      const [_nodesError, _nodes] = await to<NodesResponseData, AxiosError>(
        nodesApi.nodes(1),
      )

      if (_nodesError !== null) {
        console.error('getNodesListError', _nodesError)
        setNodes([])
        return
      }

      setNodes(_nodes.items)
    }

    getNodesList()
  }, [])

  return (
    <div className={cx('mb-12', styles.wrap)}>
      <div className={cx(styles.contentWrap)}>
        <div
          className={cx(
            'text-base font-medium h-16 flex flex-col justify-center px-2',
          )}
        >
          SDCN Nodes
        </div>
        <Table<Node>
          columns={columns}
          dataSource={nodes}
          rowKey='nodeId'
          pagination={{
            hideOnSinglePage: true,
          }}
        />
      </div>
    </div>
  )
}

export default NodeList
