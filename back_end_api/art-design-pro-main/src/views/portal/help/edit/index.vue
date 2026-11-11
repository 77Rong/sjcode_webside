<!-- 帮助正本编辑页：基于 WangEditor 的富文本编辑器二级路由 -->
<template>
  <div class="help-edit art-page-container">
    <ElCard shadow="never" class="header-card">
      <div class="header-row">
        <div class="title-block">
          <h2 class="title">{{ pageTitle }}</h2>
          <p class="subtitle">
            {{
              id
                ? `正在编辑「${formData.productName || '未命名文档'}」的帮助正本`
                : '正在为新文档撰写正本内容'
            }}
          </p>
        </div>
        <div class="header-actions">
          <ElButton @click="onBack">返回</ElButton>
          <ElButton type="primary" @click="onSave">保存</ElButton>
        </div>
      </div>
    </ElCard>

    <ElCard shadow="never" class="form-card">
      <ElForm :model="formData" label-width="100px" class="meta-form">
        <ElFormItem label="产品名称">
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
        <ElFormItem label="源文件">
          <ElInput v-model="formData.fileName" disabled>
            <template #prefix>
              <ElIcon><Document /></ElIcon>
            </template>
          </ElInput>
        </ElFormItem>
        <ElFormItem label="正本内容">
          <ArtWangEditor
            v-model="formData.content"
            height="560px"
            placeholder="上传 Markdown 后自动解析为 HTML；也可在此直接编辑正本内容..."
          />
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePortalStore } from '@/store/modules/portal'

defineOptions({ name: 'PortalHelpEdit' })

/** 产品下拉选项：数据源为「产品管理」的产品列表 */
const portalStore = usePortalStore()
const productOptions = portalStore.productOptions

/** 模拟后端返回的帮助文档详情 */
interface HelpDocDetail {
  id: number
  productName: string
  summary: string
  fileName: string
  /** 由 Markdown 解析后的 HTML（前端可直接渲染的结构） */
  content: string
}

/** 模拟后端持久化的数据，与列表页共享同样的 3 条记录 */
const MOCK_HELP_DOCS: Record<number, HelpDocDetail> = {
  1: {
    id: 1,
    productName: '智慧校园管理平台',
    summary: '智慧校园的常见操作与故障排查说明。',
    fileName: 'smart-campus.md',
    content:
      '<h2>一、产品简介</h2><p>智慧校园管理平台面向全场景业务，提供统一门户与数据中台能力。</p><h3>1.1 核心价值</h3><ul><li>打通教学、学工、办公数据孤岛</li><li>统一身份认证，一次登录全通</li><li>数据看板实时呈现运营指标</li></ul><h2>二、常见问题</h2><h3>2.1 无法登录怎么办？</h3><p>请先确认账号密码是否正确；若仍无法登录，联系学校信息中心重置密码。</p><blockquote><p>提示：连续 5 次输错密码账号会被锁定 30 分钟。</p></blockquote>'
  },
  2: {
    id: 2,
    productName: '企业官网定制',
    summary: '官网定制的需求提交流程与示例。',
    fileName: 'website-custom.md',
    content:
      '<h2>需求提交流程</h2><ol><li>提交需求单</li><li>需求确认（1 个工作日）</li><li>设计与评审</li><li>开发与交付</li></ol><h2>交付物清单</h2><ul><li>响应式官网前端代码</li><li>内容管理后台</li><li>SEO 基础配置</li></ul>'
  },
  3: {
    id: 3,
    productName: '教务管理系统',
    summary: '排课、考务、成绩相关操作手册。',
    fileName: 'edu-system.md',
    content:
      '<h2>排课操作</h2><p>在「排课管理」中新建排课任务，选择培养方案后自动生成课表草案。</p><h2>考务管理</h2><ul><li>考试科目维护</li><li>考场编排规则</li><li>考务通知下发</li></ul><h2>成绩管理</h2><p>支持成绩录入、审核与归档，成绩归档后不可修改。</p>'
  }
}

const route = useRoute()
const router = useRouter()

/** 路由参数：/:id?，新增时为空 */
const id = computed<number | null>(() => {
  const raw = route.params.id
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
})

const formData = reactive<HelpDocDetail>({
  id: 0,
  productName: '',
  summary: '',
  fileName: '',
  content: ''
})

/** 初始化：从 mock 后端拉取对应 id 的帮助正本 */
const initFromRoute = () => {
  if (id.value !== null && MOCK_HELP_DOCS[id.value]) {
    Object.assign(formData, MOCK_HELP_DOCS[id.value])
  } else {
    formData.id = id.value ?? 0
    formData.productName = ''
    formData.summary = ''
    formData.fileName = ''
    formData.content = '<p></p>'
  }
}
initFromRoute()

const pageTitle = computed(() => (id.value !== null ? '帮助正本编辑' : '新增帮助正本'))

const onBack = () => {
  router.push('/portal/help')
}

const onSave = () => {
  if (!formData.productName.trim()) {
    ElMessage.warning('请填写产品名称')
    return
  }
  if (!formData.content.trim() || formData.content === '<p></p>') {
    ElMessage.warning('正本内容不能为空')
    return
  }
  // 这里对接实际接口：把富文本 HTML 反写回 Markdown 或直接存 HTML
  MOCK_HELP_DOCS[formData.id || Date.now()] = { ...formData }
  ElMessage.success('帮助正本已保存')
  router.push('/portal/help')
}
</script>

<style scoped lang="scss">
.help-edit {
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

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .form-card {
    .meta-form {
      :deep(.el-form-item) {
        margin-bottom: 20px;
      }
    }
  }
}
</style>