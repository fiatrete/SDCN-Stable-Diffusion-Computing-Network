import { Button, Typography } from 'antd'
import cx from 'classnames'
import React, { Fragment, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { faqData, introduceData } from './data'

import styles from './index.module.css'

const { Title, Paragraph } = Typography

const Portal = () => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
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
  }, [location])

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
