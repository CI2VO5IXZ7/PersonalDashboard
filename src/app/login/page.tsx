"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!data.success) { setError(data.message); setLoading(false); return; }
      }
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { setError("邮箱或密码错误"); setLoading(false); return; }
      router.push("/mail");
    } catch {
      setError("操作失败，请稍后重试");
      setLoading(false);
    }
  }

  const inputCls = "w-full px-4 py-3 text-sm rounded-xl bg-background border border-border text-foreground outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-muted/50";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/15 flex items-center justify-center mb-4 shadow-lg shadow-accent/10">
            <LayoutDashboard size={28} className="text-accent-light" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Personal Dashboard</h1>
          <p className="text-sm text-muted mt-1">个人管理看板</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-lg shadow-black/20">
          <h2 className="text-base font-semibold text-foreground mb-6">{isRegister ? "创建账号" : "欢迎回来"}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">名称</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="输入你的名称" required />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">邮箱</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="输入邮箱地址" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">密码</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputCls} pr-10`} placeholder="输入密码" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <div className="px-3 py-2 rounded-lg bg-danger/10 text-danger text-xs">{error}</div>}

            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-accent hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-accent/20">
              {loading ? "处理中..." : isRegister ? "注册" : "登录"}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-border text-center">
            <p className="text-xs text-muted">
              {isRegister ? "已有账号？" : "没有账号？"}
              <button onClick={() => { setIsRegister(!isRegister); setError(""); }} className="text-accent-light ml-1 font-medium hover:underline">
                {isRegister ? "立即登录" : "注册账号"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
