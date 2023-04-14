import React from 'react'
import { Button, Image, Input, Space, Tabs, message } from 'antd'
import cx from 'classnames'
import copy from 'copy-text-to-clipboard'
import { observer } from 'mobx-react-lite'
import { CopyOutlined } from '@ant-design/icons'

import styles from './index.module.css'
import userStore from 'stores/userStore'

const Account = () => {
  return (
    <div className={cx(styles.wrap)}>
      <div className={cx(styles.content)}>
        <div className={cx('flex gap-7 items-center')}>
          <div className={cx('rounded-full overflow-hidden w-[128px]')}>
            <Image
              width={128}
              height={128}
              preview={false}
              src={userStore.user.avatarImgUrl}
            />
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
          className={cx('mt-14')}
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
                  <Space.Compact className={cx('w-[538px] mt-2')}>
                    <Input value={userStore.user.apiKey} readOnly />
                    <Button
                      type='default'
                      icon={<CopyOutlined />}
                      onClick={() => {
                        copy(userStore.user.apiKey)
                        message.success('Secret key copied to clipboard')
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
