import React, { useEffect } from 'react'
import cx from 'classnames'

import styles from './index.module.css'
import { Node } from 'typings/Node'
import { Table } from 'antd'
import NodeStatusTag from 'components/NodeStatusTag'
export interface NodeListProps {
  getNodesList: (page: number, size: number) => void
  pageNo: number
  pageSize: number
  totalSize: number
  nodes: Node[]
}

const NodeList = (props: NodeListProps) => {
  const { getNodesList, pageNo, pageSize, totalSize, nodes } = props

  const columns = [
    {
      title: 'Node ID',
      dataIndex: 'nodeId',
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

  useEffect(() => {
    // 加载第一页数据
    getNodesList(1, pageSize)
  }, [getNodesList, pageSize])

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
            current: pageNo,
            pageSize: pageSize,
            total: totalSize,
            onChange: getNodesList,
            hideOnSinglePage: true,
            showSizeChanger: false,
          }}
        />
      </div>
    </div>
  )
}

export default NodeList
