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
          <ElButton type="primary" :loading="saving" @click="onSave">保存</ElButton>
        </div>
      </div>
    </ElCard>

    <ElCard shadow="never" class="form-card">
      <ElForm v-loading="loading" :model="formData" label-width="100px" class="meta-form">
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
            :upload-config="{
              isCustomUpload: true,
              server: '/api/common/upload/wangeditor',
              maxFileSize: 5 * 1024 * 1024
            }"
          />
        </ElFormItem>
      </ElForm>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  fetchCreateProduct,
  fetchGetProduct,
  fetchUpdateProduct,
  type ProductItem
} from '@/api/product'

defineOptions({ name: 'PortalProductEdit' })

const CATEGORY_OPTIONS = [
  { value: '教育', label: '教育' },
  { value: '建站', label: '建站' },
  { value: '管理', label: '管理' },
  { value: '其它', label: '其它' }
]

const route = useRoute()
const router = useRouter()

/** 路由参数：/:id?，新增时为空 */
const id = computed<number | null>(() => {
  const raw = route.params.id
  if (!raw) return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
})

const formData = reactive<Partial<ProductItem>>({
  id: 0,
  name: '',
  subTitle: '',
  category: '教育',
  summary: '',
  content: ''
})

const loading = ref(false)
const saving = ref(false)

/** 初始化：从后端拉取对应 id 的产品正本 */
const initFromRoute = async () => {
  if (id.value === null) {
    formData.id = 0
    formData.name = ''
    formData.subTitle = ''
    formData.category = '教育'
    formData.summary = ''
    formData.content = '<p></p>'
    return
  }
  loading.value = true
  try {
    const item = await fetchGetProduct(id.value)
    Object.assign(formData, item)
  } catch {
    // 错误提示已由 http 封装统一弹出
  } finally {
    loading.value = false
  }
}

const pageTitle = computed(() =>
  id.value !== null ? '产品正文编辑' : '新增产品正本'
)

onMounted(() => {
  initFromRoute()
})

const onBack = () => {
  router.push('/portal/products')
}

const onSave = async () => {
  if (!formData.name?.trim()) {
    ElMessage.warning('请填写产品名称')
    return
  }  if (!formData.content?.trim() || formData.content === '<p></p>') {
    ElMessage.warning('正文内容不能为空')
    return
  }
  saving.value = true
  try {
    const payload = {
      name: formData.name.trim(),
      subTitle: formData.subTitle || '',
      category: formData.category || '其它',
      summary: formData.summary || '',
      content: formData.content
    }
    if (id.value !== null) {
      await fetchUpdateProduct(id.value, payload)
      ElMessage.success('产品正本已保存')
    } else {
      await fetchCreateProduct(payload)
      ElMessage.success('产品正本已创建')
    }
    router.push('/portal/products')
  } catch {
    // 错误提示已由 http 封装统一弹出
  } finally {
    saving.value = false
  }
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