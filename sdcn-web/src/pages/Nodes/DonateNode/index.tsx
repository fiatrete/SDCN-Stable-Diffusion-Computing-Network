import { AxiosError } from 'axios'
import React from 'react'
import * as nodesApi from 'api/nodes'
import to from 'await-to-js'
import cx from 'classnames'
import { Button, Form, Input, Typography } from 'antd'

const { Title, Paragraph, Text, Link } = Typography

const DonateNode = () => {
  const onDonate = (values: { worker: string }) => {
    console.log('onDonate', values, values.worker)
  }

  return (
    <div className={cx('mt-4')}>
      <Form layout='vertical' requiredMark='optional' onFinish={onDonate}>
        <Form.Item
          label='Worker URL'
          name='worker'
          rules={[
            { required: true, message: 'Please input Worker URL' },
            { type: 'url', message: 'Please input a valid URL' },
          ]}
        >
          <Input placeholder='http://yourlocalip:7860' />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            Donate
          </Button>
        </Form.Item>
      </Form>
      <Typography>
        <Title level={5} type='secondary'>
          How to get the Worker URL
        </Title>
        <Paragraph type='secondary'>
          Install and startup Stable Diffusion webui with <br />
          <Text code type='danger'>
            -listen --api --share
          </Text>
          argument
        </Paragraph>
        <Paragraph type='secondary'>
          You will get a Worker URL like{' '}
          <Text code type='danger'>
            https://f00bfa54-7b3c-476b.gradio.live
          </Text>
          .
        </Paragraph>
        <Paragraph type='secondary'>
          For details, please refer to the How to use section in the
          <Link
            type='secondary'
            underline
            href='https://github.com/fiatrete/SDCN-Stable-Diffusion-Computing-Network'
            target='_blank'
            className={cx('mx-1')}
          >
            https://github.com/fiatrete/SDCN-Stable-Diffusion-Computing-Network
          </Link>
          link
        </Paragraph>
      </Typography>
    </div>
  )
}

export default DonateNode
