<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Delete,
  Edit,
  FullScreen,
  Menu,
  MoreFilled,
  Picture,
  Plus,
  Refresh,
  Setting,
  Sort
} from '@element-plus/icons-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import {
  fetchCreateHero,
  fetchDeleteHero,
  fetchGetHeroList,
  fetchUpdateHero,
  fetchUploadHeroImage,
  type HeroItem
} from '@/api/hero'

defineOptions({ name: 'PortalHero' })

/** 列表数据（来自 Supabase，经后端 /api/hero/list） */
const tableData = ref<HeroItem[]>([])
const loading = ref(false)
const searchKeyword = ref('')

/** 拉取列表（关键词作为过滤条件传给后端） */
const loadList = async () => {
  loading.value = true
  try {
    tableData.value = await fetchGetHeroList({ keyword: searchKeyword.value.trim() })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadList()
})

/** -------- 排序切换（正序 / 倒序） -------- */
const sortDesc = ref(false)
const sortedData = computed(() => (sortDesc.value ? [...tableData.value].reverse() : tableData.value))

const onSortToggle = () => {
  sortDesc.value = !sortDesc.value
}

/** -------- 全屏 -------- */
const onFullscreen = () => {
  if (document.fullscreenElement) {
    void document.exitFullscreen()
  } else {
    void document.documentElement.requestFullscreen()
  }
}

/** -------- 超链接管理弹窗 -------- */
const linkDialogVisible = ref(false)
const linkSaving = ref(false)
const linkForm = reactive({ id: 0, linkUrl: '' })

const onOpenLinkDialog = (row: HeroItem) => {
  linkForm.id = row.id
  linkForm.linkUrl = row.linkUrl
  linkDialogVisible.value = true
}

const onSaveLink = async () => {
  linkSaving.value = true
  try {
    await fetchUpdateHero(linkForm.id, { linkUrl: linkForm.linkUrl.trim() })
    ElMessage.success('超链接已更新')
    linkDialogVisible.value = false
    await loadList()
  } catch {
    // 错误提示已由 http 封装统一弹出
  } finally {
    linkSaving.value = false
  }
}

/** -------- 图片管理（真实上传到 Supabase Storage） -------- */
const imageDialogVisible = ref(false)
const imageEditingId = ref<number | null>(null)
const imageUploading = ref(false)
/** 图片编辑表单 */
const imageForm = reactive({
  imageUrl: '',
  /** 选中的本地文件对象（保存时上传到 Supabase Storage） */
  pickedFile: null as File | null
})
const imagePreview = computed(() => {
  if (imageForm.pickedFile) return URL.createObjectURL(imageForm.pickedFile)
  return imageForm.imageUrl
})

const onOpenImageDialog = (row: HeroItem) => {
  imageEditingId.value = row.id
  imageForm.imageUrl = row.imageUrl
  imageForm.pickedFile = null
  imageDialogVisible.value = true
}

const onFileChange = (file: { raw?: File }) => {
  if (!file?.raw) return
  imageForm.pickedFile = file.raw
}

const onSaveImage = async () => {
  if (imageEditingId.value == null) return

  if (imageForm.pickedFile) {
    // 有本地文件：走上传接口（Supabase Storage），成功后回写 imageUrl
    imageUploading.value = true
    try {
      const updated = await fetchUploadHeroImage(imageEditingId.value, imageForm.pickedFile)
      const idx = tableData.value.findIndex((p) => p.id === imageEditingId.value)
      if (idx >= 0) tableData.value[idx] = updated
      ElMessage.success('图片已上传并更新')
      imageDialogVisible.value = false
    } catch {
      // 错误提示已由 http 封装统一弹出
    } finally {
      imageUploading.value = false
    }
    return
  }

  // 没有本地文件：按填写的 URL 直接更新
  if (imageForm.imageUrl.trim() && imageForm.imageUrl !== tableData.value.find((p) => p.id === imageEditingId.value)?.imageUrl) {
    imageUploading.value = true
    try {
      const updated = await fetchUpdateHero(imageEditingId.value, {
        imageUrl: imageForm.imageUrl.trim()
      })
      const idx = tableData.value.findIndex((p) => p.id === imageEditingId.value)
      if (idx >= 0) tableData.value[idx] = updated
      ElMessage.success('图片已更新')
      imageDialogVisible.value = false
    } catch {
      // 错误提示已由 http 封装统一弹出
    } finally {
      imageUploading.value = false
    }
    return
  }

  ElMessage.warning('请选择本地图片上传，或修改图片 URL')
}

