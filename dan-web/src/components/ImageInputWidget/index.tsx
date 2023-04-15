import React, {
  ReactEventHandler,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react'
import cx from 'classnames'
import { PlusOutlined } from '@ant-design/icons'
import { message, Upload } from 'antd'
import type { UploadChangeParam } from 'antd/es/upload'
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface'
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface'

import styles from './index.module.css'

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}

const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!')
  }
  return isJpgOrPng && isLt2M
}

const customRequest = async (options: RcCustomRequestOptions<void>) => {
  const { onSuccess } = options
  if (onSuccess) onSuccess()
}

interface propTypes {
  onChanged: (src: string) => void
  onSize?: (width: number, height: number) => void
  disabled?: boolean
}

export interface ImageInputWidgetRefHandle {
  reset: () => void
}

const ImageInputWidget = forwardRef<ImageInputWidgetRefHandle, propTypes>(
  ({ onChanged, onSize, disabled }, forwardedRef) => {
    const [imageUrl, setImageUrl] = useState<string>()

    useImperativeHandle(
      forwardedRef,
      () => ({
        reset: () => {
          setImageUrl('')
        },
      }),
      [],
    )

    const handleChange: UploadProps['onChange'] = useCallback(
      (info: UploadChangeParam<UploadFile>) => {
        if (info.file.status === 'done') {
          // Get this url from response in real world.
          getBase64(info.file.originFileObj as RcFile, (url) => {
            setImageUrl(url)
            onChanged(url)
          })
        }
      },
      [onChanged],
    )

    const onImgLoad: ReactEventHandler<HTMLImageElement> = useCallback(
      ({ currentTarget: { naturalWidth, naturalHeight } }) => {
        if (onSize) onSize(naturalWidth, naturalHeight)
      },
      [onSize],
    )

    return (
      <div
        className={cx(styles.wrap, 'w-full flex justify-center items-center')}
        style={{ height: '100%' }}
      >
        <Upload
          name='srcPicture'
          listType='picture'
          className={cx(styles.upload, 'w-full')}
          showUploadList={false}
          customRequest={customRequest}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          disabled={disabled ?? false}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              onLoad={onImgLoad}
              alt='source'
              style={{ width: '100%' }}
            />
          ) : (
            <div
              className={cx(
                'w-full h-[200px]',
                styles.border_type,
                'bg-[#FAFAFA]',
                'flex flex-col items-center justify-center gap-4',
              )}
            >
              <PlusOutlined className={cx('text-[32px]')} />
              <div className={cx('text-base')}>
                Drop Image Here or Click to Upload
              </div>
            </div>
          )}
        </Upload>
      </div>
    )
  },
)
ImageInputWidget.displayName = 'ImageInputWidget'

export default ImageInputWidget
