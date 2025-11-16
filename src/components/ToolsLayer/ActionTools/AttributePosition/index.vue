<script setup lang="ts">
import { SquareSquare } from 'lucide-vue-next'
import useSelect from '@/hooks/select'

// 可修改的元素
const baseType = [
  'text',
  'i-text',
  'textbox',
  'rect',
  'circle',
  'triangle',
  'polygon',
  'image',
  'group',
  'line',
  'arrow',
  'thinTailArrow',
]

const { isMatchType, isOne } = useSelect(baseType)
</script>

<template>
  <div>
    <el-popover placement="bottom" :width="400" trigger="click">
      <template #reference>
        <el-button>
          <SquareSquare :size="16" />
        </el-button>
      </template>

      <main class="p-2!">
        <h2 class="text-14px font-bold">排列</h2>
        <el-divider class="my-2!" />
      </main>
    </el-popover>
  </div>
</template>
