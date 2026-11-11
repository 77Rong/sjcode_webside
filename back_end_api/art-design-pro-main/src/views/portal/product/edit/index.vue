<!-- 产品正本编辑页：基于 WangEditor 的富文本编辑器二级路由 -->
<template>
  <div class="product-edit art-page-container">
    <ElCard shadow="never" class="header-card">
      <div class="header-row">
        <div class="title-block">
          <h2 class="title">{{ pageTitle }}</h2>
          <p class="subtitle">
            {{ id ? `正在编辑「${formData.name || '未命名产品'}」的产品正本` : '正在为新产品撰写正本内容' }}
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
          <ElInput v-model="formData.name" placeholder="请输入产品名称" />
        </ElFormItem>
        <ElFormItem label="二级标题">
          <ElInput v-model="formData.subTitle" placeholder="副标题 / 营销标语" />
        </ElFormItem>
        <ElFormItem label="产品分类">
          <ElSelect
            v-model="formData.category"
            placeholder="请选择分类"
            style="width: 240px"
          >
            <ElOption
              v-for="opt in CATEGORY_OPTIONS"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="正文内容">
          <ArtWangEditor
            v-model="formData.content"
            :height="'520px'"
            placeholder="请输入产品正本内容（支持图文混排、表格、代码块等）..."
          />
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineOptions({ name: 'PortalProductEdit' })

/** 模拟后端返回的产品详情 */
interface ProductDetail {
  id: number
  name: string
  subTitle: string
  category: string
  /** 产品正本内容（HTML 字符串） */
  content: string
}

const CATEGORY_OPTIONS = [
  { value: '教育', label: '教育' },
  { value: '建站', label: '建站' },
  { value: '管理', label: '管理' },
  { value: '其它', label: '其它' }
]

/** 模拟后端持久化的产品数据，与产品列表共享同样的 3 条记录 */
const MOCK_PRODUCTS: Record<number, ProductDetail> = {
  1: {
    id: 1,
    name: '智慧校园管理平台',
    subTitle: '校园一体化数字管理',
    category: '教育',
    content:
      '<h2>产品介绍</h2><p>面向您的全场景业务的一体化平台。</p><p>覆盖教学、学工、办公全场景。</p><h3>核心功能</h3><ul><li>智能排课</li><li>在线考务</li><li>成绩分析</li></ul>'
  },
  2: {
    id: 2,
    name: '企业官网定制',
    subTitle: '高端定制企业官网',
    category: '建站',
    content:
      '<h2>服务介绍</h2><p>为企业量身打造品牌官网，响应式设计 + 私域运营。</p>'
  },
  3: {
    id: 3,
    name: '教务管理系统',
    subTitle: '排课 / 考务 / 成绩',
    category: '教育',
    content:
      '<h2>系统简介</h2><p>教务核心系统，支持智能排课、在线考务与成绩分析。</p>'
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

const formData = reactive<ProductDetail>({
  id: 0,
  name: '',
  subTitle: '',
  category: '教育',
  content: ''
})

/** 初始化：从 mock 后端拉取对应 id 的产品正本 */
const initFromRoute = () => {
  if (id.value !== null && MOCK_PRODUCTS[id.value]) {
    const src = MOCK_PRODUCTS[id.value]
    Object.assign(formData, src)
  } else {
    formData.id = id.value ?? 0
    formData.name = ''
    formData.subTitle = ''
    formData.category = '教育'
    formData.content = '<p></p>'
  }
}
initFromRoute()

const pageTitle = computed(() =>
  id.value !== null ? '产品正文编辑' : '新增产品正本'
)

const onBack = () => {
  router.push('/portal/products')
}

const onSave = async () => {
  if (!formData.name.trim()) {
    ElMessage.warning('请填写产品名称')
    return
  }
  if (!formData.content.trim() || formData.content === '<p></p>') {
    ElMessage.warning('正文内容不能为空')
    return
  }
  // 这里对接实际接口
  MOCK_PRODUCTS[formData.id || Date.now()] = { ...formData }
  ElMessage.success('产品正本已保存')
  router.push('/portal/products')
}
</script>

<style scoped lang="scss">
.product-edit {
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