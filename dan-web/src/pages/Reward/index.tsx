import React, { useCallback } from 'react'
import cx from 'classnames'
import { Button, Form, Input, InputNumber, message } from 'antd'

import styles from './index.module.css'

import * as userApi from 'api/user'

interface FormValues {
  uid: string
  count: number
}

const Reward = () => {
  const [form] = Form.useForm<FormValues>()

  const handleFormFinish = useCallback((values: FormValues) => {
    console.log('handleFormFinish', values)
    userApi
      .rewardHonor(values.uid, values.count)
      .then((result) => {
        if (result === true) {
          message.success('Success')
        } else {
          message.error('Failed')
        }
      })
      .catch((e) => {
        message.error('Failed')
      })
      .finally(() => {
        //
      })
  }, [])

  return (
    <div className={cx(styles.wrap)}>
      <div className={cx(styles.content)}>
        <h3 className={cx('font-medium text-2xl text-black mb-0')}>
          Reward Honor
        </h3>
        <Form
          className={cx('mt-8 w-[520px]')}
          form={form}
          size='large'
          labelCol={{ span: 4 }}
          requiredMark={false}
          autoComplete='off'
          onFinish={handleFormFinish}
        >
          <Form.Item name='uid' label='Uid' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name='count' label='Count' rules={[{ required: true }]}>
            <InputNumber className={cx('w-full')} controls={false} min={0} />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 4 }}>
            <Button type='primary' htmlType='submit'>
              Reward
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default Reward
