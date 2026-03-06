"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, PenSquare, Inbox, Send, FileText, Trash2, Archive, ArrowLeft, MailOpen, Star, MoreHorizontal, Paperclip, SendHorizontal, Rss, Menu, X } from "lucide-react";

interface Mail {
  id: string; folder: string; subject: string; senderName: string; senderEmail: string;
  content: string; summary?: string; isRead: boolean; isStarred: boolean; isArchived: boolean; receivedAt: string;
}
interface Subscription {
  id: string; sourceName: string; category: string; title: string;
  summary?: string; content?: string; sourceUrl?: string; publishedAt: string;
}

const folders = [
  { key: "inbox", label: "收件箱", icon: Inbox },
  { key: "sent", label: "已发送", icon: Send },
  { key: "draft", label: "草稿", icon: FileText },
  { key: "spam", label: "垃圾邮件", icon: Trash2 },
];
const subCategories = ["全部", "科技", "设计", "新闻", "博客"];
const catMap: Record<string, string> = { "全部": "all", "科技": "tech", "设计": "design", "新闻": "news", "博客": "blog" };

function getInitials(name: string) { return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2); }
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000); if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  const dy = Math.floor(h / 24); if (dy === 1) return "昨天"; if (dy < 7) return `${dy}天前`;
  return new Date(d).toLocaleDateString("zh-CN");
}
const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#6366f1"];
function getColor(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); return colors[Math.abs(h) % colors.length]; }

type Panel = "list" | "detail" | "rss-list" | "rss-detail";

