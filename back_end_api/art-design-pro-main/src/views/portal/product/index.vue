<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Delete,
  Edit,
  FullScreen,
  Grid,
  MoreFilled,
  Plus,
  Promotion,
  Refresh,
  Search,
  SortUp
} from '@element-plus/icons-vue'
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import {
  PRODUCT_CATEGORY_OPTIONS,
  usePortalStore,
  type PortalProduct
} from '@/store/modules/portal'

defineOptions({ name: 'PortalProduct' })

/** 产品数据模型见 store/modules/portal */
type ProductItem = PortalProduct

const portalStore = usePortalStore()

/** 产品分类下拉选项（来自 store） */
const CATEGORY_OPTIONS = PRODUCT_CATEGORY_OPTIONS

/** 产品列表：直接读写 store，作为全局唯一数据源 */
const { products: tableData } = storeToRefs(portalStore)

const loading = ref(false)
const searchKeyword = ref('')
const categoryFilter = ref<string>('')

/** 搜索 + 分类过滤后的列表 */
const filteredData = computed(() => {
  const kw = searchKeyword.value.trim()
  return tableData.value.filter((p) => {
    const matchKw = !kw || p.name.includes(kw) || p.subTitle.includes(kw) || p.summary.includes(kw)
    const matchCategory = !categoryFilter.value || p.category === categoryFilter.value
    return matchKw && matchCategory
  })
})

/** -------- 新增 / 编辑弹窗 -------- */
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const formData = reactive<Partial<ProductItem>>({})

const resetForm = () => {
  formData.id = undefined
  formData.name = ''
  formData.subTitle = ''
  formData.category = '教育'
  formData.summary = ''
  formData.content = ''
}

const onAdd = () => {
  dialogMode.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const onEdit = (row: ProductItem) => {
  dialogMode.value = 'edit'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const onSave = () => {
  if (!formData.name?.trim()) {
    ElMessage.warning('请输入产品名称')
    return
  }
  if (!formData.category) {
    ElMessage.warning('请选择产品分类')
    return
  }
  if (dialogMode.value === 'add') {
    const newId = portalStore.nextProductId()
    tableData.value.unshift({
      id: newId,
      name: formData.name!,
      subTitle: formData.subTitle || '',
      category: formData.category!,
      summary: formData.summary || '',
      content: formData.content || ''
    })
    ElMessage.success('新增产品成功')
  } else {
    const idx = tableData.value.findIndex((p) => p.id === formData.id)
    if (idx >= 0) {
      tableData.value[idx] = { ...tableData.value[idx], ...(formData as ProductItem) }
      ElMessage.success('产品已更新')
    }
  }
  dialogVisible.value = false
}

const onDelete = async (row: ProductItem) => {
  await ElMessageBox.confirm(`确定删除产品「${row.name}」？`, '提示', { type: 'warning' })
  tableData.value = tableData.value.filter((p) => p.id !== row.id)
  ElMessage.success('已删除')
}

const router = useRouter()

/** 「正本编辑」：跳转到产品正本二级路由（富文本编辑器页） */
const onEditMaster = (row: ProductItem) => {
  router.push(`/portal/products/edit/${row.id}`)
}

/** 「管理」下拉菜单命令处理 */
const onManage = (cmd: string, row: ProductItem) => {
  if (cmd === 'edit') onEdit(row)
  else if (cmd === 'master') onEditMaster(row)
  else if (cmd === 'delete') onDelete(row)
}

const onSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success(
      searchKeyword.value ? `搜索「${searchKeyword.value}」完成` : '已刷新列表'
    )
  }, 300)
}

const onRefresh = () => {
  searchKeyword.value = ''
  categoryFilter.value = ''
  onSearch()
}

const onReset = () => {
  searchKeyword.value = ''
  categoryFilter.value = ''
  ElMessage.info('已重置搜索条件')
}
</script>

