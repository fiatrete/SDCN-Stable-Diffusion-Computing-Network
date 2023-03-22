import React from 'react'
import { Button, Image } from 'antd'
import githubIcon from 'assets/images/icon_github.svg'
import logo from 'assets/images/logo.svg'
import cx from 'classnames'
import { Link, NavLink } from 'react-router-dom'
import styles from './index.module.css'

const Header = () => {
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
            to={'/play'}
            className={({ isActive }) =>
              isActive ? cx(styles.navLinkActive) : cx(styles.navLink)
            }
          >
            Playground
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
          <Button type='primary' className={cx('hidden')}>
            Sign in
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Header
