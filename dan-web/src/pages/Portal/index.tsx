import { Button, Statistic, Typography } from 'antd'
import cx from 'classnames'
import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { faqData, introduceData } from './data'

import styles from './index.module.css'
import { ImageGenerationStatisticsResponseData } from 'api/statistics'
import { AxiosError } from 'axios'
import to from 'await-to-js'
import * as statisticsApi from 'api/statistics'

const { Title, Paragraph } = Typography

const Portal = () => {
  const [
    imageGenerationStatisticsResponseData,
    setImageGenerationStatisticsResponseData,
  ] = useState<ImageGenerationStatisticsResponseData | null>(null)

  const navigate = useNavigate()
  const location = useLocation()

  const getImageGenerationStatistics = useCallback(async () => {
    const [_statisticsError, _statistics] = await to<
      ImageGenerationStatisticsResponseData,
      AxiosError
    >(statisticsApi.getImageGenerationStatistics())

    if (_statisticsError !== null) {
      setImageGenerationStatisticsResponseData(null)
      console.error('getImageGenerationStatisticsError', _statisticsError)
      return
    }

    console.log(_statistics)

    setImageGenerationStatisticsResponseData(_statistics)
  }, [setImageGenerationStatisticsResponseData])

  useEffect(() => {
    // scroll to anchor
    const hash = location.hash
    if (hash) {
      const offsetY = -80
      const element = document.querySelector<HTMLElement>(hash)
      if (element) {
        window.scrollTo({
          top: element.offsetTop + offsetY,
          behavior: 'smooth',
        })
      }
    } else {
      window.scrollTo({
        top: 0,
      })
    }

    getImageGenerationStatistics()
  }, [location, getImageGenerationStatistics])

  return (
    <div className={cx('mt-auto', styles.wrap)}>
      <div className={cx(styles.contentWrap)}>
        <Title className={cx('text-center')} level={1} ellipsis>
          Stable Diffusion Computing Network
        </Title>
        {introduceData.map((data, i) => (
          <Paragraph key={i}>{data}</Paragraph>
        ))}

        <div className={cx('text-center mt-9')}>
          <Title level={2} className={cx('text-center')}>
            Image Generation Data
          </Title>
          <div className={cx('mt-9 flex justify-around')}>
            <Statistic
              title='Total generated (images)'
              value={imageGenerationStatisticsResponseData?.totalCount ?? '--'}
              valueStyle={{ textAlign: 'left' }}
            />
            <Statistic
              title='The last week (images)'
              value={
                imageGenerationStatisticsResponseData?.countInLastWeek ?? '--'
              }
              valueStyle={{ textAlign: 'left' }}
            />
            <Statistic
              title='The last 24 hours (images)'
              value={
                imageGenerationStatisticsResponseData?.countInLast24Hours ??
                '--'
              }
              valueStyle={{ textAlign: 'left' }}
            />
          </div>
        </div>

        <div className={cx('text-center mt-9')}>
          <Button
            type='primary'
            onClick={() => {
              navigate('/play')
            }}
          >
            Get Started with a Playground
          </Button>
        </div>

        <div className={cx('w-10/12 mx-auto mt-32')}>
          <Title id='faq' level={2} className={cx('text-center')}>
            Frequently asked questions
          </Title>
          {faqData.map((data, i) => (
            <Fragment key={i}>
              <Title level={5}>{data.q}</Title>
              {data.a.map((answer, j) => (
                <Paragraph className={cx('mt-3', styles.answer)} key={j}>
                  {answer}
                </Paragraph>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Portal
