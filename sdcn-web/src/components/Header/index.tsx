import React from 'react'
import { Avatar, Button, Image, Popover } from 'antd'
import githubIcon from 'assets/images/icon_github.svg'
import logo from 'assets/images/logo.svg'
import cx from 'classnames'
import { Link, NavLink } from 'react-router-dom'
import styles from './index.module.css'
import useSignModal from 'hooks/useSignModal'
import userStore from 'stores/userStore'
import { observer } from 'mobx-react-lite'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'

const Header = () => {
  const { showSignModel } = useSignModal()

  const signInHandler = () => {
    showSignModel()
  }

  const avatarElement = () => {
    const user = userStore.user
    if (user.avatar) {
      return <Avatar src={user.avatar} />
    } else if (user.name.length > 0) {
      return (
        <Avatar style={{ backgroundColor: '#40A9FF' }}>{user.name[0]}</Avatar>
      )
    } else {
      return (
        <Avatar
          style={{ backgroundColor: '#40A9FF' }}
          icon={<UserOutlined />}
        />
      )
    }
  }

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
        </nav>
        <div className={cx('flex items-center gap-x-6', styles.right)}>
          <Button
            type='ghost'
            shape='circle'
            href={process.env.REACT_APP_GITHUB_URL}
            target='_blank'
            className={cx('flex justify-center items-center')}
          >
            <Image src={githubIcon} width={28} preview={false} />
          </Button>
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
