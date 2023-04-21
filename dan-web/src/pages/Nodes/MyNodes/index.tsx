import { message, Table } from 'antd'
import { Node } from 'typings/Node'
import { NodesResponseData } from 'api/nodes'
import { AxiosError } from 'axios'
import NodeStatusTag from 'components/NodeStatusTag'
import React, { useCallback, useEffect, useState } from 'react'
import * as nodesApi from 'api/nodes'
import to from 'await-to-js'
import cx from 'classnames'

const MyNodes = () => {
  const columns = [
    {
      title: 'Node ID',
      dataIndex: 'nodeId',
    },
    {
      title: 'Node Name',
      dataIndex: 'nodeName',
    },
    {
      title: 'Tasks handled',
      dataIndex: 'taskHandlerCount',
    },
    {
      title: 'Current Status',
      key: 'status',
      render: (node: Node) => <NodeStatusTag status={node.status} />,
    },
  ]

  const PAGE_SIZE = 10
  const [nodes, setNodes] = useState<Node[]>([])
  const [pageNo, setPageNo] = useState(1)
  const [totalSize, setTotalSize] = useState(0)

  const getMyNodesList = useCallback(
    async (page: number, size: number = PAGE_SIZE) => {
      const [_nodesError, _nodes] = await to<NodesResponseData, AxiosError>(
        nodesApi.myNodes(page, size),
      )

      if (_nodesError !== null) {
        setNodes([])
        message.error(_nodesError.message)
        console.error('getMyNodesListError', _nodesError)
        return
      }

      if (_nodes.totalSize === 0) {
        setNodes([])
      } else {
        setNodes(_nodes.items)
      }
      setPageNo(_nodes.pageNo)
      setTotalSize(_nodes.totalSize)
    },
    [],
  )

  useEffect(() => {
    // Load data for page.1
    getMyNodesList(1)
  }, [getMyNodesList])

  return (
    <div className={cx('')}>
      <Table<Node>
        className={cx('overflow-x-auto')}
        columns={columns}
        dataSource={nodes}
        rowKey='nodeId'
        pagination={{
          current: pageNo,
          pageSize: PAGE_SIZE,
          total: totalSize,
          onChange: getMyNodesList,
          hideOnSinglePage: true,
          showSizeChanger: false,
        }}
      />
    </div>
  )
}

export default MyNodes
