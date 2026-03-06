"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        if (!data.success) {
          setError(data.message);
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("邮箱或密码错误");
        setLoading(false);
        return;
      }

      router.push("/mail");
    } catch {
      setError("操作失败，请稍后重试");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
              <path d="M13 8h5" />
              <path d="M13 12h5" />
              <path d="M13 16h5" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Personal Dashboard</h1>
            <p className="text-xs text-muted">个人管理看板</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-background border border-border text-foreground outline-none focus:border-accent transition-colors"
                placeholder="输入你的名称"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-background border border-border text-foreground outline-none focus:border-accent transition-colors"
              placeholder="输入邮箱地址"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-background border border-border text-foreground outline-none focus:border-accent transition-colors"
              placeholder="输入密码"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-accent hover:bg-accent/90 transition-opacity disabled:opacity-50"
          >
            {loading ? "处理中..." : isRegister ? "注册" : "登录"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          {isRegister ? "已有账号？" : "没有账号？"}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            className="text-accent-light ml-1 hover:underline"
          >
            {isRegister ? "立即登录" : "注册账号"}
          </button>
        </p>
      </div>
    </div>
  );
}
