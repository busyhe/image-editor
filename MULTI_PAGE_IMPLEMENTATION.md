# 多页面管理功能实现说明

## 已实现的功能

### 1. 类型定义

- 创建了 `src/types/template.ts`，定义了 Template、WorkSpace、CanvasElement 等类型
- 完整的 TypeScript 类型支持

### 2. Template Store 增强

在 `src/stores/modules/template.ts` 中实现了以下功能：

- **switchTemplate(index)**: 切换到指定索引的页面
- **addTemplate(template)**: 添加新页面（单个或多个）
- **duplicateTemplate(templateId?)**: 复制当前或指定页面
- **deleteTemplate(templateId?)**: 删除当前或指定页面
- **renderTemplate()**: 将模板数据渲染到主画布
- **updateThumbnail()**: 更新当前页面的缩略图
- **syncCanvasToTemplate()**: 同步画布状态到模板数据
- **templateCanvas**: Map 结构存储每个页面的缩略图画布

### 3. 缩略图组件

`src/components/ToolsLayer/Templates/TemplateThumb.vue` 提供：

- 使用 fabric.StaticCanvas 渲染缩略图
- 自动计算缩放比例，保持宽高比
- 响应式更新（深度监听模板数据变化）
- 支持激活状态的视觉反馈
- 懒加载支持（通过 visible 属性控制）

### 4. 页面列表管理界面

`src/components/ToolsLayer/Templates/index.vue` 实现：

- 页面列表展示（带编号和缩略图）
- 拖拽排序（使用 vuedraggable）
- 点击切换页面
- 新增页面按钮
- 复制页面按钮
- 删除页面按钮（至少保留一个页面）
- 当前页码 / 总页数显示

### 5. 实时缩略图更新

在 `src/views/Home.vue` 中集成：

- 监听 canvas 的 `object:added` 事件
- 监听 canvas 的 `object:modified` 事件
- 监听 canvas 的 `object:removed` 事件
- 监听 editor 的 `sizeChange` 事件（画布大小变化）
- 使用节流（throttle）优化性能，500ms 延迟
- 自动排除 workspace 对象的变化
- **画布大小变化时自动更新缩略图比例**

### 6. 初始化处理

- 应用启动时自动创建默认的第一个页面（如果没有模板）
- 默认画布尺寸：900 x 2000
- 默认背景色：白色

## 使用方法

### 切换页面

```typescript
const templateStore = useTemplateStore()
templateStore.switchTemplate(1) // 切换到索引为 1 的页面
```

### 添加新页面

```typescript
await templateStore.addTemplate({
  id: 'unique-id',
  width: 900,
  height: 2000,
  zoom: 1,
  objects: [...],
  backgroundColor: '#ffffff',
  workSpace: { ... }
})
```

### 复制当前页面

```typescript
await templateStore.duplicateTemplate()
```

### 删除页面

```typescript
await templateStore.deleteTemplate() // 删除当前页面
// 或
await templateStore.deleteTemplate('template-id') // 删除指定页面
```

### 手动更新缩略图

```typescript
templateStore.syncCanvasToTemplate() // 同步画布到模板并更新缩略图
```

## 技术特点

1. **性能优化**
   - 使用节流（throttle）减少缩略图更新频率
   - 懒加载缩略图（初始只加载前 20 个）
   - 使用 Map 缓存缩略图画布实例

2. **类型安全**
   - 完整的 TypeScript 类型定义
   - 类型检查覆盖所有核心功能

3. **用户体验**
   - 拖拽排序直观易用
   - 视觉反馈明确（激活状态、悬停效果）
   - 防误删保护（至少保留一个页面）

4. **架构设计**
   - 状态管理与 UI 分离
   - 组件化开发，易于维护
   - 事件驱动的自动更新机制

## 画布大小变化同步机制

当用户修改画布大小时，系统会自动：

1. **监听 `sizeChange` 事件**：WorkspacePlugin 触发画布尺寸变化事件
2. **更新模板数据**：同步 width 和 height 到当前模板
3. **立即更新缩略图**：调用 `syncCanvasToTemplate()` 更新预览
4. **调整缩略图画布尺寸**：TemplateThumb 组件监听尺寸变化，自动重新计算比例

实现位置：

- 事件监听：`src/views/Home.vue` 的 `handleSizeChange`
- 尺寸监听：`src/components/ToolsLayer/Templates/TemplateThumb.vue` 的 watch
- 数据同步：`src/stores/modules/template.ts` 的 `syncCanvasToTemplate`

## 注意事项

1. 页面删除时会自动清理对应的缩略图画布缓存，防止内存泄漏
2. 画布切换时会自动清除选中对象，避免跨页面选中问题
3. 缩略图更新采用节流策略，避免频繁渲染影响性能
4. workspace 对象的变化不会触发缩略图更新（添加/删除时）
5. **画布大小变化时会立即同步到模板数据和缩略图**，确保预览区域比例正确
6. 缩略图组件会监听模板尺寸变化，自动调整画布尺寸和渲染比例
