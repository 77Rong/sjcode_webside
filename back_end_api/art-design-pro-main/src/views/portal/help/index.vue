<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Delete, Document, Edit, Plus, Refresh, Search as SearchIcon, UploadFilled } from '@element-plus/icons-vue'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usePortalStore } from '@/store/modules/portal'

defineOptions({ name: 'PortalHelp' })

/** 产品下拉选项：数据源为「产品管理」的产品列表 */
const portalStore = usePortalStore()
const productOptions = portalStore.productOptions

/**
 * 帮助文档数据模型
 * - id           主键
 * - productName  关联产品名称
 * - summary      帮助摘要
 * - fileName     Markdown 文件名
 * - updatedAt    最近更新时间
 * - progress     上传 / 解析进度（0~100）
 *
 * 注意：正本原文（HTML 正文）不在本列表页编辑，
 *       由「正本编辑」按钮跳转到富文本编辑器二级路由处理。
 */
interface HelpDocItem {
  id: number
  productName: string
  summary: string
  fileName: string
  updatedAt: string
  progress: number
}

const tableData = ref<HelpDocItem[]>([
  {
    id: 1,
    productName: '智慧校园管理平台',
    summary: '智慧校园的常见操作与故障排查说明。',
    fileName: 'smart-campus.md',
    updatedAt: '2026-09-12 10:00',
    progress: 100
  },
  {
    id: 2,
    productName: '企业官网定制',
    summary: '官网定制的需求提交流程与示例。',
    fileName: 'website-custom.md',
    updatedAt: '2026-09-15 14:30',
    progress: 100
  },
  {
    id: 3,
    productName: '教务管理系统',
    summary: '排课、考务、成绩相关操作手册。',
    fileName: 'edu-system.md',
    updatedAt: '2026-09-20 09:15',
    progress: 100
  }
])

const loading = ref(false)
const searchKeyword = ref('')
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit' | 'meta'>('add')
const formData = reactive<Partial<HelpDocItem>>({})

/** 搜索过滤后的列表 */
const filteredData = computed(() => {
  const kw = searchKeyword.value.trim()
  if (!kw) return tableData.value
  return tableData.value.filter(
    (d) =>
      d.productName.includes(kw) ||
      d.summary.includes(kw) ||
      d.fileName.includes(kw)
  )
})

const resetForm = () => {
  formData.id = undefined
  formData.productName = ''
  formData.summary = ''
  formData.fileName = ''
  formData.updatedAt = ''
  formData.progress = 100
}

