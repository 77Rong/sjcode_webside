import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

// 新增用户
export function fetchCreateUser(data: Partial<Api.SystemManage.UserListItem>) {
  return request.post<Api.SystemManage.UserListItem>({
    url: '/api/user',
    data
  })
}

// 更新用户
export function fetchUpdateUser(id: number, data: Partial<Api.SystemManage.UserListItem>) {
  return request.put<Api.SystemManage.UserListItem>({
    url: `/api/user/${id}`,
    data
  })
}

// 删除用户
export function fetchDeleteUser(id: number) {
  return request.del({
    url: `/api/user/${id}`
  })
}

// 重置用户密码
export function fetchResetUserPassword(id: number, password: string) {
  return request.put({
    url: `/api/user/${id}/password`,
    data: { password }
  })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

// 获取菜单列表
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/v3/system/menus'
  })
}
