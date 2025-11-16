/*
 * @Author: 秦少卫
 * @Date: 2023-02-03 23:29:34
 * @LastEditors: June
 * @LastEditTime: 2024-11-02 22:19:36
 * @Description: 核心入口文件
 */
import Editor from './Editor'
// 对齐辅助线插件 - 对齐辅助线对象
export { default as AlignGuidLinePlugin } from './plugin/AlignGuidLinePlugin'

// 条码插件 - 条码对象
// export { default as BarCodePlugin } from './plugin/BarCodePlugin'

// 控制插件 - 控制对象
export { default as ControlsPlugin } from './plugin/ControlsPlugin'

// 控制旋转插件 - 控制旋转对象
export { default as ControlsRotatePlugin } from './plugin/ControlsRotatePlugin'

// 复制插件 - 复制对象
export { default as CopyPlugin } from './plugin/CopyPlugin'

// 删除快捷键插件 - 通过键盘删除对象
export { default as DeleteHotKeyPlugin } from './plugin/DeleteHotKeyPlugin'

// 绘制直线插件 - 通过键盘绘制直线
export { default as DrawLinePlugin } from './plugin/DrawLinePlugin'

// 绘制多边形插件 - 通过键盘绘制多边形
export { default as DrawPolygonPlugin } from './plugin/DrawPolygonPlugin'

// 旋转插件 - 旋转对象
export { default as DringPlugin } from './plugin/DringPlugin'

// 翻转插件 - 翻转对象
export { default as FlipPlugin } from './plugin/FlipPlugin'

// 字体插件 - 管理字体
export { default as FontPlugin } from './plugin/FontPlugin'

// 自由绘制插件 - 自由绘制对象
// export { default as FreeDrawPlugin } from './plugin/FreeDrawPlugin'

// 组对齐插件 - 组对齐对象
export { default as GroupAlignPlugin } from './plugin/GroupAlignPlugin'

// 组插件 - 将多个对象组合成一个对象
export { default as GroupPlugin } from './plugin/GroupPlugin'

// 组文本编辑插件 - 编辑组文本
export { default as GroupTextEditorPlugin } from './plugin/GroupTextEditorPlugin'

// 图像描边插件 - 描边图像
export { default as ImageStroke } from './plugin/ImageStroke'

// 图层插件 - 管理图层
export { default as LayerPlugin } from './plugin/LayerPlugin'

// 锁定插件 - 锁定对象
export { default as LockPlugin } from './plugin/LockPlugin'

// 蒙层插件 - 蒙层对象
export { default as MaskPlugin } from './plugin/MaskPlugin'

// 材质插件 - 材质对象
export { default as MaterialPlugin } from './plugin/MaterialPlugin'

// 移动快捷键插件 - 通过键盘方向键移动对象
export { default as MoveHotKeyPlugin } from './plugin/MoveHotKeyPlugin'

// 路径文本插件 - 路径文本对象
// export { default as PathTextPlugin } from './plugin/PathTextPlugin'

// 多边形修改插件 - 修改多边形对象
export { default as PolygonModifyPlugin } from './plugin/PolygonModifyPlugin'

// PSD插件 - 导入PSD文件
// export { default as PsdPlugin } from './plugin/PsdPlugin'

// QR码插件 - 生成QR码
// export { default as QrCodePlugin } from './plugin/QrCodePlugin'

// 简单裁剪图像插件 - 裁剪图像
export { default as SimpleClipImagePlugin } from './plugin/SimpleClipImagePlugin'

// 水印插件 - 水印对象
export { default as WaterMarkPlugin } from './plugin/WaterMarkPlugin'

// 添加基础类型插件 - 添加基础类型对象
export { default as AddBaseTypePlugin } from './plugin/AddBaseTypePlugin'

// 中心对齐插件 - 中心对齐对象
export { default as CenterAlignPlugin } from './plugin/CenterAlignPlugin'

// 历史记录插件 - 历史记录对象
export { default as HistoryPlugin } from './plugin/HistoryPlugin'
// 标尺插件 - 标尺对象
export { default as RulerPlugin } from './plugin/RulerPlugin'
// 工作区插件 - 工作区对象
export { default as WorkspacePlugin } from './plugin/WorkspacePlugin'

import EventType from './eventType'
import Utils from './utils/utils'
import CustomRect from './objects/CustomRect'
import CustomTextbox from './objects/CustomTextbox'
export { EventType, Utils, CustomRect, CustomTextbox }
export default Editor

export * from '@/interface/Editor'
