import { fabric } from 'fabric'
import type Editor from '../Editor'
import { SelectMode } from '../eventType'

export default class FlipPlugin implements IPluginTempl {
  static pluginName = 'FlipPlugin'
  static apis = ['flip']
  constructor(
    public canvas: fabric.Canvas,
    public editor: Editor,
  ) {}

  flip(type: 'X' | 'Y') {
    const activeObject = this.canvas.getActiveObject()
    if (activeObject) {
      activeObject.set(`flip${type}`, !activeObject[`flip${type}`]).setCoords()
      this.canvas.requestRenderAll()
    }
  }

  contextMenu() {
    const selectedMode = this.editor.getSelectMode()
    if (selectedMode === SelectMode.ONE) {
      return [
        {
          text: '翻转',
          hotkey: '❯',
          subitems: [
            {
              text: '水平翻转',
              hotkey: '|',
              onclick: () => this.flip('X'),
            },
            {
              text: '垂直翻转',
              hotkey: '-',
              onclick: () => this.flip('Y'),
            },
          ],
        },
      ]
    }
  }

  destroy() {
    console.log('pluginDestroy')
  }
}
