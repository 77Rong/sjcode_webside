<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'

defineOptions({ name: 'PortalContact' })

/**
 * 联系表单提交记录数据模型
 *
 * 字段名与前台「联系我们」表单保持一致：
 * app/contact/page.tsx -> formSchema
 *   name     姓名
 *   email    邮箱
 *   phone    电话（列表脱敏展示，详情展示原始值）
 *   message  留言内容
 *
 * 后台额外字段：
 *   rawPhone  电话原始值
 *   createdAt 提交时间
 */
interface ContactItem {
  id: number
  name: string
  email: string
  phone: string
  rawPhone: string
  message: string
  createdAt: string
}

const tableData = ref<ContactItem[]>([
  {
    id: 1,
    name: '张同学',
    email: 'zhang@example.com',
    rawPhone: '13812341234',
    phone: '138****1234',
    message: '想咨询产品定制流程',
    createdAt: '2026-09-28 14:25:31'
  },
  {
    id: 2,
    name: '王老师',
    email: 'wang@example.com',
    rawPhone: '13987655678',
    phone: '139****5678',
    message: '希望上门演示系统',
    createdAt: '2026-09-29 09:42:18'
  },
  {
    id: 3,
    name: '刘总',
    email: 'liu@example.com',
    rawPhone: '13678909012',
    phone: '136****9012',
    message: '需要商务合作',
    createdAt: '2026-09-30 11:08:55'
  }
])

const loading = ref(false)
const searchKeyword = ref('')
const detailVisible = ref(false)
const detailRow = ref<ContactItem | null>(null)

/** 搜索过滤后的列表 */
const filteredData = computed(() => {
  const kw = searchKeyword.value.trim()
  if (!kw) return tableData.value
  return tableData.value.filter(
    (c) =>
      c.name.includes(kw) ||
      c.email.includes(kw) ||
      c.phone.includes(kw) ||
      c.message.includes(kw)
  )
})

/** -------- 搜索 / 刷新 / 重置 -------- */
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
  onSearch()
}

const onReset = () => {
  searchKeyword.value = ''
  ElMessage.info('已重置搜索条件')
}

/** -------- 查看详情 -------- */
const onView = (row: ContactItem) => {
  detailRow.value = row
  detailVisible.value = true
}

/** -------- 删除 -------- */
const onDelete = async (row: ContactItem) => {
  await ElMessageBox.confirm(`确定删除「${row.name}」的提交记录？`, '提示', {
    type: 'warning'
  })
  tableData.value = tableData.value.filter((c) => c.id !== row.id)
  ElMessage.success('已删除')
}
</script>

<template>
  <div class="contact-manage art-page-container">
    <ElCard shadow="never" class="header-card">
      <div class="header-row">
        <div class="title-block">
          <h2 class="title">联系管理</h2>
          <p class="subtitle">收集前台「联系我们」表单的提交记录</p>
        </div>
        <div class="header-actions">
          <ElButton :icon="Refresh" type="primary" plain @click="onRefresh">
            刷新
          </ElButton>
        </div>
      </div>
    </ElCard>

    <ElCard shadow="never" class="search-card">
      <div class="search-row">
        <span class="label">关键词</span>
        <ElInput
          v-model="searchKeyword"
          placeholder="搜索姓名 / 邮箱 / 电话 / 留言内容"
          clearable
          class="search-input"
          :prefix-icon="Search"
          @keyup.enter="onSearch"
        />
        <ElButton @click="onReset">重置</ElButton>
        <ElButton type="primary" @click="onSearch">查询</ElButton>
      </div>
    </ElCard>

    <ElCard shadow="never" class="table-card">
      <ElTable
        v-loading="loading"
        :data="filteredData"
        row-key="id"
        border
        stripe
        style="width: 100%"
      >
        <ElTableColumn type="index" label="序号" width="80" align="center" />
        <ElTableColumn prop="name" label="姓名" min-width="120" align="center" />
        <ElTableColumn prop="email" label="邮箱" min-width="200" align="center" />
        <ElTableColumn prop="phone" label="电话" min-width="140" align="center" />
        <ElTableColumn prop="message" label="留言内容" min-width="220" />
        <ElTableColumn
          prop="createdAt"
          label="提交时间"
          width="180"
          align="center"
        />
        <ElTableColumn label="操作" width="160" fixed="right" align="center">
          <template #default="{ row }">
            <ElButton link type="primary" @click="onView(row)">查看</ElButton>
            <ElButton link type="danger" @click="onDelete(row)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="pagination-row">
        <span class="total-text">共 {{ filteredData.length }} 条</span>
        <ElPagination
          background
          layout="prev, pager, next"
          :total="filteredData.length"
          :page-size="10"
          :hide-on-single-page="true"
        />
        <ElSelect class="page-size-select" :model-value="10">
          <ElOption :value="10" label="10条/页" />
          <ElOption :value="20" label="20条/页" />
          <ElOption :value="50" label="50条/页" />
        </ElSelect>
        <span class="jump-text">
          前往
          <ElInput class="jump-input" :model-value="1" />
          页
        </span>
      </div>
    </ElCard>

    <!-- 查看详情弹窗 -->
    <ElDialog
      v-model="detailVisible"
      title="联系记录详情"
      width="560px"
      destroy-on-close
    >
      <ElDescriptions v-if="detailRow" :column="1" border>
        <ElDescriptionsItem label="姓名">{{ detailRow.name }}</ElDescriptionsItem>
        <ElDescriptionsItem label="邮箱">{{ detailRow.email }}</ElDescriptionsItem>
        <ElDescriptionsItem label="电话">{{ detailRow.rawPhone }}</ElDescriptionsItem>
        <ElDescriptionsItem label="留言内容">{{ detailRow.message }}</ElDescriptionsItem>
        <ElDescriptionsItem label="提交时间">{{ detailRow.createdAt }}</ElDescriptionsItem>
      </ElDescriptions>
      <template #footer>
        <ElButton type="primary" @click="detailVisible = false">关闭</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped lang="scss">
.contact-manage {
  padding: 16px;

  .header-card {
    margin-bottom: 16px;

    .header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .title-block {
      .title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #1f2937;
      }
      .subtitle {
        margin: 6px 0 0;
        font-size: 13px;
        color: #6b7280;
      }
    }
  }

  .search-card {
    margin-bottom: 16px;

    .search-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .label {
      font-size: 14px;
      color: #4b5563;
      flex-shrink: 0;
    }

    .search-input {
      width: 320px;
      max-width: 100%;
    }
  }

  .table-card {
    .pagination-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .total-text {
      font-size: 14px;
      color: #4b5563;
    }

    .page-size-select {
      width: 110px;
    }

    .jump-text {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #4b5563;

      .jump-input {
        width: 60px;
      }
    }
  }
}
</style>