/** -------- 新增 / 编辑 弹窗（标题、副标题、badge、链接、启用、排序） -------- */
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const dialogSaving = ref(false)
const formData = reactive<Partial<HeroItem>>({})

const resetForm = () => {
  formData.id = undefined
  formData.title = ''
  formData.subtitle = ''
  formData.badge = ''
  formData.imageUrl = ''
  formData.imageAlt = ''
  formData.linkUrl = ''
  formData.enabled = true
  formData.sortOrder = 0
}

const onAdd = () => {
  dialogMode.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const onEdit = (row: HeroItem) => {
  dialogMode.value = 'edit'
  Object.assign(formData, row)
  dialogVisible.value = true
}

const onSave = async () => {
  if (!formData.title?.trim()) {
    ElMessage.warning('请输入标题')
    return
  }
  if (dialogMode.value === 'add' && !formData.imageUrl?.trim()) {
    ElMessage.warning('请填写图片 URL（可先填写默认图，保存后再上传替换）')
    return
  }
  dialogSaving.value = true
  try {
    if (dialogMode.value === 'add') {
      await fetchCreateHero({
        title: formData.title!.trim(),
        subtitle: formData.subtitle || '',
        badge: formData.badge || '',
        imageUrl: formData.imageUrl!.trim(),
        imageAlt: formData.imageAlt || formData.title!.trim(),
        linkUrl: formData.linkUrl || '',
        enabled: formData.enabled ?? true,
        sortOrder: Number(formData.sortOrder) || 0
      })
      ElMessage.success('新增焦点图成功')
    } else {
      await fetchUpdateHero(formData.id!, {
        title: formData.title!.trim(),
        subtitle: formData.subtitle || '',
        badge: formData.badge || '',
        imageUrl: formData.imageUrl?.trim() || '',
        imageAlt: formData.imageAlt || '',
        linkUrl: formData.linkUrl || '',
        enabled: formData.enabled ?? true,
        sortOrder: Number(formData.sortOrder) || 0
      })
      ElMessage.success('焦点图已更新')
    }
    dialogVisible.value = false
    await loadList()
  } catch {
    // 错误提示已由 http 封装统一弹出
  } finally {
    dialogSaving.value = false
  }
}

const onDelete = async (row: HeroItem) => {
  await ElMessageBox.confirm(`确定删除焦点图「${row.title || row.id}」？`, '提示', { type: 'warning' })
  try {
    await fetchDeleteHero(row.id)
    ElMessage.success('已删除')
    await loadList()
  } catch {
    // 错误提示已由 http 封装统一弹出
  }
}

/** 「管理」下拉菜单命令处理 */
const onManage = (cmd: string, row: HeroItem) => {
  if (cmd === 'edit') onEdit(row)
  else if (cmd === 'image') onOpenImageDialog(row)
  else if (cmd === 'delete') onDelete(row)
}

const onSearch = () => {
  void loadList()
}

const onRefresh = () => {
  searchKeyword.value = ''
  void loadList()
}

const onReset = () => {
  searchKeyword.value = ''
  void loadList()
}
</script>

<template>
  <div class="hero-manage art-page-container">
    <ElCard shadow="never" class="table-card">
      <!-- 搜索区 -->
      <div class="search-row">
        <span class="search-label">标题</span>
        <ElInput
          v-model="searchKeyword"
          placeholder="请输入标题关键字"
          clearable
          class="search-input"
          @keyup.enter="onSearch"
        />
        <ElButton type="primary" @click="onSearch">查询</ElButton>
        <ElButton @click="onReset">重置</ElButton>
      </div>

      <!-- 工具栏 -->
      <div class="table-toolbar">
        <ElButton type="primary" class="add-btn" :icon="Plus" @click="onAdd">新增焦点</ElButton>
        <div class="toolbar-icons">
          <ElTooltip content="刷新" placement="top">
            <span class="toolbar-icon" @click="onRefresh">
              <ElIcon :size="16"><Refresh /></ElIcon>
            </span>
          </ElTooltip>
          <ElTooltip :content="sortDesc ? '当前倒序，点击切换正序' : '当前正序，点击切换倒序'" placement="top">
            <span class="toolbar-icon" @click="onSortToggle">
              <ElIcon :size="16"><Sort /></ElIcon>
            </span>
          </ElTooltip>
          <ElTooltip content="全屏" placement="top">
            <span class="toolbar-icon" @click="onFullscreen">
              <ElIcon :size="16"><FullScreen /></ElIcon>
            </span>
          </ElTooltip>
          <ElTooltip content="列表视图" placement="top">
            <span class="toolbar-icon">
              <ElIcon :size="16"><Menu /></ElIcon>
            </span>
          </ElTooltip>
          <ElTooltip content="设置" placement="top">
            <span class="toolbar-icon">
              <ElIcon :size="16"><Setting /></ElIcon>
            </span>
          </ElTooltip>
        </div>
      </div>

      <ElTable
        v-loading="loading"
        :data="sortedData"
        row-key="id"
        class="hero-table"
        style="width: 100%"
      >
        <ElTableColumn type="index" label="序号" width="70" />
        <ElTableColumn prop="title" label="标题" min-width="160">
          <template #default="{ row }">
            <div class="text-cell">{{ row.title }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="subtitle" label="副标题" min-width="220">
          <template #default="{ row }">
            <div class="text-cell">{{ row.subtitle || '—' }}</div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="图片管理" width="150" align="center">
          <template #default="{ row }">
            <ElButton size="small" type="primary" plain class="cell-btn" @click="onOpenImageDialog(row)">
              管理图片
            </ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn label="超链接管理" width="150" align="center">
          <template #default="{ row }">
            <ElButton size="small" type="primary" plain class="cell-btn" @click="onOpenLinkDialog(row)">
              管理链接
            </ElButton>
          </template>
        </ElTableColumn>
        <ElTableColumn label="管理" width="90" align="center">
          <template #default="{ row }">
            <ElDropdown trigger="click" @command="(cmd: string) => onManage(cmd, row)">
              <span class="manage-trigger">
                <ElIcon :size="16" class="manage-icon"><MoreFilled /></ElIcon>
              </span>
              <template #dropdown>
                <ElDropdownMenu>
                  <ElDropdownItem command="edit">
                    <ElIcon class="mr-1"><Edit /></ElIcon>
                    编辑
                  </ElDropdownItem>
                  <ElDropdownItem command="image">
                    <ElIcon class="mr-1"><Picture /></ElIcon>
                    图片管理
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
      :title="dialogMode === 'add' ? '新增焦点图' : '编辑焦点图'"
      width="560px"
      destroy-on-close
    >
      <ElForm :model="formData" label-width="90px">
        <ElFormItem label="标题" required>
          <ElInput v-model="formData.title" placeholder="焦点图主标题（大字）" />
        </ElFormItem>
        <ElFormItem label="副标题">
          <ElInput
            v-model="formData.subtitle"
            type="textarea"
            :rows="2"
            placeholder="焦点图下方一行营销描述"
          />
        </ElFormItem>
        <ElFormItem label="顶部标签">
          <ElInput v-model="formData.badge" placeholder="轮播顶部的小标签文案，如：现代化网站解决方案" />
        </ElFormItem>
        <ElFormItem label="图片 URL" :required="dialogMode === 'add'">
          <ElInput v-model="formData.imageUrl" placeholder="/images/xxx.webp、外链或 Supabase 图片地址" />
        </ElFormItem>
        <ElFormItem label="图片描述">
          <ElInput v-model="formData.imageAlt" placeholder="图片替代文本（无障碍 / SEO 用）" />
        </ElFormItem>
        <ElFormItem label="超链接">
          <ElInput v-model="formData.linkUrl" placeholder="/products 或 https://..." />
        </ElFormItem>
        <ElFormItem label="排序值">
          <ElInputNumber v-model="formData.sortOrder" :min="0" :max="9999" />
          <span class="form-tip">数值小的排前面</span>
        </ElFormItem>
        <ElFormItem label="启用">
          <ElSwitch v-model="formData.enabled" />
          <span class="form-tip">仅启用的焦点图会显示在前台首页轮播</span>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="dialogSaving" @click="onSave">保存</ElButton>
      </template>
    </ElDialog>

    <!-- 图片管理 弹窗 -->
    <ElDialog
      v-model="imageDialogVisible"
      title="图片管理"
      width="520px"
      destroy-on-close
    >
      <div class="image-dialog">
        <div class="image-preview">
          <img v-if="imagePreview" :src="imagePreview" alt="预览" />
          <div v-else class="image-empty">暂无预览</div>
        </div>

        <ElDivider />

        <div class="image-section">
          <div class="image-section-label">上传本地图片</div>
          <ElUpload
            action=""
            :auto-upload="false"
            :show-file-list="false"
            accept="image/*"
            :on-change="onFileChange"
          >
            <ElButton type="primary">选择图片文件</ElButton>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg / png / webp 等，不超过 5MB；保存后上传到 Supabase Storage
              </div>
            </template>
          </ElUpload>
          <div v-if="imageForm.pickedFile" class="picked-file">
            已选择：{{ imageForm.pickedFile.name }}
          </div>
        </div>

        <ElDivider>或</ElDivider>

        <div class="image-section">
          <div class="image-section-label">填写图片 URL</div>
          <ElInput
            v-model="imageForm.imageUrl"
            placeholder="/images/xxx.webp 或 https://..."
          />
        </div>
      </div>
      <template #footer>
        <ElButton @click="imageDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="imageUploading" @click="onSaveImage">保存</ElButton>
      </template>
    </ElDialog>

    <!-- 超链接管理 弹窗 -->
    <ElDialog
      v-model="linkDialogVisible"
      title="超链接管理"
      width="480px"
      destroy-on-close
    >
      <ElForm label-width="90px">
        <ElFormItem label="超链接">
          <ElInput
            v-model="linkForm.linkUrl"
            placeholder="/products 或 https://..."
            clearable
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="linkDialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="linkSaving" @click="onSaveLink">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped lang="scss">
.hero-manage {
  padding: 16px;

  .search-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 20px;

    .search-label {
      font-size: 14px;
      color: #4b5563;
      white-space: nowrap;
    }

    .search-input {
      width: 260px;
    }
  }

  .table-card {
    border-radius: 12px;

    :deep(.el-card__body) {
      padding: 20px;
    }

    .table-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
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
      border-radius: 8px;
      color: #6b7280;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease;

      &:hover {
        background: #f3f4f6;
        color: #1f2937;
      }
    }
  }

  .hero-table {
    :deep(th.el-table__cell) {
      background: #ffffff;
      color: #6b7280;
      font-weight: 500;
      padding: 12px 0;
    }

    :deep(td.el-table__cell) {
      padding: 18px 0;
    }

    .text-cell {
      font-size: 14px;
      line-height: 1.6;
      color: #1f2937;
      white-space: normal;
      word-break: break-word;
    }
  }

  .cell-btn {
    border-radius: 6px;
  }

  .form-tip {
    margin-left: 10px;
    font-size: 12px;
    color: #9ca3af;
  }

  .manage-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    color: #4b5563;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
      background: #eff6ff;
      color: #1f2937;
    }

    .manage-icon {
      transform: rotate(90deg);
    }
  }
}

.image-dialog {
  .image-preview {
    width: 100%;
    height: 180px;
    border: 1px dashed #d1d5db;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #f9fafb;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .image-empty {
      color: #9ca3af;
      font-size: 14px;
    }
  }

  .image-section {
    margin-bottom: 8px;

    .image-section-label {
      font-size: 14px;
      color: #4b5563;
      margin-bottom: 8px;
    }

    .picked-file {
      margin-top: 6px;
      font-size: 12px;
      color: #6b7280;
    }
  }
}
</style>
