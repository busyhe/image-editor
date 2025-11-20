<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElLoading } from 'element-plus'
import { Bold, Italic, Underline, Baseline } from 'lucide-vue-next'
import ColorPicker from '../ColorPicker/index.vue'
import useSelect from '@/hooks/select'
import { useEditorStore } from '@/stores/modules/editor'

const editorStore = useEditorStore()
const { isMatchType, isOne } = useSelect(['text', 'i-text', 'textbox'])

const fontsList: any = ref([])
const fontSizeList = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 48, 56, 64, 72]
const baseAttr = reactive<Record<string, any>>({
  fontSize: 0,
  fontFamily: '',
  lineHeight: 0,
  charSpacing: 0,
  fontWeight: '',
  textBackgroundColor: '#fff',
  textAlign: '',
  fontStyle: '',
  underline: false,
  linethrough: false,
  overline: false,
  fill: '',
})

// 属性获取
const getObjectAttr = (e?: any) => {
  const activeObject = editorStore.canvas?.getActiveObject() as any
  if (e && e.target && e.target !== activeObject) return
  if (activeObject && isMatchType) {
    baseAttr.fontSize = activeObject.get('fontSize')
    baseAttr.fontFamily = activeObject.get('fontFamily')
    baseAttr.lineHeight = activeObject.get('lineHeight')
    baseAttr.textAlign = activeObject.get('textAlign')
    baseAttr.underline = activeObject.get('underline')
    baseAttr.linethrough = activeObject.get('linethrough')
    baseAttr.charSpacing = activeObject.get('charSpacing')
    baseAttr.overline = activeObject.get('overline')
    baseAttr.fontStyle = activeObject.get('fontStyle')
    baseAttr.textBackgroundColor = activeObject.get('textBackgroundColor')
    baseAttr.fontWeight = activeObject.get('fontWeight')
    baseAttr.fill = activeObject.get('fill')
  }
}

// 通用属性改变
const changeCommon = (key: any, value: any) => {
  const activeObject = editorStore.canvas?.getActiveObjects()[0] as any
  if (activeObject) {
    activeObject.set(key, value)
    editorStore.canvas?.renderAll()
  }
}

const selectCancel = () => {
  // update?.proxy?.$forceUpdate() // Removed as getCurrentInstance and update are not used
}

const changeFontFamily = async (fontName: string) => {
  if (!fontName) return
  const loadingINstasncdee = ElLoading.service()
  editorStore.editor.loadFont(fontName).finally(() => loadingINstasncdee.close())
}
const changeFontWeight = () => {
  const value = baseAttr.fontWeight
  const nValue = value === 'normal' ? 'bold' : 'normal'
  baseAttr.fontWeight = nValue
  const activeObject = editorStore.canvas?.getActiveObjects()[0] as any
  if (activeObject) {
    activeObject.set('fontWeight', nValue)
    editorStore.canvas?.renderAll()
  }
}

// 斜体
const changeFontStyle = () => {
  const value = baseAttr.fontStyle
  const nValue = value === 'normal' ? 'italic' : 'normal'
  baseAttr.fontStyle = nValue
  const activeObject = editorStore.canvas?.getActiveObjects()[0] as any
  if (activeObject) {
    activeObject.set('fontStyle', nValue)
    editorStore.canvas?.renderAll()
  }
}

// 中划
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const changeLineThrough = (key: any, value: any) => {
  const nValue = value === false
  baseAttr.linethrough = nValue
  const activeObject = editorStore.canvas?.getActiveObjects()[0] as any
  if (activeObject) {
    activeObject.set(key, nValue)
    editorStore.canvas?.renderAll()
  }
}

// 下划
const changeUnderline = () => {
  const value = baseAttr.underline
  const nValue = !value
  baseAttr.underline = nValue
  const activeObject = editorStore.canvas?.getActiveObjects()[0] as any
  if (activeObject) {
    activeObject.set('underline', nValue)
    editorStore.canvas?.renderAll()
  }
}

onMounted(() => {
  const init = () => {
    editorStore.editor?.getFontList().then((list: any) => {
      console.debug('[DEBUG__AttributeFont/index.vue-list]', list)
      fontsList.value = list
    })
    getObjectAttr()
    editorStore.editor?.on('selectCancel', selectCancel)
    editorStore.editor?.on('selectOne', getObjectAttr)
    editorStore.canvas?.on('object:modified', getObjectAttr)
  }

  if (editorStore.editor) {
    init()
  } else {
    const stop = watch(
      () => editorStore.editor,
      (val) => {
        if (val) {
          init()
          stop()
        }
      },
    )
  }
})

onBeforeUnmount(() => {
  editorStore.editor?.off('selectCancel', selectCancel)
  editorStore.editor?.off('selectOne', getObjectAttr)
  editorStore.canvas?.off('object:modified', getObjectAttr)
})
</script>

<template>
  <div v-if="isOne && isMatchType" class="inline-flex items-center gap-2">
    <el-select v-model="baseAttr.fontFamily" class="w-[120px]!" @change="changeFontFamily">
      <el-option
        v-for="item in fontsList"
        :value="item.name"
        :label="item.name"
        :key="`font-${item.name}`"
      >
        <div
          class="font-item"
          :style="`background-image:url('${item.img}');height: 100%;background-size: 100% 100%;`"
        >
          {{ !item.img ? item : '' }}
          <span style="display: none">{{ item.name }}</span>
        </div>
      </el-option>
    </el-select>

    <el-select
      v-model="baseAttr.fontSize"
      class="w-18!"
      @change="(val: any) => changeCommon('fontSize', val)"
    >
      <el-option v-for="size in fontSizeList" :key="size" :label="size" :value="size" />
    </el-select>

    <el-button-group>
      <el-button
        :type="baseAttr.fontWeight === 'bold' ? 'primary' : ''"
        @click="changeFontWeight"
        plain
      >
        <Bold :size="16" />
      </el-button>
      <el-button
        :type="baseAttr.fontStyle === 'italic' ? 'primary' : ''"
        @click="changeFontStyle"
        plain
      >
        <Italic :size="16" />
      </el-button>
      <el-button :type="baseAttr.underline ? 'primary' : ''" @click="changeUnderline" plain>
        <Underline :size="16" />
      </el-button>
    </el-button-group>

    <el-popover placement="bottom" trigger="click" width="auto">
      <template #reference>
        <el-button class="w-8! px-0!">
          <Baseline :size="16" :style="{ color: baseAttr.fill }" />
        </el-button>
      </template>
      <ColorPicker :model-value="baseAttr.fill" @change="(val: any) => changeCommon('fill', val)" />
    </el-popover>
  </div>
</template>
