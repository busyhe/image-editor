<script setup lang="ts">
import { Download } from 'lucide-vue-next'
import { debounce } from 'lodash-es'
import { useEditorStore } from '@/stores/modules/editor'

const editorStore = useEditorStore()

const cbMap = {
  saveImg() {
    editorStore.editor.saveImg()
  },
}

const saveWith = debounce(function (type) {
  cbMap[type] && typeof cbMap[type] === 'function' && cbMap[type]()
}, 300)
</script>

<template>
  <div>
    <el-dropdown placement="bottom-end" @command="saveWith">
      <el-button type="primary">
        <Download :size="16" />
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item>保存到项目</el-dropdown-item>
          <el-dropdown-item command="saveImg" divided>下载 png 图片</el-dropdown-item>
          <el-dropdown-item>保存 JSON 数据</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
