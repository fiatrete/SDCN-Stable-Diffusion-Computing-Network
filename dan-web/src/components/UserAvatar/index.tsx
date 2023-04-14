import React, { useCallback } from 'react'
import { Avatar } from 'antd'
import { User } from 'typings/User'
import { UserOutlined } from '@ant-design/icons'
import { AvatarSize } from 'antd/es/avatar/SizeContext'

export interface UserAvatarProps {
  user: User
  size?: AvatarSize
}

const UserAvatar = ({ user, size = 'default' }: UserAvatarProps) => {
  const avatarElement = useCallback(() => {
    if (user.avatarImgUrl) {
      return <Avatar src={user.avatarImgUrl} size={size} />
    } else if (user.nickname.length > 0) {
      return (
        <Avatar style={{ backgroundColor: '#40A9FF' }} size={size}>
          {user.nickname[0]}
        </Avatar>
      )
    } else {
      return (
        <Avatar
          style={{ backgroundColor: '#40A9FF' }}
          icon={<UserOutlined />}
          size={size}
        />
      )
    }
  }, [user.avatarImgUrl, user.nickname, size])

  return <>{avatarElement()}</>
}

export default UserAvatar
