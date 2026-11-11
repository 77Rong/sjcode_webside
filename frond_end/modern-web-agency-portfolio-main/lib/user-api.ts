/**
 * 前台用户相关接口（对接 back-end-mock 的 /api/user）
 *
 * Mock 服务地址可用环境变量覆盖：NEXT_PUBLIC_MOCK_API_BASE
 */

const MOCK_API_BASE = process.env.NEXT_PUBLIC_MOCK_API_BASE || 'http://localhost:3100';

export interface RemoteDuplicateState {
  userNameExists: boolean;
  userEmailExists: boolean;
}

export interface CreateUserPayload {
  userName: string;
  nickName: string;
  userEmail: string;
  userGender: string;
  userPhone: string;
  userRoles: string[];
  status: string;
}

/** 用户名/邮箱是否已被占用（服务端查重，与后台用户管理共用同一份数据） */
export async function fetchUserDuplicateState(params: {
  userName?: string;
  userEmail?: string;
}): Promise<RemoteDuplicateState> {
  const query = new URLSearchParams();
  if (params.userName) query.set('userName', params.userName);
  if (params.userEmail) query.set('userEmail', params.userEmail);

  const res = await fetch(`${MOCK_API_BASE}/api/user/check?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('查重请求失败');

  const json = await res.json();
  return {
    userNameExists: !!json?.data?.userNameExists,
    userEmailExists: !!json?.data?.userEmailExists,
  };
}

/** 注册新用户，写入后台用户列表 */
export async function fetchCreateUser(payload: CreateUserPayload): Promise<{ ok: boolean; msg?: string }> {
  const res = await fetch(`${MOCK_API_BASE}/api/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('注册请求失败');

  const json = await res.json();
  return { ok: json?.code === 200, msg: json?.msg };
}
