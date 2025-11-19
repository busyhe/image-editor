<template>
  <section
    class="w-full h-full"
    id="workspace"
    v-loading="templateStore.isLoading"
    element-loading-text="加载中..."
    element-loading-background="rgba(255, 255, 255, 0.8)"
  >
    <canvas class="w-300px h-300px mx-auto" id="canvas" />
  </section>
</template>

<script lang="ts" setup>
import { debounce } from 'lodash-es'
import { useTemplateStore } from '@/stores/modules/template'
// import { useEditorStore } from '@/store/modules/editor'
// import Operate from './components/Operate/index.vue'

const templateStore = useTemplateStore()
// const editorStore = useEditorStore()
// const rulerEnable = computed(() => editorStore.rulerEnable)
</script>

<style lang="scss" scoped>
.inside-shadow {
  box-shadow: inset 0 0 9px 2px #0000001f;
  pointer-events: none;
}
</style>
