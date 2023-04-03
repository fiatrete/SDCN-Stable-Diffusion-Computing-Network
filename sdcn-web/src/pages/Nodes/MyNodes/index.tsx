import { message, Spin, Table } from 'antd'
import { Node } from 'typings/Node'
import { NodesResponseData } from 'api/nodes'
import { AxiosError } from 'axios'
import NodeStatusTag from 'components/NodeStatusTag'
import React, { useCallback, useEffect, useState } from 'react'
import * as nodesApi from 'api/nodes'
import to from 'await-to-js'
import cx from 'classnames'
import NodeActionsPanel from 'components/NodeActionsPanel'
import { LoadingOutlined } from '@ant-design/icons'

export interface MyNodesProps {
  refresh: () => void
  close: () => void
}

const MyNodes = (props: MyNodesProps) => {
  const { refresh } = props

  const [loading, setLoading] = useState(false)
  const spinIcon = (
    <LoadingOutlined style={{ fontSize: 36, color: '#FFF' }} spin />
  )

  const columns = [
    {
      title: 'Node ID',
      dataIndex: 'nodeId',
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
          node={node}
          onLaunch={onLaunch}
          onStop={onStop}
          onRevoke={onRevoke}
        />
      ),
    },
  ]

  const PAGE_SIZE = 10
  const [nodes, setNodes] = useState<Node[]>([])
  const [pageNo, setPageNo] = useState(1) // 当前页码
  const [totalSize, setTotalSize] = useState(0) // 总数量

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

  const onLaunch = useCallback(
    async (node: Node) => {
      setLoading(true)
      const [_nodeError] = await to<Node, AxiosError>(
        nodesApi.launchNode(node.nodeId),
      )

      setLoading(false)
      if (_nodeError !== null) {
        message.error(_nodeError.message)
        console.error('launchNodeError', _nodeError, node)
        return
      }

      message.success('launch successful')

      // 成功后重新加载数据
      getMyNodesList(pageNo)
      refresh()
    },
    [getMyNodesList, pageNo, refresh],
  )

  const onStop = useCallback(
    async (node: Node) => {
      setLoading(true)
      const [_nodeError] = await to<Node, AxiosError>(
        nodesApi.stopNode(node.nodeId),
      )

      setLoading(false)
      if (_nodeError !== null) {
        message.error(_nodeError.message)
        console.error('stopNodeError', _nodeError, node)
        return
      }

      message.success('stop successful')

      // 成功后重新加载数据
      getMyNodesList(pageNo)
      refresh()
    },
    [getMyNodesList, pageNo, refresh],
  )

  const onRevoke = useCallback(
    async (node: Node) => {
      setLoading(true)
      const [_nodeError] = await to<Node, AxiosError>(
        nodesApi.revokeNode(node.nodeId),
      )

      setLoading(false)
      if (_nodeError !== null) {
        message.error(_nodeError.message)
        console.error('revokeNodeError', _nodeError, node)
        return
      }

      message.success('revoke successful')

      // 成功后重新加载数据
      getMyNodesList(pageNo)
      refresh()
    },
    [getMyNodesList, pageNo, refresh],
  )

  useEffect(() => {
    // 加载第一页数据
    getMyNodesList(1)
  }, [getMyNodesList])

  return (
    <div className={cx('mt-4')}>
      <Table<Node>
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
      {loading ? (
        <Spin
          indicator={spinIcon}
          className={cx(
            'absolute top-0 left-0 w-full h-full rounded-lg bg-black/60 flex justify-center items-center',
          )}
        />
      ) : null}
    </div>
  )
}

export default MyNodes
