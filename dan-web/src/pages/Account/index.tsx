import React, { useCallback } from 'react'
import { Button, Input, Space, Tabs, message } from 'antd'
import cx from 'classnames'
import copy from 'copy-text-to-clipboard'
import { observer } from 'mobx-react-lite'
import { CopyOutlined } from '@ant-design/icons'

import styles from './index.module.css'
import userStore from 'stores/userStore'
import UserAvatar from 'components/UserAvatar'
import uiStore from 'stores/uiStore'

const Account = () => {
  const encryptApiKey = useCallback(() => {
    const key = userStore.user.apiKey
    const length = key.length
    const startIndex = Math.floor(length / 3)
    const endIndex = Math.ceil((length * 2) / 3)
    const firstPart = key.slice(0, startIndex)
    const middlePart = '*'.repeat(endIndex - startIndex)
    const lastPart = key.slice(endIndex)
    return `${firstPart}${middlePart}${lastPart}`
  }, [])

  return (
    <div
      className={cx(uiStore.isMobile ? [styles.wrapForMobile] : [styles.wrap])}
    >
      <div
        className={cx(
          uiStore.isMobile ? [styles.contentForMobile] : [styles.content],
        )}
      >
        <div className={cx('flex gap-7 items-center')}>
          <div className={cx('rounded-full overflow-hidden w-[128px]')}>
            <UserAvatar user={userStore.user} size={128} />
          </div>
          <div>
            <h3 className={cx('font-medium text-2xl text-black mb-0')}>
              {userStore.user.nickname}
            </h3>
            <p className={cx('font-normal text-sm text-gray-600 mt-1')}>
              {`uid: ${userStore.user.userId}`}
            </p>
            <h5 className={cx('font-normal text-base text-black mb-0 mt-10')}>
              {`Honor: ${userStore.user.honorAmount}`}
            </h5>
          </div>
        </div>
        <Tabs
          className={cx(uiStore.isMobile ? ['mt-6'] : ['mt-14'])}
          tabBarStyle={{
            paddingLeft: 46,
          }}
          items={[
            {
              key: '1',
              label: `API Key`,
              children: (
                <div className={cx('block pt-4')}>
                  <h3 className={cx('')}>API Key</h3>
                  <ul className={cx('ps-2')}>
                    <li>The DAN API uses API Key for authentication.</li>
                    <li>
                      Do not share your API Key with others, or expose it in the
                      browser or other client-side code.
                    </li>
                  </ul>
                  <Space.Compact
                    className={cx(
                      uiStore.isMobile ? ['w-full mt-2'] : ['w-2/3 mt-2'],
                    )}
                  >
                    <Input value={encryptApiKey()} readOnly />
                    <Button
                      type='default'
                      icon={<CopyOutlined />}
                      onClick={() => {
                        try {
                          copy(userStore.user.apiKey)
                          message.success('API Key copied to clipboard')
                        } catch (error) {
                          console.error(error)
                          message.error('An error has occurred')
                        }
                      }}
                    />
                  </Space.Compact>
                </div>
              ),
            },
          ]}
          defaultActiveKey='1'
        />
      </div>
    </div>
  )
}

export default observer(Account)
