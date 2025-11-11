<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Layers, ZoomIn, ZoomOut, Fullscreen } from 'lucide-vue-next'
</script>

<template>
  <div class="flex gap-2">
    <el-button>
      <el-icon><Layers /></el-icon>
    </el-button>

    <el-button-group>
      <el-button>
        <el-icon><ZoomIn /></el-icon>
      </el-button>
      <el-button>
        <el-icon><Fullscreen /></el-icon>
      </el-button>
      <el-button>
        <el-icon><ZoomOut /></el-icon>
      </el-button>
    </el-button-group>
  </div>
</template>
