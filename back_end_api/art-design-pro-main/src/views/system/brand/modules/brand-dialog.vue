<!-- 品牌新增/编辑弹窗 -->
<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '新增品牌' : '编辑品牌'"
    width="560px"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="90px">
      <!-- 品牌名称 -->
      <ElFormItem label="品牌名称" prop="name">
        <ElInput v-model="formData.name" placeholder="请输入品牌名称" clearable />
      </ElFormItem>

      <!-- 品牌 logo -->
      <ElFormItem label="品牌 logo" prop="logo">
        <div class="logo-field">
          <ElUpload
            action=""
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            :on-change="onFileChange"
          >
            <ElButton type="primary" plain>上传图片</ElButton>
            <template #tip>
              <div class="el-upload__tip">支持 jpg / png / webp，大小不超过 2MB</div>
            </template>
          </ElUpload>
          <div class="logo-preview">
            <img v-if="formData.logo" :src="formData.logo" alt="logo 预览" />
            <div v-else class="logo-empty">暂无预览</div>
          </div>
        </div>
      </ElFormItem>

      <!-- 版权信息 -->
      <ElFormItem label="版权信息" prop="copyright">
        <ElInput v-model="formData.copyright" placeholder="例如：© 2026 校园通 版权所有" clearable />
      </ElFormItem>

      <!-- 备案号 -->
      <ElFormItem label="备案号" prop="icp">
        <ElInput v-model="formData.icp" placeholder="例如：京ICP备 20260001 号" clearable />
      </ElFormItem>

      <!-- 状态 -->
      <ElFormItem label="状态" prop="enabled">
        <ElSwitch
          v-model="formData.enabled"
          inline-prompt
          active-text="启用"
          inactive-text="停用"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
  import type { BrandListItem } from '@/api/brand'

  defineOptions({ name: 'BrandDialog' })

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    brandData?: Partial<BrandListItem>
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: Partial<BrandListItem>): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  const formRef = ref<FormInstance>()

  const formData = reactive<Partial<BrandListItem>>({
    name: '',
    logo: '',
    copyright: '',
    icp: '',
    enabled: true
  })

  const rules: FormRules = {
    name: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }],
    copyright: [{ required: true, message: '请输入版权信息', trigger: 'blur' }],
    icp: [{ required: true, message: '请输入备案号', trigger: 'blur' }]
  }

  /** 初始化表单数据 */
  const initFormData = () => {
    const row = props.brandData
    const isEdit = props.type === 'edit' && row

    Object.assign(formData, {
      name: isEdit && row ? row.name || '' : '',
      logo: isEdit && row ? row.logo || '' : '',
      copyright: isEdit && row ? row.copyright || '' : '',
      icp: isEdit && row ? row.icp || '' : '',
      enabled: isEdit && row ? row.enabled !== false : true
    })
  }

  watch(
    () => [props.visible, props.type, props.brandData],
    ([visible]) => {
      if (visible) {
        initFormData()
        nextTick(() => {
          formRef.value?.clearValidate()
        })
      }
    },
    { immediate: true }
  )

  /** 选择本地图片后转为 base64 保存，并即时预览 */
  const onFileChange = (file: UploadFile) => {
    const raw = file.raw
    if (!raw) return
    if (!raw.type.startsWith('image/')) {
      ElMessage.warning('请选择图片文件')
      return
    }
    if (raw.size > 2 * 1024 * 1024) {
      ElMessage.warning('图片大小不能超过 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      formData.logo = String(reader.result || '')
    }
    reader.readAsDataURL(raw)
  }

  /** 提交表单 */
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate((valid) => {
      if (valid) {
        dialogVisible.value = false
        emit('submit', {
          name: formData.name,
          logo: formData.logo,
          copyright: formData.copyright,
          icp: formData.icp,
          enabled: formData.enabled !== false
        })
      }
    })
  }
</script>

<style scoped>
  .logo-field {
    width: 100%;
  }
  .logo-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 60px;
    margin-top: 8px;
    overflow: hidden;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    background: var(--el-fill-color-blank);
  }
  .logo-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .logo-empty {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
</style>
