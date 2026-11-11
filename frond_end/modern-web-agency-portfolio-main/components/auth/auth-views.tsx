'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useAuth,
  MOCK_VERIFY_CODE,
  emailReg,
  type AuthView,
} from '@/lib/auth-context';
import { SlideToUnlock } from '@/components/auth/slide-to-unlock';

type ViewMode = 'dialog' | 'page';

// ============ 通用小组件 ============

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type={show ? 'text' : 'password'}
        className="h-11 pl-9 pr-10"
        autoComplete="new-password"
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        aria-label={show ? '隐藏密码' : '显示密码'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function useCountdown() {
  const [seconds, setSeconds] = React.useState(0);
  React.useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);
  const start = (value = 60) => setSeconds(value);
  return { seconds, start };
}

function CodeSendButton({
  disabled,
  seconds,
  onSend,
}: {
  disabled: boolean;
  seconds: number;
  onSend: () => void;
}) {
  const counting = seconds > 0;
  return (
    <button
      type="button"
      disabled={disabled || counting}
      onClick={onSend}
      className={cn(
        'h-11 shrink-0 whitespace-nowrap rounded-lg border px-3 text-sm font-medium transition-colors sm:px-4',
        counting
          ? 'cursor-not-allowed text-muted-foreground'
          : disabled
          ? 'cursor-not-allowed text-muted-foreground'
          : 'border-primary/40 text-primary hover:bg-primary/5'
      )}
    >
      {counting ? `${seconds}s 后重发` : '获取验证码'}
    </button>
  );
}

// 视图跳转（弹窗内切视图，独立页走路由）
function useViewSwitch(mode: ViewMode) {
  const { setAuthView, openAuth } = useAuth();
  const router = useRouter();
  return React.useCallback(
    (view: AuthView) => {
      if (mode === 'dialog') {
        setAuthView(view);
      } else {
        const path = view === 'register' ? '/auth/register' : view === 'forgot' ? '/auth/forgot-password' : '/';
        router.push(path);
        if (view === 'login') openAuth({ view: 'login' });
      }
    },
    [mode, setAuthView, openAuth, router]
  );
}

// ============ 登录视图 ============

export function LoginView({ mode }: { mode: ViewMode }) {
  const { login, rememberedUsername } = useAuth();
  const switchView = useViewSwitch(mode);

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(true);
  const [verified, setVerified] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // 弹窗复用时预填记住的用户名
  React.useEffect(() => {
    if (rememberedUsername) setUsername(rememberedUsername);
  }, [rememberedUsername]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }
    if (!verified) {
      setError('请先按住滑块完成安全验证');
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      const result = login(username, password, remember);
      setLoading(false);
      if (!result.ok) {
        setError(result.error ?? '登录失败');
        setVerified(false);
      }
      // 成功后由 AuthContext 关闭弹窗；独立页面由调用方处理跳转
    }, 500);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight">用户登录</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">登录后即可查看帮助中心全部内容</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />

        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="用户名"
            className="h-11 pl-9"
            autoComplete="username"
          />
        </div>

        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
          autoComplete="current-password"
        />

        <SlideToUnlock verified={verified} onVerifiedChange={setVerified} />

        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
          记住密码
        </label>

        <Button
          type="submit"
          disabled={loading}
          className={cn(
            'h-11 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-base font-medium shadow-md transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg',
            !verified && 'opacity-90'
          )}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '登录'}
        </Button>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => switchView('register')}
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            注册
          </button>
          <button
            type="button"
            onClick={() => switchView('forgot')}
            className="font-medium text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
          >
            忘记密码
          </button>
        </div>

        <p className="rounded-lg bg-muted/60 py-2 text-center text-xs text-muted-foreground">
          演示账号：<span className="font-medium text-foreground">demo</span>　密码：
          <span className="font-medium text-foreground">123456</span>
        </p>
      </form>
    </div>
  );
}

// ============ 注册视图 ============

