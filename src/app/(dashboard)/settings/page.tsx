"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, User, Bell, Palette, Shield, Globe, ChevronRight, LogOut, Upload, X, Image as ImageIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "@/components/theme-provider";

interface UserSettings {
  theme: string;
  locale: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklySummary: boolean;
  backgroundImage: string | null;
}

const settingItems = [
  { key: "account", label: "账户信息", desc: "管理你的个人信息和登录方式", icon: User, color: "#3b82f6" },
  { key: "notifications", label: "通知设置", desc: "控制邮件和应用通知偏好", icon: Bell, color: "#f59e0b" },
  { key: "appearance", label: "外观主题", desc: "自定义界面颜色和背景壁纸", icon: Palette, color: "#8b5cf6" },
  { key: "privacy", label: "隐私安全", desc: "管理密码和账户安全设置", icon: Shield, color: "#22c55e" },
  { key: "language", label: "语言地区", desc: "设置显示语言和时区", icon: Globe, color: "#ec4899" },
];

export default function SettingsPage() {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [ticktickStatus, setTicktickStatus] = useState<{ connected: boolean } | null>(null);
  const { setTheme, setBackgroundImage } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => { if (d.success) setSettings(d.data); });
    fetch("/api/integrations/ticktick/status").then((r) => r.json()).then((d) => { if (d.success) setTicktickStatus(d.data); });
  }, []);

  async function updateSetting(key: string, value: unknown) {
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    const data = await res.json();
    if (data.success) {
      setSettings(data.data);
      if (key === "theme") setTheme(value as "light" | "dark" | "system");
      if (key === "backgroundImage") setBackgroundImage(value as string | null);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg("");
    setPwdLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      setPwdMsg(data.success ? "密码修改成功" : data.message);
      if (data.success) { setCurrentPwd(""); setNewPwd(""); }
    } catch { setPwdMsg("操作失败"); }
    setPwdLoading(false);
  }

  async function handleUploadBg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.success) {
        await updateSetting("backgroundImage", data.data.url);
      }
    } catch { /* ignore */ }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function connectTickTick() {
    const res = await fetch("/api/integrations/ticktick/connect", { method: "POST" });
    const data = await res.json();
    if (data.success && data.data.authUrl) window.location.href = data.data.authUrl;
  }

  const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl bg-background border border-border text-foreground outline-none focus:border-accent";

  if (activePanel) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex-1 flex items-center justify-center p-12 overflow-y-auto">
          <div className="w-full max-w-[520px] rounded-2xl bg-card border border-border p-8 my-auto">
            <button onClick={() => setActivePanel(null)} className="text-xs text-accent-light hover:underline mb-4 block">&larr; 返回设置</button>

            {activePanel === "account" && (
              <div>
                <h2 className="text-lg font-semibold mb-6 text-foreground">账户信息</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">显示名称</label>
                    <input className={inputCls} defaultValue="Demo User" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">邮箱</label>
                    <input className={inputCls} defaultValue="demo@example.com" readOnly />
                  </div>
                </div>
              </div>
            )}

            {activePanel === "notifications" && settings && (
              <div>
                <h2 className="text-lg font-semibold mb-6 text-foreground">通知设置</h2>
                <div className="space-y-4">
                  {[
                    { key: "emailNotifications", label: "邮件通知", desc: "接收重要邮件提醒" },
                    { key: "pushNotifications", label: "推送通知", desc: "浏览器推送通知" },
                    { key: "weeklySummary", label: "每周摘要", desc: "每周发送活动总结" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-background">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => updateSetting(item.key, !(settings as unknown as Record<string, unknown>)[item.key])}
                        className={`w-10 h-6 rounded-full transition-colors relative ${(settings as unknown as Record<string, unknown>)[item.key] ? "bg-accent" : "bg-border"}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${(settings as unknown as Record<string, unknown>)[item.key] ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePanel === "appearance" && settings && (
              <div>
                <h2 className="text-lg font-semibold mb-6 text-foreground">外观主题</h2>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateSetting("theme", t)}
                      className={`p-4 rounded-xl border text-center transition-colors ${settings.theme === t ? "border-accent bg-accent/10" : "border-border bg-background hover:bg-card-hover"}`}
                    >
                      <p className="text-sm font-medium text-foreground">{t === "light" ? "浅色" : t === "dark" ? "深色" : "跟随系统"}</p>
                    </button>
                  ))}
                </div>

                <h3 className="text-sm font-semibold mb-3 text-foreground">自定义背景壁纸</h3>
                {settings.backgroundImage ? (
                  <div className="relative rounded-xl overflow-hidden mb-3 border border-border">
                    <img src={settings.backgroundImage} alt="背景" className="w-full h-32 object-cover" />
                    <button
                      onClick={() => updateSetting("backgroundImage", null)}
                      className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-white hover:bg-black/80"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-border p-8 text-center mb-3">
                    <ImageIcon size={24} className="mx-auto mb-2 text-muted" />
                    <p className="text-xs text-muted">暂无自定义背景</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadBg} className="hidden" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Upload size={14} />
                  {uploading ? "上传中..." : "上传背景图片"}
                </button>
                <p className="text-xs text-muted mt-2">支持 JPG/PNG/WebP/GIF，最大 5MB，图片会自适应浏览器窗口大小</p>
              </div>
            )}

            {activePanel === "privacy" && (
              <div>
                <h2 className="text-lg font-semibold mb-6 text-foreground">隐私安全</h2>
                <form onSubmit={handleChangePassword} className="space-y-4 mb-6">
                  <h3 className="text-sm font-semibold text-foreground">修改密码</h3>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">当前密码</label>
                    <input type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className={inputCls} placeholder="输入当前密码" required />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">新密码</label>
                    <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className={inputCls} placeholder="至少6个字符" required minLength={6} />
                  </div>
                  {pwdMsg && <p className={`text-xs ${pwdMsg.includes("成功") ? "text-success" : "text-danger"}`}>{pwdMsg}</p>}
                  <button type="submit" disabled={pwdLoading} className="w-full py-2.5 rounded-xl text-sm font-medium bg-accent text-white hover:opacity-90 disabled:opacity-50">
                    {pwdLoading ? "处理中..." : "确认修改"}
                  </button>
                </form>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-background">
                    <p className="text-sm font-medium text-foreground">两步验证</p>
                    <p className="text-xs text-muted mt-0.5">Phase 2 功能，敬请期待</p>
                  </div>
                  <div className="p-4 rounded-xl bg-background">
                    <p className="text-sm font-medium text-foreground">登录记录</p>
                    <p className="text-xs text-muted mt-0.5">Phase 2 功能，敬请期待</p>
                  </div>
                </div>
              </div>
            )}

            {activePanel === "language" && settings && (
              <div>
                <h2 className="text-lg font-semibold mb-6 text-foreground">语言地区</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">显示语言</label>
                    <select value={settings.locale} onChange={(e) => updateSetting("locale", e.target.value)} className={inputCls}>
                      <option value="zh-CN">简体中文</option>
                      <option value="en-US">English (US)</option>
                      <option value="ja-JP">日本語</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1.5">时区</label>
                    <select value={settings.timezone} onChange={(e) => updateSetting("timezone", e.target.value)} className={inputCls}>
                      <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                      <option value="America/New_York">America/New_York (UTC-5)</option>
                      <option value="Europe/London">Europe/London (UTC+0)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activePanel === "ticktick" && (
              <div>
                <h2 className="text-lg font-semibold mb-6 text-foreground">滴答清单接入</h2>
                <div className="p-4 rounded-xl bg-background mb-4">
                  <p className="text-sm font-medium text-foreground mb-1">连接状态</p>
                  <p className="text-xs text-muted">{ticktickStatus?.connected ? "已连接" : "未连接"}</p>
                </div>
                {!ticktickStatus?.connected && (
                  <button onClick={connectTickTick} className="w-full py-2.5 rounded-xl text-sm font-medium bg-accent text-white hover:opacity-90">连接滴答清单</button>
                )}
                <p className="text-xs text-muted mt-3">需要先在 TickTick Developer 平台申请 OAuth 应用，并在 .env 中配置 Client ID 和 Secret。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-full max-w-[520px] rounded-2xl bg-card border border-border p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Settings size={18} className="text-accent-light" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">设置</h2>
              <p className="text-xs text-muted">管理你的应用偏好</p>
            </div>
          </div>

          <div className="space-y-2">
            {settingItems.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.key} onClick={() => setActivePanel(item.key)} className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-colors hover:bg-card-hover">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}20` }}>
                    <Icon size={16} style={{ color: item.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs mt-0.5 text-muted">{item.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-muted" />
                </button>
              );
            })}
            <button onClick={() => setActivePanel("ticktick")} className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-colors hover:bg-card-hover">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#4285f4]/20">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#4285f4"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">滴答清单</p>
                <p className="text-xs mt-0.5 text-muted">{ticktickStatus?.connected ? "已连接 - 点击管理" : "连接滴答清单同步待办和日历"}</p>
              </div>
              <ChevronRight size={14} className="text-muted" />
            </button>
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-colors hover:bg-[#ef4444]/10">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#ef4444]/20">
                <LogOut size={16} className="text-[#ef4444]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#ef4444]">退出登录</p>
              </div>
            </button>
          </div>
          <p className="text-xs text-center mt-8 text-muted">Personal Dashboard v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
