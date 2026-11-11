'use client';

import * as React from 'react';
import { fetchCreateUser, fetchUserDuplicateState } from './user-api';

// ====== 类型 ======
export interface StoredUser {
  username: string;
  accountType: 'phone' | 'email';
  account: string; // 手机号或邮箱
  password: string;
}

export interface SessionUser {
  username: string;
}

export type AuthView = 'login' | 'register' | 'forgot';

interface AuthDialogState {
  open: boolean;
  view: AuthView;
  forced: boolean; // 强制登录（门禁场景，不可关闭）
  redirect: string | null; // 登录成功后跳转地址
}

interface RegisterPayload {
  username: string;
  accountType: 'phone' | 'email';
  account: string;
  password: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  hydrated: boolean; // 本地会话恢复完成
  rememberedUsername: string;
  dialog: AuthDialogState;
  openAuth: (options?: Partial<Omit<AuthDialogState, 'open'>>) => void;
  closeAuth: () => void;
  setAuthView: (view: AuthView) => void;
  login: (username: string, password: string, remember: boolean) => { ok: boolean; error?: string };
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; error?: string }>;
  resetPassword: (email: string, newPassword: string) => { ok: boolean; error?: string };
  logout: () => void;
  /** 用户名是否已被占用（忽略大小写），用于注册时实时查重 */
  isUsernameTaken: (username: string) => boolean;
  /** 邮箱是否已被占用，用于注册时实时查重 */
  isAccountTaken: (account: string) => boolean;
  /** 服务端查重（与后台用户管理共用数据），返回用户名/邮箱是否已存在 */
  checkRemoteDuplicate: (params: {
    userName?: string;
    userEmail?: string;
  }) => Promise<{ userNameExists: boolean; userEmailExists: boolean }>;
}

// ====== 常量 ======
const USERS_KEY = 'sjcode_auth_users';
const SESSION_KEY = 'sjcode_auth_session';
const REMEMBER_KEY = 'sjcode_auth_remember';

// 演示环境固定验证码
export const MOCK_VERIFY_CODE = '123456';

// 预置演示账号
const SEED_USERS: StoredUser[] = [
  {
    username: 'demo',
    accountType: 'email',
    account: 'demo@sjcode.cn',
    password: '123456',
  },
];

const AuthContext = React.createContext<AuthContextValue | null>(null);

function readUsers(): StoredUser[] {
  if (typeof window === 'undefined') return SEED_USERS;
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) {
      window.localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    const parsed = JSON.parse(raw) as StoredUser[];
    return Array.isArray(parsed) ? parsed : SEED_USERS;
  } catch {
    return SEED_USERS;
  }
}

