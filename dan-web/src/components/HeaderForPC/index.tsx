import React, { useCallback, useEffect } from 'react'
import { Button, Image, Popover, message } from 'antd'
import cx from 'classnames'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import {
  CrownOutlined,
  GiftOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons'

import logo from 'assets/images/logo.svg'

import styles from './index.module.css'
import useSignInModal from 'hooks/useSignModal'
import userStore from 'stores/userStore'
import useUser from 'hooks/useUser'
import UserAvatar from 'components/UserAvatar'

const Header = () => {
  const { showSignModel } = useSignInModal()
  const navigate = useNavigate()

  const signInHandler = useCallback(() => {
    showSignModel()
  }, [showSignModel])

  const { updateUser, logout } = useUser()

  const updateUserInfo = useCallback(async () => {
    await updateUser()

    if (userStore.user.firstTimeLogin) {
      message.success(`100 honors as a gift for your registration`)
    }
  }, [updateUser])

  const userLogout = useCallback(() => {
    logout()
    navigate('/')
  }, [logout, navigate])

  useEffect(() => {
    updateUserInfo()
  }, [updateUserInfo])

  return (
    <div className={cx('sticky top-0', styles.wrap)}>
      <div
        className={cx(
          'flex justify-between items-center gap-x-6',
          styles.contentWrap,
        )}
      >
        <div className={cx(styles.left)}>
          <Link to={'/'}>
            <Image src={logo} width={120} preview={false} />
          </Link>
        </div>
        <nav className={cx('grow flex items-center gap-x-1')}>
          <NavLink
            to={'/api-reference'}
            className={({ isActive }) =>
              isActive ? cx(styles.navLinkActive) : cx(styles.navLink)
            }
          >
            API Reference
          </NavLink>
          <NavLink
            to={'/nodes'}
            className={({ isActive }) =>
              isActive ? cx(styles.navLinkActive) : cx(styles.navLink)
            }
          >
            Nodes
          </NavLink>
          <NavLink to={'/#faq'} className={cx(styles.navLink)}>
            FAQ
          </NavLink>
          <NavLink
            to={'/play'}
            className={({ isActive }) =>
              isActive ? cx(styles.navLinkActive) : cx(styles.navLink)
            }
          >
            Playground
          </NavLink>
          <Button
            type='ghost'
            shape='circle'
            href={process.env.REACT_APP_GITHUB_URL}
            target='_blank'
            className={cx('flex justify-center items-center mx-2.5')}
          >
            <Image
              src='https://img.shields.io/github/stars/fiatrete/DAN-Stable-Diffusion-Computing-Network?style=social'
              preview={false}
            />
          </Button>
        </nav>
        <div className={cx('flex items-center gap-x-6', styles.right)}>
          {userStore.isLoggedIn ? (
            <Popover
              content={
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
                    }}
                  >
                    Logout
                  </Button>
                </div>
              }
              placement='bottomRight'
            >
              <div className={cx('flex items-center gap-3')}>
                <UserAvatar user={userStore.user} />
                <div className={cx('h-min font-bold')}>
                  {userStore.user.nickname}
                </div>
              </div>
            </Popover>
          ) : (
            <Button type='primary' onClick={signInHandler}>
              Sign in
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default observer(Header)
