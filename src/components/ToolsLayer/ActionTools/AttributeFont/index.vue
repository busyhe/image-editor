<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, getCurrentInstance, watch } from 'vue'
import { ElLoading } from 'element-plus'
import useSelect from '@/hooks/select'
import { useEditorStore } from '@/stores/modules/editor'

const editorStore = useEditorStore()
const { isMatchType, isOne } = useSelect(['text', 'i-text', 'textbox'])
console.debug('[DEBUG__AttributeFont/index.vue-isMatchType]', isMatchType, isOne)
const update = getCurrentInstance()

const fontsList: any = ref([])
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
  }
}

// 通用属性改变
const changeCommon = (key: any, value: any) => {
  const activeObject = editorStore.canvas?.getActiveObjects()[0]
  if (activeObject) {
    activeObject && activeObject.set(key, value)
    editorStore.canvas?.renderAll()
  }
}

const selectCancel = () => {
  update?.proxy?.$forceUpdate()
}

const changeFontFamily = async (fontName: string) => {
  if (!fontName) return
  const loadingINstasncdee = ElLoading.service()
  editorStore.editor.loadFont(fontName).finally(() => loadingINstasncdee.close())
}
const changeFontWeight = (key: any, value: any) => {
  const nValue = value === 'normal' ? 'bold' : 'normal'
  baseAttr.fontWeight = nValue
  const activeObject = editorStore.canvas?.getActiveObjects()[0]
  activeObject && activeObject.set(key, nValue)
  editorStore.canvas?.renderAll()
}

// 斜体
const changeFontStyle = (key: any, value: any) => {
  const nValue = value === 'normal' ? 'italic' : 'normal'
  baseAttr.fontStyle = nValue
  const activeObject = editorStore.canvas?.getActiveObjects()[0]
  activeObject && activeObject.set(key, nValue)
  editorStore.canvas?.renderAll()
}

// 中划
const changeLineThrough = (key: any, value: any) => {
  const nValue = value === false
  baseAttr.linethrough = nValue
  const activeObject = editorStore.canvas?.getActiveObjects()[0]
  activeObject && activeObject.set(key, nValue)
  editorStore.canvas?.renderAll()
}

// 下划
const changeUnderline = (key: any, value: any) => {
  const nValue = value === false
  baseAttr.underline = nValue
  const activeObject = editorStore.canvas?.getActiveObjects()[0]
  activeObject && activeObject.set(key, nValue)
  editorStore.canvas?.renderAll()
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
  <div v-if="isOne && isMatchType" class="inline-block">
    <el-select v-model="baseAttr.fontFamily" class="w-[100px]!" @change="changeFontFamily">
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
  </div>
</template>
