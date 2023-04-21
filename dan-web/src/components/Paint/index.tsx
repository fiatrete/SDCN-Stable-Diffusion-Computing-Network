import React, { useCallback, useLayoutEffect, useRef } from 'react'
import cx from 'classnames'
import { Button, InputNumber, Slider } from 'antd'
import {
  ClearOutlined,
  CloseOutlined,
  EditOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { fabric } from 'fabric'

import styles from './index.module.css'

import useStateRef from 'utils/hooks/useStateRef'

interface Props {
  width: number
  height: number
  image: string
  onUpdate: (data: string) => void
  onClose: () => void
}

const Paint = (props: Props) => {
  const { width, height, image, onUpdate, onClose } = props

  const defaultSettings = useRef({
    brushSize: 20,
  })

  const EraserBrush = useRef(
    fabric.util.createClass(fabric.PencilBrush, {
      initialize: function (canvas: fabric.Canvas) {
        this.callSuper('initialize', canvas)
        this.color = 'white'
      },
      drawPath: function (ctx: CanvasRenderingContext2D, path: fabric.Path) {
        ctx.save()
        ctx.globalCompositeOperation = 'destination-out'
        this.callSuper('drawPath', ctx, path)
        ctx.restore()
      },
    }),
  )

  const makeNewLayer = useCallback((width: number, height: number) => {
    const newLayer = new fabric.Rect({
      width: width,
      height: height,
      left: 0,
      top: 0,
      fill: 'rgba(250, 250, 250, 0)',
      absolutePositioned: true,
      selectable: false,
    })

    const newGroup = new fabric.Group([newLayer], {
      selectable: false,
      absolutePositioned: true,
    })

    return newGroup
  }, [])

  const [brushSize, setBrushSize, brushSizeRef] = useStateRef(
    defaultSettings.current.brushSize,
  )
  const [paintAction, setPaintAction, paintActionRef] = useStateRef<
    'draw' | 'erase'
  >('draw')
  const containerElRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const cursorLayerRef = useRef(
    new fabric.Circle({
      width: brushSize,
      height: brushSize,
      radius: brushSize / 2,
      left: 0,
      originX: 'center',
      originY: 'center',
      angle: 0,
      fill: 'white',
      stroke: 'white',
      strokeWidth: 0,
      opacity: 1,
    }),
  )
  const drawResultLayerRef = useRef<fabric.Group>()
  const fabricCanvasRef = useRef<fabric.Canvas>()
  const pencilBrushRef = useRef<fabric.BaseBrush>()
  const eraserBrushRef = useRef<fabric.BaseBrush>()

  const calcCanvasSize = useCallback((): { width: number; height: number } => {
    const containerEl = containerElRef.current
    if (containerEl === null) {
      return { width: 0, height: 0 }
    }

    const containerElSize = containerEl.getBoundingClientRect()
    const containerElWidthHeightRatio =
      containerElSize.width / containerElSize.height
    const imageWidthHeightRatio = width / height
    const canvasSize = {
      width: 0,
      height: 0,
    }
    if (containerElWidthHeightRatio < imageWidthHeightRatio) {
      canvasSize.width = containerElSize.width
      canvasSize.height = canvasSize.width / imageWidthHeightRatio
    } else {
      canvasSize.height = containerElSize.width
      canvasSize.width = height * imageWidthHeightRatio
    }

    return canvasSize
  }, [height, width])

  const handleClickCloseButton = useCallback(() => {
    onClose()
  }, [onClose])

  const handleClickResetButton = useCallback(() => {
    const fabricCanvas = fabricCanvasRef.current
    if (fabricCanvas === undefined) {
      return
    }

    setPaintAction('draw')
    setBrushSize(defaultSettings.current.brushSize)

    cursorLayerRef.current.width = defaultSettings.current.brushSize
    cursorLayerRef.current.height = defaultSettings.current.brushSize
    cursorLayerRef.current.radius = defaultSettings.current.brushSize / 2
    cursorLayerRef.current.set('strokeWidth', 0)
    cursorLayerRef.current.set('fill', 'white')

    if (pencilBrushRef.current !== undefined) {
      pencilBrushRef.current.width = defaultSettings.current.brushSize
      fabricCanvas.freeDrawingBrush = pencilBrushRef.current
      if (drawResultLayerRef.current !== undefined) {
        fabricCanvas.remove(drawResultLayerRef.current)
      }
      const canvasSize = calcCanvasSize()
      drawResultLayerRef.current = makeNewLayer(
        canvasSize.width,
        canvasSize.height,
      )
      fabricCanvas.add(drawResultLayerRef.current)
      fabricCanvas.renderAll()
    }

    onUpdate('')
  }, [calcCanvasSize, makeNewLayer, onUpdate, setBrushSize, setPaintAction])

  const handleClickDrawButton = useCallback(() => {
    setPaintAction('draw')

    const fabricCanvas = fabricCanvasRef.current
    const pencilBrush = pencilBrushRef.current
    const cursorLayer = cursorLayerRef.current
    if (fabricCanvas === undefined || pencilBrush === undefined) {
      return
    }

    cursorLayer.set('strokeWidth', 0)
    cursorLayer.set('fill', 'white')
    fabricCanvas.freeDrawingBrush = pencilBrush
  }, [setPaintAction])

  const handleClickEraseButton = useCallback(() => {
    setPaintAction('erase')
    const fabricCanvas = fabricCanvasRef.current
    const eraserBrush = eraserBrushRef.current
    const cursorLayer = cursorLayerRef.current
    if (fabricCanvas === undefined || eraserBrush === undefined) {
      return
    }

    cursorLayer.set('stroke', 'red')
    cursorLayer.set('strokeWidth', 2)
    cursorLayer.set('fill', '')
    fabricCanvas.freeDrawingBrush = eraserBrush
  }, [setPaintAction])

  const handleInputBrushSizeChanged = useCallback(
    (v: number | null) => {
      const newWidth = v || defaultSettings.current.brushSize
      setBrushSize(newWidth)

      const cursorLayer = cursorLayerRef.current
      cursorLayer.set('width', newWidth)
      cursorLayer.set('height', newWidth)
      cursorLayer.set('radius', newWidth / 2)

      const pencilBrush = pencilBrushRef.current
      if (pencilBrush !== undefined) {
        pencilBrush.width = newWidth
      }
      const eraserBrush = eraserBrushRef.current
      if (eraserBrush !== undefined) {
        eraserBrush.width = newWidth
      }
    },
    [setBrushSize],
  )

  useLayoutEffect(() => {
    const containerEl = containerElRef.current
    const canvasEl = canvasElRef.current
    if (containerEl === null || canvasEl === null) {
      return
    }

    const canvasSize = calcCanvasSize()
    const fabricCanvas = new fabric.Canvas(canvasEl, {
      width: canvasSize.width,
      height: canvasSize.height,
      isDrawingMode: true,
      interactive: false,
      selection: false,
      freeDrawingCursor: 'crosshair',
    })
    const cursorLayer = cursorLayerRef.current
    const drawResultLayer = makeNewLayer(canvasSize.width, canvasSize.height)
    const pencilBrush = new fabric.PencilBrush(fabricCanvas)
    const eraserBrush = new EraserBrush.current(fabricCanvas)

    pencilBrush.width = brushSizeRef.current
    pencilBrush.color = 'white'
    pencilBrush.strokeLineCap = 'round'
    pencilBrush.strokeLineJoin = 'round'

    eraserBrush.width = brushSizeRef.current
    eraserBrush.color = 'red'
    eraserBrush.strokeLineCap = 'round'
    eraserBrush.strokeLineJoin = 'round'

    drawResultLayerRef.current = drawResultLayer
    fabricCanvasRef.current = fabricCanvas
    pencilBrushRef.current = pencilBrush
    eraserBrushRef.current = eraserBrush

    fabricCanvas.freeDrawingBrush = pencilBrush
    fabricCanvas.add(drawResultLayer)
    fabricCanvas.add(cursorLayer)

    const handleMouseMove = (event: fabric.IEvent<Event>) => {
      const pointer = fabricCanvas.getPointer(event.e)

      cursorLayer.left = pointer.x
      cursorLayer.top = pointer.y

      fabricCanvas.renderAll()
    }
    const handlePathCreated = async (e: fabric.IEvent<Event>) => {
      const fabricCanvas = fabricCanvasRef.current
      const drawResultLayer = drawResultLayerRef.current
      if (fabricCanvas === undefined || drawResultLayer === undefined) {
        return
      }

      // @ts-expect-error custom property
      const drawPath = e.path as fabric.Path
      if (drawPath === undefined) {
        return
      }

      const drawPathCloned = (await new Promise((resolve) =>
        drawPath.clone(resolve),
      )) as fabric.Path

      if (paintActionRef.current === 'draw') {
        drawPathCloned.globalCompositeOperation = 'source-over'
        drawPathCloned.stroke = 'black'
        drawPathCloned.opacity = 1
        drawResultLayer.addWithUpdate(drawPathCloned)
      } else if (paintActionRef.current === 'erase') {
        drawPathCloned.globalCompositeOperation = 'destination-out'
        drawResultLayer.addWithUpdate(drawPathCloned)
      }

      fabricCanvas.remove(drawPath)

      const resultData = drawResultLayer.toDataURL({
        format: 'jpeg',
        quality: 100,
      })
      onUpdate(resultData.split('base64,')[1])
    }

    fabricCanvas.on('mouse:move', handleMouseMove)
    fabricCanvas.on('path:created', handlePathCreated)

    return () => {
      fabricCanvas.off('mouse:move', handleMouseMove)
      fabricCanvas.off('path:created', handlePathCreated)
    }
  }, [
    brushSizeRef,
    calcCanvasSize,
    height,
    makeNewLayer,
    onUpdate,
    paintActionRef,
    width,
  ])

  return (
    <div
      className={cx(
        'w-full h-full flex flex-col justify-center gap-2',
        styles.wrap,
      )}
      ref={containerElRef}
    >
      <div className={cx('relative w-full')}>
        <div
          className={cx(
            'absolute top-0 left-0 w-full z-[2] flex flex-col justify-center',
          )}
        >
          <canvas ref={canvasElRef} />
        </div>
        <img
          src={image}
          alt=''
          className={cx('w-full h-full object-contain')}
        />
        <div
          className={cx('absolute right-2 bottom-2 z-[3] flex flex-col gap-2')}
        >
          <Button
            icon={<CloseOutlined />}
            onClick={handleClickCloseButton}
            title='Close'
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleClickResetButton}
            title='Reset'
          />
          {paintAction === 'erase' && (
            <Button
              icon={<EditOutlined />}
              onClick={handleClickDrawButton}
              title='Erase'
            />
          )}
          {paintAction === 'draw' && (
            <Button
              icon={<ClearOutlined />}
              onClick={handleClickEraseButton}
              title='Draw'
            />
          )}
        </div>
      </div>
      <div className={cx('flex justify-between items-center px-2 gap-2')}>
        <span>Brush Size</span>
        <Slider
          className={cx('flex flex-1')}
          min={5}
          max={100}
          onChange={handleInputBrushSizeChanged}
          value={brushSize}
        />
        <InputNumber
          className={cx('w-[60px]')}
          min={5}
          max={100}
          value={brushSize}
          onChange={handleInputBrushSizeChanged}
        />
      </div>
    </div>
  )
}

export default Paint