<template>
  <div class="product-manage art-page-container">
    <ElCard shadow="never" class="search-card">
      <div class="search-row">
        <div class="search-field">
          <span class="label">产品名称</span>
          <ElInput
            v-model="searchKeyword"
            placeholder="请输入产品名称"
            clearable
            class="search-input"
            :prefix-icon="Search"
            @keyup.enter="onSearch"
          />
        </div>
        <div class="search-field">
          <span class="label">产品分类</span>
          <ElSelect
            v-model="categoryFilter"
            placeholder="请选择"
            clearable
            class="category-select"
          >
            <ElOption
              v-for="opt in CATEGORY_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </div>
        <ElButton type="primary" @click="onSearch">查询</ElButton>
        <ElButton @click="onReset">重置</ElButton>
      </div>
    </ElCard>

    <ElCard shadow="never" class="table-card">
      <div class="table-toolbar">
        <ElButton type="primary" :icon="Plus" @click="onAdd">新增产品</ElButton>
        <div class="toolbar-icons">
          <ElTooltip content="刷新" placement="top">
            <span class="toolbar-icon" @click="onRefresh">
              <ElIcon :size="16"><Refresh /></ElIcon>
            </span>
          </ElTooltip>
          <ElTooltip content="密度" placement="top">
            <span class="toolbar-icon">
              <ElIcon :size="16"><Grid /></ElIcon>
            </span>
          </ElTooltip>
          <ElTooltip content="列设置" placement="top">
            <span class="toolbar-icon">
              <ElIcon :size="16"><SortUp /></ElIcon>
            </span>
          </ElTooltip>
          <ElTooltip content="全屏" placement="top">
            <span class="toolbar-icon">
              <ElIcon :size="16"><FullScreen /></ElIcon>
            </span>
          </ElTooltip>
        </div>
      </div>

      <ElTable
        v-loading="loading"
        :data="filteredData"
        row-key="id"
        border
        stripe
        style="width: 100%"
      >
        <ElTableColumn type="index" label="序号" width="80" align="center" />
        <ElTableColumn
          prop="name"
          label="产品名称"
          min-width="160"
          align="center"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="subTitle"
          label="二级标题"
          min-width="200"
          align="center"
          show-overflow-tooltip
        />
        <ElTableColumn prop="category" label="产品分类" width="120" align="center">
          <template #default="{ row }">
            <ElTag size="small" type="primary">{{ row.category }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="summary"
          label="简介"
          min-width="320"
          show-overflow-tooltip
        />
        <ElTableColumn label="管理" width="80" fixed="right" align="center">
          <template #default="{ row }">
            <ElDropdown trigger="click" @command="(cmd: string) => onManage(cmd, row)">
              <span class="manage-trigger">
                <ElIcon :size="16"><MoreFilled /></ElIcon>
              </span>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="edit">
                    <ElIcon class="mr-1"><Edit /></ElIcon>
                    编辑
                  </ElDropdownItem>
                  <ElDropdownItem command="master">
                    <ElIcon class="mr-1"><Promotion /></ElIcon>
                    正本编辑
                  </ElDropdownItem>
                  <ElDropdownItem command="delete" divided>
                    <ElIcon class="mr-1"><Delete /></ElIcon>
                    删除
                  </ElDropdownItem>
                </ElDropdownMenu>
              </template>
            </ElDropdown>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 新增 / 编辑 弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '新增产品' : '编辑产品'"
      width="560px"
      destroy-on-close
    >
      <ElForm :model="formData" label-width="90px">
        <ElFormItem label="产品名称" required>
          <ElInput v-model="formData.name" placeholder="请输入产品名称" />
        </ElFormItem>
        <ElFormItem label="二级标题">
          <ElInput v-model="formData.subTitle" placeholder="副标题 / 营销标语" />
        </ElFormItem>
        <ElFormItem label="产品分类" required>
          <ElSelect
            v-model="formData.category"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <ElOption
              v-for="opt in CATEGORY_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="简介">
          <ElInput
            v-model="formData.summary"
            type="textarea"
            :rows="3"
            placeholder="一句话简介"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="onSave">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped lang="scss">
.product-manage {
  padding: 16px;

  .search-card {
    margin-bottom: 16px;

    .search-row {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .search-field {
      display: flex;
      align-items: center;
      gap: 8px;

      .label {
        font-size: 14px;
        color: #4b5563;
        white-space: nowrap;
      }

      .search-input {
        width: 220px;
      }

      .category-select {
        width: 180px;
      }
    }
  }

  .table-card {
    .table-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .toolbar-icons {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .toolbar-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      color: #6b7280;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease;

      &:hover {
        background: #f3f4f6;
        color: #1f2937;
      }
    }
  }

  /**
   * 管理列下拉触发按钮
   * 灰色圆角矩形 + 三个竖向小圆点（⋮）
   */
  .manage-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: #f3f4f6;
    color: #6b7280;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
      background: #e5e7eb;
      color: #1f2937;
    }
  }

  .mr-1 {
    margin-right: 4px;
  }
  .ml-1 {
    margin-left: 4px;
  }
}
</style>