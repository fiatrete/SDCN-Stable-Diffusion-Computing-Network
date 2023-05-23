import React, { useCallback, useState } from 'react'
import { Button, Collapse, Image, Modal } from 'antd'
import cx from 'classnames'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import {
  CloseOutlined,
  CrownOutlined,
  DownOutlined,
  GiftOutlined,
  LogoutOutlined,
  MenuOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons'

import logo from 'assets/images/logo.svg'

import styles from './index.module.css'
import useSignInModal from 'hooks/useSignModal'
import userStore from 'stores/userStore'
import useUser from 'hooks/useUser'
import UserAvatar from 'components/UserAvatar'
import { env } from 'env'

const Header = () => {
  const { showSignModel } = useSignInModal()
  const [isMenuOpened, setIsMenuOpened] = useState(false)
  const navigate = useNavigate()

  const signInHandler = useCallback(() => {
    showSignModel()
  }, [showSignModel])

  const { logout } = useUser()

  const userLogout = useCallback(() => {
    logout()
    navigate('/')
  }, [logout, navigate])

  const avatarElement = useCallback(
    () => (
      <div className={cx('flex items-center gap-3')}>
        <UserAvatar user={userStore.user} />
        <div className={cx('h-min font-bold')}>{userStore.user.nickname}</div>
      </div>
    ),
    [],
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
                <a
                  className={styles.navLink}
                  href={env.REACT_APP_DOCS_DOMAIN}
                  target='_blank'
                  rel='noreferrer'
                >
                  API Reference
                </a>
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
                  src='https://img.shields.io/github/stars/fiatrete/SDCN-Stable-Diffusion-Computing-Network?style=social'
                  alt=''
                  style={{ height: 22 }}
                />
              </a>
              <div className={cx('flex items-center gap-x-6 mt-4 w-full')}>
                {userStore.isLoggedIn ? (
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
                      <div className={cx('flex flex-col items-start')}>
                        <div className={cx('w-full text-lef px-4 py-1')}>
                          <CrownOutlined />
                          <span className={cx('ml-2')}>
                            Honor: {userStore.user.honorAmount}
                          </span>
                        </div>
                        <Button
                          type='text'
                          className={cx('w-full text-left')}
                          block
                          icon={<UserOutlined />}
                          onClick={() => {
                            navigate('/account')
                            setIsMenuOpened(false)
                          }}
                        >
                          Account
                        </Button>
                        {userStore.user.role === 1 && (
                          <Button
                            type='text'
                            className={cx('w-full text-left')}
                            icon={<GiftOutlined />}
                            onClick={() => {
                              navigate('/reward')
                              setIsMenuOpened(false)
                            }}
                          >
                            Reward
                          </Button>
                        )}
                        <Button
                          type='text'
                          className={cx('w-full text-left')}
                          icon={<LogoutOutlined />}
                          onClick={() => {
                            userLogout()
                            setIsMenuOpened(false)
                          }}
                        >
                          Logout
                        </Button>
                      </div>
                    </Collapse.Panel>
                  </Collapse>
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
