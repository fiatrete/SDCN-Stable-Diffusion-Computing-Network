import React from 'react'
import cx from 'classnames'

import styles from './index.module.css'
import { Node, NodeStatus } from 'typings/Node'
import { Table } from 'antd'
import StatusTag from 'components/StatusTag'

const nodes: Node[] = [
  {
    nodeId: '121',
    donor: 'dp',
    tasksHandled: 7,
    status: NodeStatus.Online,
  },
  {
    nodeId: '122',
    donor: 'Kobe Bryant',
    tasksHandled: 5,
    status: NodeStatus.Online,
  },
  {
    nodeId: '123',
    donor: 'Tracy Mcgrady',
    tasksHandled: 5,
    status: NodeStatus.Processing,
  },
  {
    nodeId: '124',
    donor: 'Lebron James',
    tasksHandled: 3,
    status: NodeStatus.Offline,
  },
]

const columns = [
  {
    title: 'Node ID',
    dataIndex: 'nodeId',
  },
  {
    title: 'Donor',
    dataIndex: 'donor',
  },
  {
    title: 'Tasks handled',
    dataIndex: 'tasksHandled',
  },
  {
    title: 'Current Status',
    dataIndex: 'status',
    render: (status: number) => <StatusTag status={status} />,
  },
]

const NodeList = () => {
  return (
    <div className={cx(styles.wrap)}>
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