export function RegisterView({ mode }: { mode: ViewMode }) {
  const { register, isUsernameTaken, isAccountTaken, checkRemoteDuplicate } = useAuth();
  const switchView = useViewSwitch(mode);
  const router = useRouter();
  const { seconds, start } = useCountdown();

  const [username, setUsername] = React.useState('');
  const [account, setAccount] = React.useState('');
  const [code, setCode] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [agreed, setAgreed] = React.useState(false);
  const [codeSent, setCodeSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  /** 服务端查重结果（与后台用户管理共用数据） */
  const [remoteState, setRemoteState] = React.useState({
    userNameExists: false,
    userEmailExists: false,
  });

  /** 仅支持邮箱注册 */
  const accountValid = emailReg.test(account);

  /** 用户名格式校验 */
  const usernameFormatValid = /^[a-zA-Z0-9_]{3,16}$/.test(username);

  /** 用户名是否已被占用（本地 + 服务端，仅在格式合法时提示，避免误报） */
  const usernameTaken =
    usernameFormatValid && (isUsernameTaken(username) || remoteState.userNameExists);

  /** 邮箱是否已被占用（本地 + 服务端，仅在格式合法时提示，避免误报） */
  const accountTaken = accountValid && (isAccountTaken(account) || remoteState.userEmailExists);

  /** 防抖调用服务端查重 */
  React.useEffect(() => {
    const name = username.trim();
    const mail = account.trim();
    if (!usernameFormatValid && !accountValid) {
      setRemoteState({ userNameExists: false, userEmailExists: false });
      return;
    }
    const timer = window.setTimeout(() => {
      checkRemoteDuplicate({
        userName: usernameFormatValid ? name : undefined,
        userEmail: accountValid ? mail : undefined,
      })
        .then(setRemoteState)
        .catch(() => undefined);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [username, account, usernameFormatValid, accountValid, checkRemoteDuplicate]);

  const handleSendCode = () => {
    if (!accountValid) {
      setError('请输入正确的邮箱地址');
      return;
    }
    if (accountTaken) {
      setError('该邮箱已被注册，请更换邮箱');
      return;
    }
    setError(null);
    setCodeSent(true);
    start(60);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!usernameFormatValid) {
      setError('用户名需为 3-16 位字母、数字或下划线');
      return;
    }
    if (usernameTaken) {
      setError('该用户名已被注册，请更换用户名');
      return;
    }
    if (!accountValid) {
      setError('请输入正确的邮箱地址');
      return;
    }
    if (accountTaken) {
      setError('该邮箱已被注册，请更换邮箱');
      return;
    }
    if (!codeSent) {
      setError('请先获取验证码');
      return;
    }
    if (code !== MOCK_VERIFY_CODE) {
      setError('验证码错误（演示验证码为 123456）');
      return;
    }
    if (password.length < 6) {
      setError('密码长度至少 6 位');
      return;
    }
    if (password !== confirm) {
      setError('两次输入的密码不一致');
      return;
    }
    if (!agreed) {
      setError('请先阅读并同意用户协议与隐私政策');
      return;
    }
    setLoading(true);
    try {
      const result = await register({ username, accountType: 'email', account, password });
      if (!result.ok) {
        setError(result.error ?? '注册失败');
        return;
      }
      if (mode === 'page') router.push('/help');
      // dialog 模式下注册成功 AuthContext 会自动登录并关闭弹窗
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight">注册账号</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">使用邮箱注册世纪源创账号</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />

        <div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用户名（3-16 位字母、数字、下划线）"
              className={cn('h-11 pl-9', usernameTaken && 'border-destructive')}
              autoComplete="username"
            />
          </div>
          {usernameTaken && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              该用户名已被注册，请更换用户名
            </p>
          )}
        </div>

        <div>
          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder="邮箱地址"
                className={cn('h-11 pl-9', accountTaken && 'border-destructive')}
                type="email"
                inputMode="email"
                autoComplete="email"
              />
            </div>
            <CodeSendButton
              disabled={!account.trim() || accountTaken}
              seconds={seconds}
              onSend={handleSendCode}
            />
          </div>
          {accountTaken && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              该邮箱已被注册，请更换邮箱
            </p>
          )}
        </div>

        {codeSent && (
          <p className="-mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            验证码已发送至邮箱，演示验证码为
            <span className="font-semibold">{MOCK_VERIFY_CODE}</span>
          </p>
        )}

        <div className="relative">
          <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6 位验证码"
            className="h-11 pl-9 tracking-[0.3em]"
            inputMode="numeric"
            maxLength={6}
          />
        </div>

        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="设置密码（至少 6 位）"
        />
        <PasswordInput
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="确认密码"
        />

        <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
            className="mt-0.5"
          />
          <span>
            我已阅读并同意
            <Link href="/about" className="text-primary hover:underline">
              《用户协议》
            </Link>
            和
            <Link href="/about" className="text-primary hover:underline">
              《隐私政策》
            </Link>
          </span>
        </label>

        <Button
          type="submit"
          disabled={loading || usernameTaken || accountTaken}
          className="h-11 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-base font-medium shadow-md transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '立即注册'}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          已有账号？
          <button
            type="button"
            onClick={() => switchView('login')}
            className="ml-1 font-medium text-primary hover:underline underline-offset-4"
          >
            返回登录
          </button>
        </div>
      </form>
    </div>
  );
}

// ============ 忘记密码视图（邮箱找回，三步） ============

export function ForgotPasswordView({ mode }: { mode: ViewMode }) {
  const { resetPassword } = useAuth();
  const switchView = useViewSwitch(mode);
  const { seconds, start } = useCountdown();

  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [email, setEmail] = React.useState('');
  const [code, setCode] = React.useState('');
  const [codeSent, setCodeSent] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const emailValid = emailReg.test(email);

  const handleSendCode = () => {
    if (!emailValid) {
      setError('请输入正确的邮箱地址');
      return;
    }
    setError(null);
    setCodeSent(true);
    start(60);
  };

  const handleNext = () => {
    setError(null);
    if (!emailValid) {
      setError('请输入正确的邮箱地址');
      return;
    }
    if (!codeSent) {
      setError('请先获取邮箱验证码');
      return;
    }
    setStep(2);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code !== MOCK_VERIFY_CODE) {
      setError('验证码错误（演示验证码为 123456）');
      return;
    }
    if (password.length < 6) {
      setError('新密码长度至少 6 位');
      return;
    }
    if (password !== confirm) {
      setError('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      const result = resetPassword(email, password);
      setLoading(false);
      if (!result.ok) {
        setError(result.error ?? '重置失败');
        return;
      }
      setStep(3);
    }, 500);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight">找回密码</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">通过绑定邮箱验证身份并重置密码</p>
      </div>

      {/* 步骤指示 */}
      <div className="mb-7 flex items-center justify-center gap-2 text-xs">
        {['验证邮箱', '设置新密码', '完成'].map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          return (
            <React.Fragment key={label}>
              <span
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors',
                  step >= n
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
                    step > n ? 'bg-primary text-primary-foreground' : 'bg-background'
                  )}
                >
                  {step > n ? <CheckCircle2 className="h-3 w-3" /> : n}
                </span>
                {label}
              </span>
              {i < 2 && <span className="h-px w-5 bg-border" />}
            </React.Fragment>
          );
        })}
      </div>

      {step === 1 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNext();
          }}
          className="space-y-4"
        >
          <FormError message={error} />

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="注册时绑定的邮箱"
              className="h-11 pl-9"
              autoComplete="email"
            />
          </div>

          <div className="flex gap-2.5">
            <div className="relative flex-1">
              <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="邮箱验证码"
                className="h-11 pl-9 tracking-[0.3em]"
                inputMode="numeric"
                maxLength={6}
              />
            </div>
            <CodeSendButton disabled={!email.trim()} seconds={seconds} onSend={handleSendCode} />
          </div>

          {codeSent && (
            <p className="-mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <Mail className="h-3.5 w-3.5" />
              重置邮件已发送，演示验证码为
              <span className="font-semibold">{MOCK_VERIFY_CODE}</span>
            </p>
          )}

          <Button
            type="submit"
            className="h-11 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-base font-medium shadow-md transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
          >
            下一步
          </Button>

          <button
            type="button"
            onClick={() => switchView('login')}
            className="mx-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            返回登录
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleReset} className="space-y-4">
          <FormError message={error} />

          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="新密码（至少 6 位）"
          />
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="确认新密码"
          />

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-base font-medium shadow-md transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : '确认重置密码'}
          </Button>

          <button
            type="button"
            onClick={() => {
              setError(null);
              setStep(1);
            }}
            className="mx-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            上一步
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="py-6 text-center">
          <MotionSuccess />
          <h3 className="mt-5 text-lg font-semibold">密码重置成功</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            请使用新密码登录，建议定期更换以保障账号安全。
          </p>
          <Button
            onClick={() => switchView('login')}
            className="mt-7 h-11 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-base font-medium shadow-md transition-all hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
          >
            返回登录
          </Button>
        </div>
      )}
    </div>
  );
}

// 成功动画
function MotionSuccess() {
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
    </div>
  );
}

// 独立页面共用的品牌头部
export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-muted/30 px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center" aria-label="世纪源创 首页">
          <Logo />
        </Link>
        <div className="rounded-3xl border bg-card/80 p-7 shadow-xl backdrop-blur-xl sm:p-9">
          {children}
        </div>
      </div>
    </div>
  );
}
