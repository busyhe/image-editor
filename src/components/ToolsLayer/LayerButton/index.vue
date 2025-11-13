<script setup lang="ts">
import { Layers, ZoomIn, ZoomOut, Fullscreen } from 'lucide-vue-next'
import { useEditorStore } from '@/stores/modules/editor'
import Drag from './Drag.vue'

const editorStore = useEditorStore()

const handleZoomIn = () => {
  editorStore.editor.big()
}

const handleFullscreen = () => {
  editorStore.editor.auto()
}

const handleZoomOut = () => {
  editorStore.editor.small()
}
</script>

<template>
  <div class="flex gap-2 items-center">
    <el-button>
      <el-icon><Layers /></el-icon>
    </el-button>

    <el-button-group>
      <el-button @click="handleZoomIn">
        <el-icon><ZoomIn /></el-icon>
      </el-button>
      <el-button @click="handleFullscreen">
        <el-icon><Fullscreen /></el-icon>
      </el-button>
      <el-button @click="handleZoomOut">
        <el-icon><ZoomOut /></el-icon>
      </el-button>
    </el-button-group>

    <Drag />
  </div>
</template>
