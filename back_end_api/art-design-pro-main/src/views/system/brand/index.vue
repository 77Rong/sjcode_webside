<!-- 品牌管理页面 -->
<!-- 表单形态：品牌名称 / 品牌logo（输入框 + 上传按钮 + 预览）/ 版权信息 / 备案号 -->
<template>
  <div class="brand-page art-full-height">
    <div class="art-card-sm p-5">
      <ElForm
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
        class="brand-form"
        v-loading="loading"
      >
        <!-- 品牌名称 -->
        <ElFormItem label="品牌名称" prop="name">
          <ElInput v-model="formData.name" placeholder="请输入内容" clearable class="brand-field" />
        </ElFormItem>

        <!-- 品牌logo -->
        <ElFormItem label="品牌logo" prop="logo">
          <div class="flex items-start gap-4 w-full">
            <div class="brand-logo-col">
              <ElInput v-model="formData.logo" placeholder="请输入内容" clearable />
              <!-- logo 预览区域 -->
              <div class="logo-preview mt-2.5">
                <img v-if="previewSrc" :src="previewSrc" alt="logo 预览" />
                <svg v-else class="logo-placeholder" viewBox="0 0 260 90" preserveAspectRatio="none">
                  <line x1="0" y1="0" x2="260" y2="90" />
                  <line x1="260" y1="0" x2="0" y2="90" />
                </svg>
              </div>
            </div>
            <ElButton type="primary" @click="fileInputRef?.click()">上传logo</ElButton>
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileChange"
            />
          </div>
        </ElFormItem>

        <!-- 版权信息 -->
        <ElFormItem label="版权信息" prop="copyright">
          <ElInput v-model="formData.copyright" placeholder="请输入内容" clearable class="brand-field" />
        </ElFormItem>

        <!-- 备案号 -->
        <ElFormItem label="备案号" prop="icp">
          <ElInput v-model="formData.icp" placeholder="请输入内容" clearable class="brand-field" />
        </ElFormItem>

        <ElFormItem>
          <ElButton type="primary" @click="handleSave">保存</ElButton>
        </ElFormItem>
      </ElForm>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { fetchCreateBrand, fetchGetActiveBrand, fetchUpdateBrand } from '@/api/brand'
  import type { BrandListItem } from '@/api/brand'

  defineOptions({ name: 'Brand' })

  const MAX_LOGO_SIZE = 2 * 1024 * 1024

  const formRef = ref<FormInstance>()
  const fileInputRef = ref<HTMLInputElement>()
  const loading = ref(false)

  /** 当前编辑的品牌 ID，为空表示新建 */
  const brandId = ref<number | null>(null)
  /** 本地选择的 logo（base64），优先于输入框中的地址使用 */
  const logoBase64 = ref('')

  const formData = reactive<Partial<BrandListItem>>({
    name: '',
    logo: '',
    copyright: '',
    icp: ''
  })

  const rules: FormRules = {
    name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }],
    copyright: [{ required: true, message: '请输入版权信息', trigger: 'blur' }],
    icp: [{ required: true, message: '请输入备案号', trigger: 'blur' }]
  }

  /** 预览地址：优先显示本地选择的图片，其次是输入框中的地址 */
  const previewSrc = computed(() => logoBase64.value || formData.logo || '')

  /** 加载启用中的品牌 */
  const loadBrand = async () => {
    loading.value = true
    try {
      const brand = await fetchGetActiveBrand()
      if (brand) {
        brandId.value = brand.id
        // 历史数据可能是 base64，直接作为预览使用
        if (brand.logo?.startsWith('data:')) {
          logoBase64.value = brand.logo
          formData.logo = ''
        } else {
          logoBase64.value = ''
          formData.logo = brand.logo || ''
        }
        formData.name = brand.name || ''
        formData.copyright = brand.copyright || ''
        formData.icp = brand.icp || ''
      }
    } catch (error) {
      console.error('[brand] 获取品牌配置失败', error)
    } finally {
      loading.value = false
    }
  }

  /** 选择本地图片后转为 base64 并预览 */
  const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const raw = target.files?.[0]
    if (!raw) return

    if (!raw.type.startsWith('image/')) {
      ElMessage.warning('请选择图片文件')
      target.value = ''
      return
    }
    if (raw.size > MAX_LOGO_SIZE) {
      ElMessage.warning('图片大小不能超过 2MB')
      target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      logoBase64.value = String(reader.result || '')
      formData.logo = ''
    }
    reader.readAsDataURL(raw)
    target.value = ''
  }

  /** 保存品牌配置 */
  const handleSave = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (!valid) return

      const payload = {
        name: formData.name || '',
        logo: logoBase64.value || formData.logo || '',
        copyright: formData.copyright || '',
        icp: formData.icp || ''
      }

      try {
        if (brandId.value) {
          await fetchUpdateBrand(brandId.value, payload)
        } else {
          const created = await fetchCreateBrand(payload)
          brandId.value = created?.id ?? null
        }
        ElMessage.success('保存成功')
      } catch (error) {
        console.error('[brand] 保存品牌配置失败', error)
      }
    })
  }

  onMounted(loadBrand)
</script>

<style scoped>
  /* 表单字段宽度随容器自适应 */
  .brand-field,
  .brand-logo-col {
    width: 100%;
    max-width: clamp(200px, 60%, 420px);
  }

  .logo-preview {
    width: 100%;
    aspect-ratio: 260 / 90;
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    background: var(--el-fill-color-lighter);
  }

  .logo-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .logo-placeholder {
    width: 100%;
    height: 100%;
  }

  .logo-placeholder line {
    stroke: var(--el-border-color);
    stroke-width: 1;
  }
</style>