export default function MailPage() {
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [search, setSearch] = useState("");
  const [mails, setMails] = useState<Mail[]>([]);
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeCat, setActiveCat] = useState("全部");
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [mobilePanel, setMobilePanel] = useState<Panel>("list");
  const [showSidebar, setShowSidebar] = useState(false);

  const fetchMails = useCallback(async () => {
    const p = new URLSearchParams({ folder: activeFolder, search });
    const res = await fetch(`/api/mails?${p}`);
    const data = await res.json();
    if (data.success) { setMails(data.data.mails); setUnreadCount(data.data.unreadCount); }
  }, [activeFolder, search]);

  const fetchSubs = useCallback(async () => {
    const res = await fetch(`/api/subscriptions?category=${catMap[activeCat] || "all"}`);
    const data = await res.json();
    if (data.success) setSubscriptions(data.data);
  }, [activeCat]);

  useEffect(() => { fetchMails(); }, [fetchMails]);
  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  async function markRead(mail: Mail) {
    await fetch(`/api/mails/${mail.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: true }) });
    setSelectedMail({ ...mail, isRead: true }); fetchMails();
  }
  async function handleArchive(id: string) {
    await fetch(`/api/mails/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isArchived: true }) });
    setSelectedMail(null); setMobilePanel("list"); fetchMails();
  }
  async function handleDelete(id: string) {
    await fetch(`/api/mails/${id}`, { method: "DELETE" });
    setSelectedMail(null); setMobilePanel("list"); fetchMails();
  }
  async function handleStar(mail: Mail) {
    await fetch(`/api/mails/${mail.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isStarred: !mail.isStarred }) });
    fetchMails(); if (selectedMail?.id === mail.id) setSelectedMail({ ...mail, isStarred: !mail.isStarred });
  }

  function selectMail(mail: Mail) {
    setSelectedMail(mail); setSelectedSub(null); setMobilePanel("detail");
    if (!mail.isRead) markRead(mail);
  }
  function selectSub(sub: Subscription) {
    setSelectedSub(sub); setSelectedMail(null); setMobilePanel("rss-detail");
  }

  // Shared Components
  const MailListItem = ({ mail }: { mail: Mail }) => (
    <div onClick={() => selectMail(mail)} className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${selectedMail?.id === mail.id ? "bg-accent/5" : "hover:bg-card-hover"}`}>
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: getColor(mail.senderName) }}>
        {getInitials(mail.senderName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm truncate pr-2 ${!mail.isRead ? "font-semibold text-foreground" : "text-foreground/80"}`}>{mail.senderName}</span>
          <span className="text-[11px] flex-shrink-0 text-muted">{timeAgo(mail.receivedAt)}</span>
        </div>
        <p className={`text-xs truncate mb-0.5 ${!mail.isRead ? "text-foreground/90" : "text-muted"}`}>{mail.subject}</p>
        <p className="text-xs text-muted/70 line-clamp-2 leading-relaxed">{mail.content.substring(0, 100)}</p>
      </div>
      <div className="flex flex-col items-center gap-1 pt-1">
        {mail.isStarred && <Star size={12} className="text-warning fill-warning" />}
        {!mail.isRead && <div className="w-2 h-2 rounded-full bg-accent" />}
      </div>
    </div>
  );

  const SubItem = ({ sub }: { sub: Subscription }) => (
    <div onClick={() => selectSub(sub)} className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${selectedSub?.id === sub.id ? "bg-accent/5" : "hover:bg-card-hover"}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 text-[10px] font-bold" style={{ backgroundColor: getColor(sub.sourceName) }}>
        {sub.sourceName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed text-foreground/90 mb-1 line-clamp-2">{sub.title}</p>
        <div className="flex items-center gap-1.5 text-[11px] text-muted">
          <span>{sub.sourceName}</span><span>·</span><span>{timeAgo(sub.publishedAt)}</span>
        </div>
      </div>
    </div>
  );

  // Detail views
  const MailDetail = () => selectedMail ? (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-3 sm:px-6 py-3 border-b border-border flex-wrap">
        <button onClick={() => { setSelectedMail(null); setMobilePanel("list"); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card transition-colors">
          <ArrowLeft size={15} /><span className="hidden sm:inline">返回</span>
        </button>
        <button onClick={() => handleArchive(selectedMail.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card transition-colors">
          <Archive size={15} /><span className="hidden sm:inline">归档</span>
        </button>
        <button onClick={() => handleDelete(selectedMail.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card transition-colors">
          <Trash2 size={15} /><span className="hidden sm:inline">删除</span>
        </button>
        <button onClick={() => markRead(selectedMail)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card transition-colors">
          <MailOpen size={15} /><span className="hidden sm:inline">已读</span>
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card transition-colors">
          <MoreHorizontal size={15} />
        </button>
        <button onClick={() => handleStar(selectedMail)} className="ml-auto px-2 py-1.5 rounded-lg">
          <Star size={15} className={selectedMail.isStarred ? "text-warning fill-warning" : "text-muted"} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5">
        <h1 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">{selectedMail.subject}</h1>
        <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card mb-5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0" style={{ backgroundColor: getColor(selectedMail.senderName) }}>
            {getInitials(selectedMail.senderName)}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-foreground">{selectedMail.senderName}</span>
            <p className="text-xs text-muted truncate">{selectedMail.senderEmail}</p>
          </div>
          <span className="text-xs text-muted hidden sm:block">{timeAgo(selectedMail.receivedAt)}</span>
        </div>
        <div className="rounded-xl bg-card p-4 sm:p-6">
          <div className="text-sm leading-7 whitespace-pre-line text-foreground/80">{selectedMail.content}</div>
        </div>
      </div>
      <div className="px-4 sm:px-8 py-3 border-t border-border">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card">
          <input type="text" placeholder={`回复 ${selectedMail.senderName}...`} className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted/50" />
          <button className="text-muted hover:text-foreground"><Paperclip size={15} /></button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white"><SendHorizontal size={13} />发送</button>
        </div>
      </div>
    </div>
  ) : null;

  const RssDetail = () => selectedSub ? (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-3 sm:px-6 py-3 border-b border-border">
        <button onClick={() => { setSelectedSub(null); setMobilePanel("rss-list"); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card transition-colors">
          <ArrowLeft size={15} /><span>返回</span>
        </button>
        {selectedSub.sourceUrl && (
          <a href={selectedSub.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-auto px-3 py-1.5 rounded-lg text-xs text-accent-light hover:bg-card transition-colors">查看原文 →</a>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5">
        <h1 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">{selectedSub.title}</h1>
        <div className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-card mb-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 text-xs font-bold" style={{ backgroundColor: getColor(selectedSub.sourceName) }}>
            {selectedSub.sourceName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-semibold text-foreground">{selectedSub.sourceName}</span>
            <p className="text-xs text-muted">{timeAgo(selectedSub.publishedAt)}</p>
          </div>
        </div>
        <div className="rounded-xl bg-card p-4 sm:p-6">
          <div className="text-sm leading-7 whitespace-pre-line text-foreground/80">{selectedSub.content || selectedSub.summary || selectedSub.title}</div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* === DESKTOP: 3-column layout (lg+) === */}

      {/* Left: Mail sidebar */}
      <div className="hidden lg:flex w-[300px] flex-shrink-0 border-r border-border flex-col bg-card/30">
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted">邮件</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium text-accent-light bg-accent/10">{unreadCount}</span>
          </div>
          <div className="relative">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索邮件..." className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-background border border-border text-foreground outline-none focus:border-accent transition-colors placeholder:text-muted/50" />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium bg-accent text-white hover:bg-accent/90 shadow-sm shadow-accent/20">
            <PenSquare size={14} />撰写邮件
          </button>
        </div>
        <div className="px-2 mb-1">
          {folders.map(f => {
            const Icon = f.icon;
            return (
              <button key={f.key} onClick={() => { setActiveFolder(f.key); setSelectedMail(null); }} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors mb-0.5 ${activeFolder === f.key ? "text-accent-light bg-accent/10 font-medium" : "text-muted hover:text-foreground hover:bg-card-hover"}`}>
                <Icon size={14} />{f.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto">{mails.map(m => <MailListItem key={m.id} mail={m} />)}{mails.length === 0 && <p className="text-xs text-muted text-center py-8">暂无邮件</p>}</div>
      </div>

      {/* Center: Detail */}
      <div className="hidden lg:flex flex-1 flex-col min-w-0">
        {selectedMail ? <MailDetail /> : selectedSub ? <RssDetail /> : (
          <div className="flex-1 flex items-center justify-center"><p className="text-sm text-muted">选择一封邮件或订阅内容查看</p></div>
        )}
      </div>

      {/* Right: Subscriptions */}
      <div className="hidden lg:flex w-[320px] flex-shrink-0 border-l border-border flex-col bg-card/30">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3"><Rss size={14} className="text-accent-light" /><h2 className="text-sm font-semibold text-foreground">我的订阅</h2></div>
          <div className="flex gap-1.5 flex-wrap">
            {subCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)} className={`px-2.5 py-1 rounded-full text-xs transition-colors ${activeCat === cat ? "bg-accent/20 text-accent-light font-medium" : "text-muted hover:text-foreground bg-card"}`}>{cat}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{subscriptions.map(s => <SubItem key={s.id} sub={s} />)}{subscriptions.length === 0 && <p className="text-xs text-muted text-center py-8">暂无订阅</p>}</div>
      </div>

      {/* === MOBILE: panel-based layout (< lg) === */}
      <div className="flex lg:hidden flex-1 flex-col min-w-0">
        {/* Top tabs */}
        {(mobilePanel === "list" || mobilePanel === "rss-list") && (
          <div className="flex border-b border-border">
            <button onClick={() => setMobilePanel("list")} className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${mobilePanel === "list" ? "text-accent-light border-b-2 border-accent" : "text-muted"}`}>邮件</button>
            <button onClick={() => setMobilePanel("rss-list")} className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${mobilePanel === "rss-list" ? "text-accent-light border-b-2 border-accent" : "text-muted"}`}>订阅</button>
            <button onClick={() => setShowSidebar(true)} className="px-4 py-3 text-muted"><Menu size={18} /></button>
          </div>
        )}

        {/* Mail list (mobile) */}
        {mobilePanel === "list" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3">
              <div className="relative">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索邮件..." className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-card border border-border text-foreground outline-none focus:border-accent placeholder:text-muted/50" />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">{mails.map(m => <MailListItem key={m.id} mail={m} />)}</div>
          </div>
        )}

        {/* RSS list (mobile) */}
        {mobilePanel === "rss-list" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 flex gap-1.5 flex-wrap">
              {subCategories.map(cat => (
                <button key={cat} onClick={() => setActiveCat(cat)} className={`px-2.5 py-1 rounded-full text-xs transition-colors ${activeCat === cat ? "bg-accent/20 text-accent-light" : "text-muted bg-card"}`}>{cat}</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">{subscriptions.map(s => <SubItem key={s.id} sub={s} />)}</div>
          </div>
        )}

        {/* Mail detail (mobile) */}
        {mobilePanel === "detail" && <MailDetail />}

        {/* RSS detail (mobile) */}
        {mobilePanel === "rss-detail" && <RssDetail />}
      </div>

      {/* Mobile sidebar drawer */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowSidebar(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">文件夹</h2>
              <button onClick={() => setShowSidebar(false)} className="text-muted"><X size={18} /></button>
            </div>
            {folders.map(f => {
              const Icon = f.icon;
              return (
                <button key={f.key} onClick={() => { setActiveFolder(f.key); setShowSidebar(false); setSelectedMail(null); setMobilePanel("list"); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mb-1 transition-colors ${activeFolder === f.key ? "text-accent-light bg-accent/10" : "text-muted hover:bg-card-hover"}`}>
                  <Icon size={16} />{f.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
