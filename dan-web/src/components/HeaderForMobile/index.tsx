import React, { useCallback, useEffect, useState } from 'react'
import { Avatar, Button, Collapse, Image, Modal, Popover } from 'antd'
import cx from 'classnames'
import { Link, NavLink } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import {
  CloseOutlined,
  DownOutlined,
  LogoutOutlined,
  MenuOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { AxiosError } from 'axios'
import to from 'await-to-js'

import logo from 'assets/images/logo.svg'

import { User } from 'typings/User'
import styles from './index.module.css'
import useSignInModal from 'hooks/useSignModal'
import userStore from 'stores/userStore'
import * as userApi from 'api/user'
import uiStore from 'stores/uiStore'

const Header = () => {
  const { showSignModel } = useSignInModal()
  const [isMenuOpened, setIsMenuOpened] = useState(false)

  const signInHandler = useCallback(() => {
    showSignModel()
  }, [showSignModel])

  const updateUserInfo = useCallback(async () => {
    const [_userInfoError, _userInfo] = await to<User, AxiosError>(
      userApi.userInfo(),
    )

    if (_userInfoError !== null) {
      console.error('updateUserInfoError', _userInfoError)
      userStore.reset()
      return
    }

    userStore.updateUser(_userInfo)
  }, [])

  useEffect(() => {
    updateUserInfo()
  }, [updateUserInfo])

  const avatarElement = useCallback(() => {
    const user = userStore.user
    if (user.avatarImgUrl) {
      return <Avatar src={user.avatarImgUrl} />
    } else if (user.nickname.length > 0) {
      return (
        <Avatar style={{ backgroundColor: '#40A9FF' }}>
          {user.nickname[0]}
        </Avatar>
      )
    } else {
      return (
        <Avatar
          style={{ backgroundColor: '#40A9FF' }}
          icon={<UserOutlined />}
        />
      )
    }
  }, [])

  const logoutButton = (
    <Button
      type='text'
      icon={<LogoutOutlined />}
      onClick={() => {
        userStore.reset()
      }}
    >
      Logout
    </Button>
  )

  return (
    <div className={cx('sticky top-0', styles.wrap)}>
      <div
        className={cx(
          'flex justify-between items-center gap-x-4',
          styles.contentWrap,
        )}
      >
        <div
          className={cx('flex grow justify-start items-center', styles.left)}
        >
          <Link to={'/'}>
            <Image src={logo} width={120} preview={false} />
          </Link>
        </div>
        <div className={cx('absolute right-4', styles.right)}>
          {isMenuOpened ? (
            <Button
              onClick={() => {
                setIsMenuOpened(false)
              }}
            >
              <CloseOutlined />
            </Button>
          ) : (
            <Button
              onClick={() => {
                setIsMenuOpened(true)
              }}
            >
              <MenuOutlined />
            </Button>
          )}
        </div>
        {isMenuOpened && (
          <Modal
            open={true}
            footer={null}
            closable={false}
            maskClosable
            destroyOnClose
            style={{
              top: 80,
              width: 'calc(100vw - 36px)',
            }}
            maskStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
            }}
            onCancel={() => {
              setIsMenuOpened(false)
            }}
          >
            <div className={cx('flex flex-col items-start gap-y-3')}>
              <nav className={cx('flex flex-col items-start gap-y-3')}>
                <NavLink
                  to={'/api-reference'}
                  className={({ isActive }) =>
                    isActive
                      ? cx(styles.navLink, styles.navLinkActive)
                      : cx(styles.navLink)
                  }
                  onClick={() => {
                    setIsMenuOpened(false)
                  }}
                >
                  API Reference
                </NavLink>
                <NavLink
                  to={'/nodes'}
                  className={({ isActive }) =>
                    isActive
                      ? cx(styles.navLink, styles.navLinkActive)
                      : cx(styles.navLink)
                  }
                  onClick={() => {
                    setIsMenuOpened(false)
                  }}
                >
                  Nodes
                </NavLink>
                <NavLink
                  to={'/#faq'}
                  className={() =>
                    location.hash === '#faq'
                      ? cx(styles.navLink, styles.navLinkActive)
                      : cx(styles.navLink)
                  }
                  onClick={() => {
                    setIsMenuOpened(false)
                  }}
                >
                  FAQ
                </NavLink>
                <NavLink
                  to={'/play'}
                  className={({ isActive }) =>
                    isActive
                      ? cx(styles.navLink, styles.navLinkActive)
                      : cx(styles.navLink)
                  }
                  onClick={() => {
                    setIsMenuOpened(false)
                  }}
                >
                  Playground
                </NavLink>
              </nav>
              <a
                href={process.env.REACT_APP_GITHUB_URL}
                target='_blank'
                rel='noreferrer'
                referrerPolicy='no-referrer'
                className={cx('mt-2')}
                onClick={() => {
                  setIsMenuOpened(false)
                }}
              >
                <img
                  src='https://img.shields.io/github/stars/fiatrete/DAN-Stable-Diffusion-Computing-Network?style=social'
                  alt=''
                  style={{ height: 22 }}
                />
              </a>
              <div className={cx('flex items-center gap-x-6 mt-4 w-full')}>
                {userStore.isLoggedIn ? (
                  <>
                    {uiStore.isMobile ? (
                      <Collapse
                        ghost
                        expandIconPosition='end'
                        className={cx('w-full')}
                        expandIcon={({ isActive }) => {
                          return isActive ? (
                            <DownOutlined className='relative top-[7px]' />
                          ) : (
                            <RightOutlined className='relative top-[7px]' />
                          )
                        }}
                      >
                        <Collapse.Panel header={avatarElement()} key='1'>
                          {logoutButton}
                        </Collapse.Panel>
                      </Collapse>
                    ) : (
                      <Popover content={logoutButton} placement='bottomRight'>
                        {avatarElement()}
                      </Popover>
                    )}
                  </>
                ) : (
                  <Button
                    type='primary'
                    className={cx('w-full')}
                    onClick={() => {
                      setIsMenuOpened(false)
                      signInHandler()
                    }}
                  >
                    Sign in
                  </Button>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}

export default observer(Header)
