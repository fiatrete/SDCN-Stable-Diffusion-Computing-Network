import React, { useEffect } from 'react'
import cx from 'classnames'
import styles from './index.module.css'
import { Donor } from 'typings/Node'
import { Table } from 'antd'

export interface DonorListProps {
  getDonorsList: (page: number, size: number) => void
  pageNo: number
  pageSize: number
  totalSize: number
  donors: Donor[]
}

const DonorList = (props: DonorListProps) => {
  const { getDonorsList, pageNo, pageSize, totalSize, donors } = props

  const columns = [
    {
      title: 'Active Nodes',
      dataIndex: 'nodeCount',
      width: '33%',
    },
    {
      title: 'Donor',
      dataIndex: ['account', 'nickname'],
      width: '33%',
    },
    {
      title: 'Total Tasks handled',
      dataIndex: 'taskHandlerCount',
    },
  ]

  useEffect(() => {
    // 加载第一页数据
    getDonorsList(1, pageSize)
  }, [getDonorsList, pageSize])

  return (
    <div className={cx('mb-9', styles.wrap)}>
      <div className={cx(styles.contentWrap)}>
        <div
          className={cx(
            'text-base font-medium h-16 flex flex-col justify-center px-2',
          )}
        >
          Donors
        </div>
        <Table<Donor>
          columns={columns}
          dataSource={donors}
          rowKey={(donor) => donor.account.email}
          pagination={{
            current: pageNo,
            pageSize: pageSize,
            total: totalSize,
            onChange: getDonorsList,
            hideOnSinglePage: true,
            showSizeChanger: false,
          }}
        />
      </div>
    </div>
  )
}

export default DonorList
