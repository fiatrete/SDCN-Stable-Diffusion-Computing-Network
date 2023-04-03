import { AxiosError } from 'axios'
import React, { useCallback, useState } from 'react'
import * as nodesApi from 'api/nodes'
import to from 'await-to-js'
import cx from 'classnames'
import { Button, Form, Input, message, Spin, Typography } from 'antd'
import { Node } from 'typings/Node'
import { LoadingOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text, Link } = Typography

export interface DonateNodeProps {
  refresh: () => void
  close: () => void
}

const DonateNode = (props: DonateNodeProps) => {
  const { refresh, close } = props

  const [loading, setLoading] = useState(false)
  const spinIcon = (
    <LoadingOutlined style={{ fontSize: 36, color: '#FFF' }} spin />
  )

  const onDonate = useCallback(
    async (values: { worker: string }) => {
      console.log('onDonate', values, values.worker)
      const workerUrl = values.worker

      setLoading(true)
      const [_nodeError] = await to<Node, AxiosError>(
        nodesApi.donateNode(workerUrl),
      )

      setLoading(false)
      if (_nodeError !== null) {
        message.error(_nodeError.message)
        console.error('donateNodeError', _nodeError, workerUrl)
        return
      }

      message.success('donate successful')

      // 成功后重新加载页面数据
      refresh()
      // 关闭弹窗
      close()
    },
    [refresh, close],
  )

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

      {loading ? (
        <Spin
          indicator={spinIcon}
          className={cx(
            'absolute top-0 left-0 w-full h-full rounded-lg bg-black/60 flex justify-center items-center',
          )}
        />
      ) : null}
    </div>
  )
}

export default DonateNode
