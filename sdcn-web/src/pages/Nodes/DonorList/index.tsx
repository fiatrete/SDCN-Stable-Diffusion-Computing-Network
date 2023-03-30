import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import styles from './index.module.css'
import { Donor } from 'typings/Node'
import to from 'await-to-js'
import { DonorsResponseData } from 'api/nodes'
import { AxiosError } from 'axios'
import * as nodesApi from 'api/nodes'
import { Table } from 'antd'

const DonorList = () => {
  const columns = [
    {
      title: 'Nodes',
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

  const [donors, setDonors] = useState<Donor[]>([])

  useEffect(() => {
    const getDonorsList = async () => {
      const [_donorsError, _donors] = await to<DonorsResponseData, AxiosError>(
        nodesApi.donors(1),
      )

      if (_donorsError !== null) {
        console.error('getDonorsListError', _donorsError)
        setDonors([])
        return
      }

      setDonors(_donors.items)
    }

    getDonorsList()
  }, [])

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
          rowKey={(donor) => donor.account.id}
          pagination={{
            hideOnSinglePage: true,
          }}
        />
      </div>
    </div>
  )
}

export default DonorList
