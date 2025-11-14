<script setup lang="ts">
import { onMounted } from 'vue'
import { texts } from '@/enums/editor'
import { debounce } from 'lodash-es'
import { useEditorStore } from '@/stores/modules/editor'
import { textList } from '@/constants/editor'

const editorStore = useEditorStore()
const defaultPosition = { shadow: '', fontFamily: 'arial' }

const handleAddText = debounce(function (type: texts) {
  let text: fabric.IText | null
  switch (type) {
    case texts.h1:
      text = new fabric.Textbox('双击编辑标题', {
        ...defaultPosition,
        fontWeight: 'bold',
        fontSize: 80,
        fill: '#000000',
      })
      break
    case texts.h2:
      text = new fabric.Textbox('双击编辑标题', {
        ...defaultPosition,
        fontWeight: 'bold',
        fontSize: 60,
        fill: '#000000',
      })
      break
    case texts.normal:
      text = new fabric.Textbox('双击编辑标题', {
        ...defaultPosition,
        fontSize: 48,
        fill: '#000000',
      })
      break
    default:
      break
  }
  text! && editorStore.editor.addBaseType(text, { center: true })
}, 250)

onMounted(() => {})
</script>

<template>
  <div class="text-panel">
    <template v-for="item in textList" :key="item.type">
      <el-button class="w-full mt-2" @click="handleAddText(item.type)">
        新增{{ item.name }}
      </el-button>
    </template>

    <el-divider />
  </div>
</template>

<style lang="scss" scoped>
::v-deep .el-button + .el-button {
  margin-left: 0;
}
</style>
