import React, { useCallback, useState } from 'react'
import cx from 'classnames'

import styles from './index.module.css'
import NodeList from './NodeList'
import DonorList from './DonorList'
import { Button, message, Modal } from 'antd'
import MyNodes from './MyNodes'
import DonateNode from './DonateNode'
import { NodesResponseData, DonorsResponseData } from 'api/nodes'
import { AxiosError } from 'axios'
import to from 'await-to-js'
import * as nodesApi from 'api/nodes'
import { Donor, Node } from 'typings/Node'
import useSignInModal from 'hooks/useSignModal'
import userStore from 'stores/userStore'

const Nodes = () => {
  const { showSignModel } = useSignInModal()

  const PAGE_SIZE = 10

  const [nodes, setNodes] = useState<Node[]>([])
  const [nodesPageNo, setNodesPageNo] = useState(1)
  const [nodesTotalSize, setNodesTotalSize] = useState(0)

  const getNodesList = useCallback(
    async (page: number, size: number = PAGE_SIZE) => {
      const [_nodesError, _nodes] = await to<NodesResponseData, AxiosError>(
        nodesApi.nodes(page, size),
      )

      if (_nodesError !== null) {
        setNodes([])
        message.error(_nodesError.message)
        console.error('getNodesListError', _nodesError)
        return
      }

      if (_nodes.totalSize === 0) {
        setNodes([])
      } else {
        setNodes(_nodes.items)
      }
      setNodesPageNo(_nodes.pageNo)
      setNodesTotalSize(_nodes.totalSize)
    },
    [],
  )

  const [donors, setDonors] = useState<Donor[]>([])
  const [donorsPageNo, setDonorsPageNo] = useState(1)
  const [donorsTotalSize, setDonorsTotalSize] = useState(0)

  const getDonorsList = useCallback(
    async (page: number, size: number = PAGE_SIZE) => {
      const [_donorsError, _donors] = await to<DonorsResponseData, AxiosError>(
        nodesApi.donors(page, size),
      )

      if (_donorsError !== null) {
        setDonors([])
        message.error(_donorsError.message)
        console.error('getDonorsListError', _donorsError)
        return
      }

      if (_donors.totalSize === 0) {
        setDonors([])
      } else {
        setDonors(_donors.items)
      }
      setDonorsPageNo(_donors.pageNo)
      setDonorsTotalSize(_donors.totalSize)
    },
    [],
  )

  const handleDonateNode = useCallback(() => {
    if (!userStore.isLoggedIn) {
      showSignModel()
      return
    }

    const modal: { destroy: () => void } = Modal.info({
      title: 'Donate Node',
      closable: true,
      icon: null,
      footer: null,
      transitionName: '',
      width: 368,
      content: (
        <DonateNode
          refresh={() => {
            getNodesList(nodesPageNo)
            getDonorsList(donorsPageNo)
          }}
          close={() => {
            modal.destroy()
          }}
        />
      ),
    })
  }, [getNodesList, nodesPageNo, getDonorsList, donorsPageNo, showSignModel])

  const handleMyNodesButton = useCallback(() => {
    if (!userStore.isLoggedIn) {
      showSignModel()
      return
    }

    const modal: { destroy: () => void } = Modal.info({
      title: 'My Nodes',
      closable: true,
      icon: null,
      footer: null,
      transitionName: '',
      width: 900,
      content: (
        <MyNodes
          refresh={() => {
            getNodesList(nodesPageNo)
            getDonorsList(donorsPageNo)
          }}
          close={() => {
            modal.destroy()
          }}
        />
      ),
    })
  }, [getNodesList, nodesPageNo, getDonorsList, donorsPageNo, showSignModel])

  return (
    <div className={cx(styles.wrap)}>
      <div className={cx(styles.contentWrap)}>
        <NodeList
          pageNo={nodesPageNo}
          pageSize={PAGE_SIZE}
          totalSize={nodesTotalSize}
          nodes={nodes}
          getNodesList={getNodesList}
        />
        <DonorList
          pageNo={donorsPageNo}
          pageSize={PAGE_SIZE}
          totalSize={donorsTotalSize}
          donors={donors}
          getDonorsList={getDonorsList}
        />
        <div className={cx('flex justify-center gap-4')}>
          <Button type='primary' onClick={handleDonateNode}>
            Donate Node
          </Button>
          <Button onClick={handleMyNodesButton}>My Nodes</Button>
        </div>
      </div>
    </div>
  )
}

export default Nodes
