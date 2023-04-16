import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cx from 'classnames'
import { Button, Checkbox, Spin, Typography, message } from 'antd'
import styles from './index.module.css'
import { CheckboxValueType } from 'antd/es/checkbox/Group'
import ImageInputWidget, {
  ImageInputWidgetRefHandle,
} from 'components/ImageInputWidget'
import { AxiosError } from 'axios'
import { InterrogateResponseData } from 'api/interrogate'
import to from 'await-to-js'
import * as interrogateApi from 'api/interrogate'
import _ from 'lodash'
import { LoadingOutlined } from '@ant-design/icons'
import uiStore from 'stores/uiStore'
import { observer } from 'mobx-react-lite'

const { Title, Paragraph } = Typography

interface InterrogateModel {
  label: string
  value: string
  description?: string
}

const Interrogate = () => {
  const spinIcon = (
    <LoadingOutlined style={{ fontSize: 36, color: '#999' }} spin />
  )

  const imageUploaderRef = useRef<ImageInputWidgetRefHandle>(null)
  const [checkedModels, setCheckedModels] = useState(['clip'])
  const [results, setResults] = useState<InterrogateModel[]>([])
  const [loadingCounter, setLoadingCounter] = useState(0)

  const showLoading = useCallback(() => {
    setLoadingCounter((count) => count + 1)
  }, [setLoadingCounter])

  const hideLoading = useCallback(() => {
    setLoadingCounter((count) => count - 1)
  }, [setLoadingCounter])

  const resetLoading = useCallback(() => {
    setLoadingCounter(0)
  }, [setLoadingCounter])

  const isLoading = useMemo(() => loadingCounter > 0, [loadingCounter])

  const modelOptions = useMemo(
    () => [
      {
        label: 'CLIP',
        value: 'clip',
      },
      {
        label: 'DeepBooru',
        value: 'deepdanbooru',
      },
    ],
    [],
  )

  const onCheckboxChange = useCallback(
    (checkedValues: CheckboxValueType[]) => {
      setCheckedModels(checkedValues.map((value) => value as string))
    },
    [setCheckedModels],
  )

  const interrogate = useCallback(
    async (image: string, model: string) => {
      showLoading()

      const [_interrogateError, resp] = await to<
        InterrogateResponseData,
        AxiosError
      >(interrogateApi.interrogate(image, model))

      hideLoading()

      if (_interrogateError !== null) {
        setResults([])
        message.error(_interrogateError.message)
        console.error('interrogateError', _interrogateError, model)
        return
      }

      const currentModel = modelOptions.find((m) => m.value === model)
      if (currentModel) {
        setResults((r) =>
          _.sortBy(
            [...r, { ...currentModel, description: resp.caption }],
            (e) => e.value,
          ),
        )
      }
    },
    [setResults, modelOptions, showLoading, hideLoading],
  )

  const interrogateAll = useCallback(
    (image: string) => {
      setResults([])
      checkedModels.forEach(async (m) => await interrogate(image, m))
    },
    [interrogate, checkedModels, setResults],
  )

  const onImageChanged = useCallback(
    (image: string) => {
      interrogateAll(image)
    },
    [interrogateAll],
  )

  const reset = useCallback(() => {
    setResults([])
    imageUploaderRef.current?.reset()
  }, [imageUploaderRef, setResults])

  useEffect(() => {
    resetLoading()
  }, [resetLoading])

  return (
    <div
      className={cx(
        uiStore.isMobile
          ? [styles.wrap, 'w-full flex flex-col gap-4']
          : [styles.wrap, 'w-full flex flex-col gap-4 mt-8'],
      )}
    >
      <div>
        <Title level={5}>Interrogate</Title>
        <Paragraph>
          Interrogate images to get their predicted descriptions, tags.
        </Paragraph>
      </div>
      <div>
        <Checkbox.Group
          options={modelOptions}
          defaultValue={checkedModels}
          onChange={onCheckboxChange}
        />
      </div>
      <div className={cx(uiStore.isMobile ? ['w-full'] : ['w-3/6'])}>
        <Button
          className={cx('mb-2', {
            hidden: results.length === 0,
          })}
          onClick={reset}
        >
          New Interrogation
        </Button>
        <div
          className={cx('text-red-500', 'mb-2', {
            hidden: checkedModels.length !== 0,
          })}
        >
          Choose an interrogation option to proceed!
        </div>
        <ImageInputWidget
          onChanged={onImageChanged}
          disabled={checkedModels.length === 0}
          ref={imageUploaderRef}
        />
      </div>
      {results.map((m) => (
        <div key={m.value}>
          <Title level={5}>{m.label}</Title>
          <Paragraph>{m.description}</Paragraph>
        </div>
      ))}

      {isLoading ? (
        <Spin
          indicator={spinIcon}
          className={cx(
            'absolute top-0 left-0 w-full h-full rounded-lg bg-white/60 flex justify-center items-center',
          )}
        />
      ) : null}
    </div>
  )
}

export default observer(Interrogate)
