import React, { useCallback, useEffect } from 'react'
import { Avatar, Button, Image, Popover } from 'antd'
import logo from 'assets/images/logo.svg'
import cx from 'classnames'
import { Link, NavLink } from 'react-router-dom'
import styles from './index.module.css'
import useSignInModal from 'hooks/useSignModal'
import userStore from 'stores/userStore'
import { observer } from 'mobx-react-lite'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { User } from 'typings/User'
import { AxiosError } from 'axios'
import to from 'await-to-js'
import * as userApi from 'api/user'

const Header = () => {
  const { showSignModel } = useSignInModal()

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
          {/* <Button
            type='ghost'
            shape='circle'
            href={process.env.REACT_APP_GITHUB_URL}
            target='_blank'
            className={cx('flex justify-center items-center')}
          >
            <Image src={githubIcon} width={28} preview={false} />
          </Button> */}
          {userStore.isLoggedIn ? (
            <Popover content={logoutButton} placement='bottomRight'>
              {avatarElement()}
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
