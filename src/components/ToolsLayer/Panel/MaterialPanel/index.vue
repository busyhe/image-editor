<script setup lang="ts">
import { ref, inject, onMounted, watch } from 'vue'
import { Search } from 'lucide-vue-next'
import { fabric } from 'fabric'
import { v4 as uuid } from 'uuid'

const activeIndex = ref('deliver')
const canvasEditor = inject('canvasEditor') as any
const searchText = ref('')
const loading = ref(false)
const noMore = ref(false)
const list = ref<any[]>([])
const page = ref(1)
const pageSize = 10

// Mock data generator
const generateMockData = (page: number, type: string) => {
  const data = []
  const startId = (page - 1) * pageSize
  for (let i = 0; i < pageSize; i++) {
    const id = startId + i
    // Using placeholder images for demo
    const width = 300
    const height = Math.floor(Math.random() * (400 - 200 + 1)) + 200 // Random height
    data.push({
      id,
      url: `https://picsum.photos/${width}/${height}?random=${id}&type=${type}`,
      title: `${type} Material ${id + 1}`,
    })
  }
  return data
}

const loadData = async () => {
  if (loading.value || noMore.value) return
  loading.value = true

  // Simulate API delay
  setTimeout(() => {
    const newData = generateMockData(page.value, activeIndex.value)
    list.value.push(...newData)
    page.value++
    loading.value = false
    if (page.value > 5) {
      // Limit to 5 pages for mock
      noMore.value = true
    }
  }, 500)
}

const handleSelect = (key: string) => {
  if (activeIndex.value === key) return
  activeIndex.value = key
  // Reset list
  list.value = []
  page.value = 1
  noMore.value = false
  loadData()
}

const handleSearch = () => {
  // In a real app, this would filter the query
  list.value = []
  page.value = 1
  noMore.value = false
  loadData()
}

const addToCanvas = (item: any) => {
  fabric.Image.fromURL(
    item.url,
    (img) => {
      img.set({
        id: uuid(),
        left: 100,
        top: 100,
      })
      // Scale down if too big
      if (img.width && img.width > 300) {
        img.scaleToWidth(300)
      }
      canvasEditor.canvas.add(img)
      canvasEditor.canvas.setActiveObject(img)
      canvasEditor.canvas.renderAll()
    },
    { crossOrigin: 'anonymous' },
  )
}

onMounted(() => {
  loadData()
})

watch(activeIndex, () => {
  // handleSelect handles the logic, but if activeIndex changes externally
})
</script>

<template>
  <div class="material-panel h-full flex flex-col bg-white">
    <!-- Tabs -->
    <el-menu
      :default-active="activeIndex"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
      class="border-b border-gray-200"
    >
      <el-menu-item index="deliver">投放素材</el-menu-item>
      <el-menu-item index="source">源素材</el-menu-item>
      <el-menu-item index="inspiration">灵感素材</el-menu-item>
    </el-menu>

    <!-- Search -->
    <div class="p-4 pb-2">
      <el-input
        v-model="searchText"
        placeholder="搜索素材"
        :prefix-icon="Search"
        clearable
        @input="handleSearch"
      />
    </div>

    <!-- List -->
    <div
      class="flex-1 overflow-y-auto p-4 custom-scrollbar"
      v-infinite-scroll="loadData"
      :infinite-scroll-disabled="loading || noMore"
      :infinite-scroll-distance="10"
    >
      <div class="grid grid-cols-2 gap-3">
        <div
          v-for="item in list"
          :key="item.id"
          class="material-item group relative rounded-lg overflow-hidden cursor-pointer bg-gray-50 border border-gray-100 hover:shadow-md transition-all"
          @click="addToCanvas(item)"
        >
          <img
            :src="item.url"
            class="w-full h-auto object-cover block min-h-[100px]"
            loading="lazy"
            alt=""
          />
          <div
            class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100"
          >
            <span class="text-xs text-white bg-black/50 px-1.5 py-0.5 rounded truncate w-full">{{
              item.title
            }}</span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-4 text-gray-400 text-sm">加载中...</div>
      <div v-if="noMore && list.length > 0" class="text-center py-4 text-gray-400 text-sm">
        没有更多了
      </div>
      <div v-if="!loading && list.length === 0" class="text-center py-8 text-gray-400 text-sm">
        暂无数据
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-menu--horizontal) {
  height: 40px;
  border-bottom: 1px solid #e5e7eb;

  .el-menu-item {
    height: 40px;
    line-height: 40px;
    border-bottom: 2px solid transparent;
    color: #666;
    padding: 0 14px;
    flex: 1;
    justify-content: center;

    &.is-active {
      color: var(--el-color-primary);
      border-bottom-color: var(--el-color-primary);
    }
  }
}

.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 2px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}
</style>