function writeUsers(users: StoredUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = React.useState(false);
  const [rememberedUsername, setRememberedUsername] = React.useState('');
  const [dialog, setDialog] = React.useState<AuthDialogState>({
    open: false,
    view: 'login',
    forced: false,
    redirect: null,
  });

  // 挂载时恢复会话与记住的用户名
  React.useEffect(() => {
    readUsers();
    try {
      const session = window.localStorage.getItem(SESSION_KEY);
      if (session) setUser({ username: session });
      setRememberedUsername(window.localStorage.getItem(REMEMBER_KEY) ?? '');
    } catch {
      /* 忽略存储异常 */
    } finally {
      setHydrated(true);
    }
  }, []);

  const openAuth = React.useCallback(
    (options?: Partial<Omit<AuthDialogState, 'open'>>) => {
      setDialog((prev) => ({
        open: true,
        view: options?.view ?? 'login',
        forced: options?.forced ?? false,
        redirect: options?.redirect !== undefined ? options.redirect : prev.redirect,
      }));
    },
    []
  );

  const closeAuth = React.useCallback(() => {
    setDialog((prev) => (prev.forced ? prev : { ...prev, open: false }));
  }, []);

  const setAuthView = React.useCallback((view: AuthView) => {
    setDialog((prev) => ({ ...prev, view }));
  }, []);

  const login = React.useCallback(
    (username: string, password: string, remember: boolean) => {
      const name = username.trim();
      if (!name || !password) {
        return { ok: false, error: '请输入用户名和密码' };
      }
      const users = readUsers();
      const matched = users.find(
        (u) => u.username.toLowerCase() === name.toLowerCase()
      );
      if (!matched) {
        return { ok: false, error: '用户不存在，请先注册' };
      }
      if (matched.password !== password) {
        return { ok: false, error: '密码错误，请重试' };
      }
      window.localStorage.setItem(SESSION_KEY, matched.username);
      if (remember) {
        window.localStorage.setItem(REMEMBER_KEY, matched.username);
        setRememberedUsername(matched.username);
      } else {
        window.localStorage.removeItem(REMEMBER_KEY);
        setRememberedUsername('');
      }
      setUser({ username: matched.username });
      setDialog((prev) => ({ ...prev, open: false, forced: false }));
      return { ok: true };
    },
    []
  );

  const register = React.useCallback(async (payload: RegisterPayload) => {
    const username = payload.username.trim();
    const account = payload.account.trim();
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
      return { ok: false, error: '用户名需为 3-16 位字母、数字或下划线' };
    }
    const users = readUsers();
    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, error: '该用户名已被注册' };
    }
    if (
      users.some(
        (u) =>
          u.accountType === payload.accountType &&
          u.account.toLowerCase() === account.toLowerCase()
      )
    ) {
      return {
        ok: false,
        error: payload.accountType === 'phone' ? '该手机号已注册' : '该邮箱已注册',
      };
    }

    // 写入后台用户列表（与后台「用户管理」共用同一份数据）
    try {
      const result = await fetchCreateUser({
        userName: username,
        nickName: username,
        userEmail: account,
        userGender: '保密',
        userPhone: '',
        userRoles: ['R_USER'],
        status: '1',
      });
      if (!result.ok) {
        return { ok: false, error: result.msg || '注册失败，请稍后重试' };
      }
    } catch {
      return { ok: false, error: '注册服务暂时不可用，请稍后重试' };
    }

    const next: StoredUser[] = [...users, { ...payload, username, account }];
    writeUsers(next);
    window.localStorage.setItem(SESSION_KEY, username);
    setUser({ username });
    setDialog((prev) => ({ ...prev, open: false, forced: false }));
    return { ok: true };
  }, []);

  const resetPassword = React.useCallback(
    (email: string, newPassword: string) => {
      const mail = email.trim().toLowerCase();
      const users = readUsers();
      const index = users.findIndex(
        (u) => u.accountType === 'email' && u.account.toLowerCase() === mail
      );
      if (index === -1) {
        return { ok: false, error: '该邮箱尚未注册，请检查后重试' };
      }
      if (newPassword.length < 6) {
        return { ok: false, error: '新密码长度至少 6 位' };
      }
      users[index] = { ...users[index], password: newPassword };
      writeUsers(users);
      return { ok: true };
    },
    []
  );

  const logout = React.useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  /** 用户名查重（忽略大小写），注册页实时提示 */
  const isUsernameTaken = React.useCallback((username: string) => {
    const name = username.trim();
    if (!name) return false;
    return readUsers().some((u) => u.username.toLowerCase() === name.toLowerCase());
  }, []);

  /** 邮箱查重（忽略大小写），注册页实时提示 */
  const isAccountTaken = React.useCallback((account: string) => {
    const mail = account.trim().toLowerCase();
    if (!mail) return false;
    return readUsers().some(
      (u) => u.accountType === 'email' && u.account.toLowerCase() === mail
    );
  }, []);

  /** 服务端查重：与后台「用户管理」共用数据，避免同一账号被重复注册 */
  const checkRemoteDuplicate = React.useCallback(
    async (params: { userName?: string; userEmail?: string }) => {
      try {
        return await fetchUserDuplicateState(params);
      } catch {
        // 服务不可用时降级为仅本地查重
        return {
          userNameExists: params.userName ? isUsernameTaken(params.userName) : false,
          userEmailExists: params.userEmail ? isAccountTaken(params.userEmail) : false,
        };
      }
    },
    [isUsernameTaken, isAccountTaken]
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      rememberedUsername,
      dialog,
      openAuth,
      closeAuth,
      setAuthView,
      login,
      register,
      resetPassword,
      logout,
      isUsernameTaken,
      isAccountTaken,
      checkRemoteDuplicate,
    }),
    [user, hydrated, rememberedUsername, dialog, openAuth, closeAuth, setAuthView, login, register, resetPassword, logout, isUsernameTaken, isAccountTaken, checkRemoteDuplicate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth 必须在 <AuthProvider> 内使用');
  }
  return ctx;
}

// ====== 校验工具 ======
export const phoneReg = /^1[3-9]\d{9}$/;
export const emailReg = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/;
