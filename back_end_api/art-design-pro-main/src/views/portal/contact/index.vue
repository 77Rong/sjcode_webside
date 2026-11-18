<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import {
  fetchDeleteContact,
  fetchGetContactList,
  fetchUpdateContact,
  type ContactItem
} from '@/api/contact'

defineOptions({ name: 'PortalContact' })

/**
 * 联系表单提交记录（来源：前台「联系我们」表单，经后端 /api/contact 落库）
 *
 * 字段名与前台 formSchema 一致：
 *   name     姓名
 *   email    邮箱
 *   phone    电话（列表脱敏展示，详情展示原始值）
 *   message  留言内容
 *
 * 后台额外字段：
 *   rawPhone  电话原始值
 *   status    处理状态 pending 未处理 / processed 已处理
 *   reply     处理备注
 *   createdAt 提交时间
 */
const STATUS_CONFIG = {
  pending: { type: 'warning' as const, text: '未处理' },
  processed: { type: 'success' as const, text: '已处理' }
} as const

const tableData = ref<ContactItem[]>([])
const total = ref(0)
const current = ref(1)
const size = ref(10)
const loading = ref(false)
const searchKeyword = ref('')
const statusFilter = ref<'all' | 'pending' | 'processed'>('all')

const detailVisible = ref(false)
const detailRow = ref<ContactItem | null>(null)

/** 拉取留言列表（服务端分页 + 关键词 + 状态过滤） */
const loadList = async () => {
  loading.value = true
  try {
    const data = await fetchGetContactList({
      current: current.value,
      size: size.value,
      keyword: searchKeyword.value.trim(),
      status: statusFilter.value
    })
    tableData.value = data.records
    total.value = data.total
  } catch {
    // 错误提示已由 http 封装统一弹出
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadList()
})

/** -------- 搜索 / 刷新 / 重置 -------- */
const onSearch = () => {
  current.value = 1
  void loadList()
}

const onRefresh = () => {
  searchKeyword.value = ''
  statusFilter.value = 'all'
  current.value = 1
  void loadList()
}

const onReset = () => {
  searchKeyword.value = ''
  statusFilter.value = 'all'
  current.value = 1
  void loadList()
}

const onStatusChange = () => {
  current.value = 1
  void loadList()
}

/** -------- 分页 -------- */
const onCurrentChange = (val: number) => {
  current.value = val
  void loadList()
}

const onSizeChange = (val: number) => {
  size.value = val
  current.value = 1
  void loadList()
}

/** -------- 查看详情 -------- */
const onView = (row: ContactItem) => {
  detailRow.value = row
  detailVisible.value = true
}

/** -------- 标记处理状态 -------- */
const onToggleStatus = async (row: ContactItem) => {
  const next = row.status === 'processed' ? 'pending' : 'processed'
  try {
    await fetchUpdateContact(row.id, { status: next })
    ElMessage.success(next === 'processed' ? '已标记为已处理' : '已标记为未处理')
    await loadList()
  } catch {
    // 错误提示已由 http 封装统一弹出
  }
}

/** -------- 删除 -------- */
const onDelete = async (row: ContactItem) => {
  await ElMessageBox.confirm(`确定删除「${row.name}」的提交记录？`, '提示', {
    type: 'warning'
  })
  try {
    await fetchDeleteContact(row.id)
    ElMessage.success('已删除')
    // 删除当前页最后一条时回退一页
    if (tableData.value.length === 1 && current.value > 1) {
      current.value -= 1
    }
    await loadList()
  } catch {
    // 错误提示已由 http 封装统一弹出
  }
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
        <ElSelect v-model="statusFilter" class="status-select" @change="onStatusChange">
          <ElOption value="all" label="全部状态" />
          <ElOption value="pending" label="未处理" />
          <ElOption value="processed" label="已处理" />
        </ElSelect>
        <ElButton @click="onReset">重置</ElButton>
        <ElButton type="primary" @click="onSearch">查询</ElButton>
      </div>
    </ElCard>

    <ElCard shadow="never" class="table-card">
      <ElTable
        v-loading="loading"
        :data="tableData"
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
        <ElTableColumn label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="STATUS_CONFIG[row.status as 'pending' | 'processed'].type">
              {{ STATUS_CONFIG[row.status as 'pending' | 'processed'].text }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createdAt" label="提交时间" width="180" align="center" />
        <ElTableColumn label="操作" width="230" fixed="right" align="center">
          <template #default="{ row }">
            <ElButton link type="primary" @click="onView(row)">查看</ElButton>
            <ElButton
              link
              type="warning"
              @click="onToggleStatus(row)"
            >
              {{ row.status === 'processed' ? '标记未处理' : '标记已处理' }}
            </ElButton>
            <ElButton link type="danger" @click="onDelete(row)">删除</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="pagination-row">
        <span class="total-text">共 {{ total }} 条</span>
        <ElPagination
          background
          layout="prev, pager, next"
          :total="total"
          :current-page="current"
          :page-size="size"
          :hide-on-single-page="true"
          @current-change="onCurrentChange"
        />
        <ElSelect class="page-size-select" :model-value="size" @change="onSizeChange">
          <ElOption :value="10" label="10条/页" />
          <ElOption :value="20" label="20条/页" />
          <ElOption :value="50" label="50条/页" />
        </ElSelect>
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
        <ElDescriptionsItem label="处理状态">
          <ElTag :type="STATUS_CONFIG[detailRow.status as 'pending' | 'processed'].type">
            {{ STATUS_CONFIG[detailRow.status as 'pending' | 'processed'].text }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="处理备注">
          {{ detailRow.reply || '—' }}
        </ElDescriptionsItem>
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

    .status-select {
      width: 130px;
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
  }
}
</style>
