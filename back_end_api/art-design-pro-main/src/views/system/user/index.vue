<!-- 用户管理页面 -->
<!-- art-full-height 自动计算出页面剩余高度 -->
<!-- art-table-card 一个符合系统样式的 class，同时自动撑满剩余高度 -->
<!-- 更多 useTable 使用示例请移步至 功能示例 下面的高级表格示例或者查看官方文档 -->
<!-- useTable 文档：https://www.artd.pro/docs/zh/guide/hooks/use-table.html -->
<template>
  <div class="user-page art-full-height">
    <!-- 搜索栏 -->
    <UserSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams"></UserSearch>

    <ElCard class="art-table-card">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增用户</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 用户弹窗 -->
      <UserDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :user-data="currentUserData"
        @submit="handleDialogSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchCreateUser,
    fetchDeleteUser,
    fetchGetUserList,
    fetchResetUserPassword,
    fetchUpdateUser
  } from '@/api/system-manage'
  import UserSearch from './modules/user-search.vue'
  import UserDialog from './modules/user-dialog.vue'
  import { ElTag, ElMessageBox } from 'element-plus'
  import { DialogType } from '@/types'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserData = ref<Partial<UserListItem>>({})

  // 选中行
  const selectedRows = ref<UserListItem[]>([])

  // 搜索表单
  const searchForm = ref({
    userEmail: undefined,
    status: '1'
  })

  // 用户状态配置
  const USER_STATUS_CONFIG = {
    '1': { type: 'success' as const, text: '在线' },
    '2': { type: 'info' as const, text: '离线' },
    '3': { type: 'warning' as const, text: '异常' },
    '4': { type: 'info' as const, text: '注销' },
    '5': { type: 'danger' as const, text: '封号' }
  } as const

  /**
   * 获取用户状态配置
   */
  const getUserStatusConfig = (status: string) => {
    return (
      USER_STATUS_CONFIG[status as keyof typeof USER_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchGetUserList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      // 自定义分页字段映射，未设置时将使用全局配置 tableConfig.ts 中的 paginationKey
      // paginationKey: {
      //   current: 'pageNum',
      //   size: 'pageSize'
      // },
      columnsFactory: () => [
        { type: 'selection' }, // 勾选列
        { type: 'index', width: 60, label: '序号' }, // 序号
        {
          prop: 'userEmail',
          label: '邮箱',
          width: 280,
          // visible: false, // 默认是否显示列
          formatter: (row) => {
            return h('div', { class: 'user flex-c' }, [
              h('div', { class: 'ml-2' }, [
                h('p', { class: 'user-name' }, row.userEmail)
              ])
            ])
          }
        },
        {
          prop: 'nickName',
          label: '昵称',
          width: 140,
          showOverflowTooltip: true
        },
        {
          prop: 'status',
          label: '状态',
          formatter: (row) => {
            const statusConfig = getUserStatusConfig(row.status)
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
          }
        },
        {
          prop: 'createTime',
          label: '创建日期',
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 180,
          fixed: 'right', // 固定列
          formatter: (row) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                icon: 'ri:key-2-line',
                iconClass: 'bg-warning/12 text-warning',
                onClick: () => resetPassword(row)
              }),
              h(ArtButtonTable, {
                icon: row.status === '5' ? 'ri:lock-unlock-line' : 'ri:lock-line',
                iconClass: 'bg-info/12 text-info',
                onClick: () => toggleBan(row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                onClick: () => deleteUser(row)
              })
            ])
        }
      ]
    }
  })

  /**
   * 搜索处理
   * @param params 参数
   */
  const handleSearch = (params: Api.SystemManage.UserSearchParams) => {
    replaceSearchParams(params)
    getData()
  }

  /**
   * 显示用户弹窗
   */
  const showDialog = (type: DialogType, row?: UserListItem): void => {
    console.log('打开弹窗:', { type, row })
    dialogType.value = type
    currentUserData.value = row || {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 删除用户
   */
  const deleteUser = (row: UserListItem): void => {
    ElMessageBox.confirm(`确定要注销该用户吗？`, '注销用户', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }).then(async () => {
      await fetchDeleteUser(row.id)
      ElMessage.success('注销成功')
      refreshData()
    })
  }

  /**
   * 重置用户密码
   */
  const resetPassword = async (row: UserListItem): Promise<void> => {
    try {
      const { value } = await ElMessageBox.prompt(
        `为「${row.userEmail}」设置新密码（至少 6 位）`,
        '重置密码',
        {
          confirmButtonText: '确认重置',
          cancelButtonText: '取消',
          inputType: 'password',
          inputPlaceholder: '请输入新密码',
          inputValidator: (val) => {
            if (!val || val.length < 6) return '密码至少 6 位'
            return true
          }
        }
      )
      await fetchResetUserPassword(row.id, value)
      ElMessage.success('密码重置成功')
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        ElMessage.error('重置密码失败')
      }
    }
  }

  /**
   * 封号 / 解封
   */
  const toggleBan = async (row: UserListItem): Promise<void> => {
    const isBanned = row.status === '5'
    const nextStatus = isBanned ? '1' : '5'
    const actionText = isBanned ? '解封' : '封号'
    try {
      await ElMessageBox.confirm(
        `确定要${actionText}「${row.userEmail}」吗？`,
        `${actionText}用户`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: isBanned ? 'success' : 'warning'
        }
      )
      await fetchUpdateUser(row.id, { status: nextStatus })
      ElMessage.success(`${actionText}成功`)
      refreshData()
    } catch (error) {
      if (error !== 'cancel' && error !== 'close') {
        ElMessage.error(`${actionText}失败`)
      }
    }
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async (data: {
    email: string
    nickName: string
    role: string[]
    status: string
  }) => {
    try {
      if (dialogType.value === 'edit' && currentUserData.value.id) {
        await fetchUpdateUser(currentUserData.value.id, {
          userEmail: data.email,
          nickName: data.nickName,
          userRoles: data.role,
          status: data.status
        })
        ElMessage.success('更新成功')
      } else {
        await fetchCreateUser({
          userName: data.email.split('@')[0],
          userEmail: data.email,
          nickName: data.nickName,
          userRoles: data.role,
          status: data.status
        })
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      currentUserData.value = {}
      refreshData()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: UserListItem[]): void => {
    selectedRows.value = selection
    console.log('选中行数据:', selectedRows.value)
  }
</script>
