import React from 'react'
import { Button, Image } from 'antd'
import cx from 'classnames'
import { observer } from 'mobx-react-lite'

import styles from './index.module.css'

import githubIcon from 'assets/images/icon_github.svg'
import uiStore from 'stores/uiStore'

const Footer = () => {
  return (
    <div className={cx('mt-auto', styles.wrap)}>
      <div
        className={cx(
          'flex justify-between items-center gap-4',
          uiStore.isMobile ? styles.contentWrapForMobile : styles.contentWrap,
        )}
      >
        <div className={cx(styles.left)}>
          Copyright ©2023 Stable Diffusion Computing Network. All rights
          reserved.
        </div>

        <div className={cx(styles.right)}>
          <Button
            type='ghost'
            shape='circle'
            href={process.env.REACT_APP_GITHUB_URL}
            target='_blank'
            className={cx('flex justify-center items-center')}
          >
            <Image src={githubIcon} width={24} preview={false} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default observer(Footer)
