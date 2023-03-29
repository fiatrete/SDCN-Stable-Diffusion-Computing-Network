import React from 'react'
import cx from 'classnames'

import styles from './index.module.css'
import NodeList from './NodeList'
import DonorList from './DonorList'

const Nodes = () => {
  return (
    <div className={cx(styles.wrap)}>
      <div className={cx(styles.contentWrap)}>
        <NodeList />
        <DonorList />
      </div>
    </div>
  )
}

export default Nodes