const onAdd = () => {
  dialogMode.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const onEdit = (row: HelpDocItem) => {
  dialogMode.value = 'meta'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const onSave = () => {
  if (!formData.productName) {
    ElMessage.warning('请选择产品名称')
    return
  }
  if (!formData.fileName?.trim()) {
    ElMessage.warning('请输入 Markdown 文件名')
    return
  }
  if (dialogMode.value === 'add') {
    const newId = Math.max(0, ...tableData.value.map((d) => d.id)) + 1
    tableData.value.unshift({
      id: newId,
      productName: formData.productName!,
      summary: formData.summary || '',
      fileName: formData.fileName!,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      progress: Number(formData.progress) || 0
    })
    ElMessage.success('文档新增成功')
  } else {
    const idx = tableData.value.findIndex((d) => d.id === formData.id)
    if (idx >= 0) {
      tableData.value[idx] = {
        ...tableData.value[idx],
        ...(formData as HelpDocItem)
      }
      ElMessage.success('文档信息已更新')
    }
  }
  dialogVisible.value = false
}

/**
 * 「正本编辑」：跳转到帮助正本二级路由（富文本编辑器页）
 * 原文 HTML 由 md 上传后自动解析得到，这里不做小弹窗编辑
 */
const router = useRouter()

const onEditMaster = (row: HelpDocItem) => {
  router.push(`/portal/help/edit/${row.id}`)
}

/** -------- Markdown 上传（自动解析为 HTML 结构） -------- */
const uploadDialogVisible = ref(false)

/** 极简 Markdown → HTML 解析（后台上传后自动生成前端可用的结构） */
const parseMarkdown = (md: string): string => {
  const lines = md.split('\n')
  const out: string[] = []
  let inList = false
  const inCode = ref(false)

  const closeList = () => {
    if (inList) {
      out.push('</ul>')
      inList = false
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (line.trim().startsWith('```')) {
      if (inCode.value) {
        out.push('</code></pre>')
      } else {
        closeList()
        out.push('<pre><code>')
      }
      inCode.value = !inCode.value
      continue
    }
    if (inCode.value) {
      out.push(line)
      continue
    }

    // 标题 # ~ ######
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      closeList()
      const level = heading[1].length
      out.push(`<h${level}>${heading[2]}</h${level}>`)
      continue
    }

    // 无序列表 - / *
    const bullet = /^[-*]\s+(.*)$/.exec(line)
    if (bullet) {
      if (!inList) {
        out.push('<ul>')
        inList = true
      }
      out.push(`<li>${bullet[1]}</li>`)
      continue
    }

    // 有序列表 1.
    const ordered = /^\d+\.\s+(.*)$/.exec(line)
    if (ordered) {
      closeList()
      out.push(`<p>${ordered[1]}</p>`)
      continue
    }

    // 引用 >
    const quote = /^>\s+(.*)$/.exec(line)
    if (quote) {
      closeList()
      out.push(`<blockquote><p>${quote[1]}</p></blockquote>`)
      continue
    }

    // 空行跳过
    if (!line.trim()) {
      closeList()
      continue
    }

    // 普通段落
    closeList()
    out.push(`<p>${line}</p>`)
  }

  closeList()
  return out.join('')
}

/** ElUpload 选择文件后的回调 */
const onMdSelected = (file: { name?: string; raw?: File }) => {
  const rawFile = file.raw
  if (!rawFile) return
  if (!/\.(md|markdown)$/i.test(rawFile.name)) {
    ElMessage.warning('仅支持上传 .md / .markdown 文件')
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const html = parseMarkdown(String(reader.result || ''))
    // mock：把解析结果挂到临时状态，真实环境走「上传→解析→入库」接口
    uploadDialogVisible.value = false
    ElMessage.success(`「${rawFile.name}」已解析为 HTML 结构，共 ${html.length} 字符`)
  }
  reader.readAsText(rawFile)
}

const onDelete = async (row: HelpDocItem) => {
  await ElMessageBox.confirm(
    `确定删除「${row.productName}」的帮助文档？`,
    '提示',
    { type: 'warning' }
  )
  tableData.value = tableData.value.filter((d) => d.id !== row.id)
  ElMessage.success('已删除')
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
  onSearch()
}

const onReset = () => {
  searchKeyword.value = ''
  ElMessage.info('已重置搜索条件')
}
</script>

<template>
  <div class="help-manage art-page-container">
    <ElCard shadow="never" class="header-card">
      <div class="header-row">
        <div class="title-block">
          <h2 class="title">帮助文档管理</h2>
          <p class="subtitle">
            维护各产品对应的 Markdown 帮助文档，上传后自动解析为前端可用的 HTML 结构。
          </p>
        </div>
      </div>
    </ElCard>

    <ElCard shadow="never" class="search-card">
      <div class="search-row">
        <div class="search-left">
          <span class="label">产品名称</span>
          <ElInput
            v-model="searchKeyword"
            placeholder="请输入产品名称关键字"
            clearable
            class="search-input"
            :prefix-icon="SearchIcon"
            @keyup.enter="onSearch"
          />
          <ElButton type="primary" @click="onSearch">查询</ElButton>
          <ElButton @click="onReset">重置</ElButton>
        </div>
        <div class="search-right">
          <ElButton :icon="Refresh" @click="onRefresh">刷新</ElButton>
          <ElButton :icon="UploadFilled" @click="uploadDialogVisible = true">
            上传文档
          </ElButton>
          <ElButton type="primary" :icon="Plus" @click="onAdd">新增文档</ElButton>
        </div>
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
        <ElTableColumn
          prop="productName"
          label="产品名称"
          min-width="180"
          align="center"
        />
        <ElTableColumn
          prop="summary"
          label="帮助摘要"
          min-width="260"
          show-overflow-tooltip
        />
        <ElTableColumn label="文档上传进度" min-width="240">
          <template #default="{ row }">
            <div class="progress-cell">
              <div class="progress-line">
                <span class="progress-text">{{ row.progress }}%</span>
                <ElProgress
                  :percentage="row.progress"
                  :stroke-width="6"
                  :show-text="false"
                  :status="row.progress >= 100 ? 'success' : ''"
                />
                <ElIcon
                  v-if="row.progress >= 100"
                  class="progress-check"
                  :size="16"
                  color="#67c23a"
                >
                  <Check />
                </ElIcon>
              </div>
              <div class="progress-meta">
                <span class="file-name">{{ row.fileName }}</span>
                <span class="dot-sep">·</span>
                <span class="updated-at">{{ row.updatedAt }}</span>
              </div>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="编辑管理" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <ElButton link type="primary" :icon="Edit" @click="onEdit(row)">
              编辑
            </ElButton>
            <ElButton link type="primary" @click="onEditMaster(row)">
              正本编辑
            </ElButton>
            <ElButton link type="danger" :icon="Delete" @click="onDelete(row)">
              删除
            </ElButton>
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

    <!-- 新增 / 编辑 弹窗：只维护元数据，正文原文请走「正本编辑」 -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? '新增帮助文档' : '编辑文档信息'"
      width="560px"
      destroy-on-close
    >
      <ElForm :model="formData" label-width="100px">
        <ElFormItem label="产品名称" required>
          <ElSelect
            v-model="formData.productName"
            placeholder="请选择产品"
            style="width: 100%"
          >
            <ElOption
              v-for="opt in productOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="帮助摘要">
          <ElInput v-model="formData.summary" placeholder="一句话描述这份文档的用途" />
        </ElFormItem>
        <ElFormItem label="Markdown 文件" required>
          <ElInput v-model="formData.fileName" placeholder="例如：smart-campus.md">
            <template #prefix>
              <ElIcon><Document /></ElIcon>
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="最近更新">
          <ElInput
            v-model="formData.updatedAt"
            placeholder="例如：2026-09-12 10:00"
          />
        </ElFormItem>
        <ElFormItem label="上传进度">
          <ElSlider v-model="formData.progress" :max="100" show-input />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="onSave">保存</ElButton>
      </template>
    </ElDialog>

    <!-- Markdown 上传弹窗：上传后自动解析为 HTML 结构 -->
    <ElDialog
      v-model="uploadDialogVisible"
      title="上传 Markdown 文档"
      width="520px"
      destroy-on-close
    >
      <ElUpload
        drag
        action=""
        :auto-upload="false"
        :show-file-list="false"
        accept=".md,.markdown"
        :on-change="onMdSelected"
      >
        <ElIcon class="el-icon--upload"><UploadFilled /></ElIcon>
        <div class="el-upload__text">
          将 Markdown 文档拖到此处，或<em>点击选择文件</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            仅支持 .md / .markdown 格式，上传后自动解析为前端可用的 HTML 结构
          </div>
        </template>
      </ElUpload>
    </ElDialog>
  </div>
</template>

<style scoped lang="scss">
.help-manage {
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
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .search-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      .label {
        font-size: 14px;
        color: #4b5563;
        flex-shrink: 0;
      }

      .search-input {
        width: 280px;
        max-width: 100%;
      }
    }

    .search-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .table-card {
    .progress-cell {
      padding: 4px 0;

      .progress-line {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .progress-text {
        font-size: 13px;
        color: #1f2937;
        width: 44px;
      }

      .progress-check {
        flex-shrink: 0;
      }

      .progress-meta {
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
        color: #6b7280;
        font-size: 12px;

        .dot-sep {
          color: #d1d5db;
        }
      }
    }

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