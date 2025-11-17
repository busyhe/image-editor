import type { fabric } from 'fabric'

/**
 * 工作区配置
 */
export interface WorkSpace {
  width: number
  height: number
  fill: string | fabric.Pattern | fabric.Gradient
  fillType: number // 0: 纯色, 1: 渐变, 2: 图案
}

/**
 * 画布元素（fabric 对象）
 */
export interface CanvasElement extends fabric.Object {
  id: string
  [key: string]: any
}

/**
 * 模板页面
 */
export interface Template {
  id: string // 唯一标识
  width: number // 画布宽度
  height: number // 画布高度
  zoom: number // 缩放比例
  objects: fabric.Object[] // 画布对象列表
  backgroundImage?: fabric.Image | string // 背景图
  backgroundColor?: string // 背景色
  preview?: Blob | string // 预览图
  workSpace: WorkSpace // 工作区配置
  clip?: number // 裁剪
  version?: string // fabric 版本
  [key: string]: any
}

