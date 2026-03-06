"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, PenSquare, Inbox, Send, FileText, Trash2, Archive, ArrowLeft, MailOpen, Star, MoreHorizontal, Paperclip, SendHorizontal, Rss } from "lucide-react";

interface Mail {
  id: string;
  folder: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  content: string;
  summary?: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  receivedAt: string;
}

interface Subscription {
  id: string;
  sourceName: string;
  category: string;
  title: string;
  publishedAt: string;
}

const folders = [
  { key: "inbox", label: "收件箱", icon: Inbox },
  { key: "sent", label: "已发送", icon: Send },
  { key: "draft", label: "草稿", icon: FileText },
  { key: "spam", label: "垃圾邮件", icon: Trash2 },
];

const subCategories = ["全部", "科技", "设计", "新闻", "博客"];
const catMap: Record<string, string> = { "全部": "all", "科技": "tech", "设计": "design", "新闻": "news", "博客": "blog" };

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

const avatarColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#6366f1"];
function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function MailPage() {
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [search, setSearch] = useState("");
  const [mails, setMails] = useState<Mail[]>([]);
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeCat, setActiveCat] = useState("全部");

  const fetchMails = useCallback(async () => {
    const params = new URLSearchParams({ folder: activeFolder, search });
    const res = await fetch(`/api/mails?${params}`);
    const data = await res.json();
    if (data.success) {
      setMails(data.data.mails);
      setUnreadCount(data.data.unreadCount);
    }
  }, [activeFolder, search]);

  const fetchSubs = useCallback(async () => {
    const cat = catMap[activeCat] || "all";
    const res = await fetch(`/api/subscriptions?category=${cat}`);
    const data = await res.json();
    if (data.success) setSubscriptions(data.data);
  }, [activeCat]);

  useEffect(() => { fetchMails(); }, [fetchMails]);
  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  async function handleMarkRead(mail: Mail) {
    await fetch(`/api/mails/${mail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    setSelectedMail({ ...mail, isRead: true });
    fetchMails();
  }

  async function handleArchive(id: string) {
    await fetch(`/api/mails/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: true }),
    });
    setSelectedMail(null);
    fetchMails();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/mails/${id}`, { method: "DELETE" });
    setSelectedMail(null);
    fetchMails();
  }

  async function handleStar(mail: Mail) {
    await fetch(`/api/mails/${mail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isStarred: !mail.isStarred }),
    });
    fetchMails();
    if (selectedMail?.id === mail.id) {
      setSelectedMail({ ...mail, isStarred: !mail.isStarred });
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - Mail folders & list */}
      <div className="w-[280px] flex-shrink-0 border-r border-border flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted">邮件</h2>
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium text-accent-light bg-accent/10">
              {unreadCount}
            </span>
          </div>
          <div className="relative mb-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索邮件..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-card border border-border text-foreground outline-none focus:border-accent transition-colors placeholder:text-muted/50"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium bg-accent text-white hover:opacity-90 transition-opacity">
            <PenSquare size={14} />
            撰写邮件
          </button>
        </div>

        <div className="px-2">
          {folders.map((f) => {
            const Icon = f.icon;
            const isActive = activeFolder === f.key;
            return (
              <button
                key={f.key}
                onClick={() => { setActiveFolder(f.key); setSelectedMail(null); }}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-colors mb-0.5 ${
                  isActive ? "text-accent-light bg-accent/10" : "text-muted hover:text-foreground hover:bg-card-hover"
                }`}
              >
                <Icon size={13} />
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto mt-2">
          {mails.map((mail) => (
            <div
              key={mail.id}
              onClick={() => { setSelectedMail(mail); if (!mail.isRead) handleMarkRead(mail); }}
              className={`relative flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
                selectedMail?.id === mail.id ? "bg-card" : "hover:bg-card-hover"
              }`}
            >
              <div
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                style={{ backgroundColor: getColor(mail.senderName) }}
              >
                {getInitials(mail.senderName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm truncate pr-2 text-foreground">{mail.senderName}</span>
                  <span className="text-xs flex-shrink-0 text-muted">{timeAgo(mail.receivedAt)}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs truncate pr-2 text-muted">{mail.subject}</p>
                  {!mail.isRead && <div className="w-2 h-2 rounded-full flex-shrink-0 bg-accent-light" />}
                </div>
                <p className="text-xs leading-relaxed text-[#475569] line-clamp-3">{mail.content.substring(0, 120)}...</p>
              </div>
              {mail.isStarred && <Star size={12} className="flex-shrink-0 text-warning fill-warning" />}
            </div>
          ))}
          {mails.length === 0 && (
            <p className="text-xs text-muted text-center py-8">暂无邮件</p>
          )}
        </div>
      </div>

      {/* Center - Mail detail */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedMail ? (
          <>
            <div className="flex items-center gap-1 px-6 py-3 border-b border-border">
              <button onClick={() => setSelectedMail(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card transition-colors">
                <ArrowLeft size={15} /><span>返回</span>
              </button>
              <button onClick={() => handleArchive(selectedMail.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card transition-colors">
                <Archive size={15} /><span>归档</span>
              </button>
              <button onClick={() => handleDelete(selectedMail.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card transition-colors">
                <Trash2 size={15} /><span>删除</span>
              </button>
              <button onClick={() => handleMarkRead(selectedMail)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card transition-colors">
                <MailOpen size={15} /><span>标记已读</span>
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted hover:text-foreground hover:bg-card transition-colors">
                <MoreHorizontal size={15} /><span>更多</span>
              </button>
              <button onClick={() => handleStar(selectedMail)} className="ml-auto px-2 py-1.5 rounded-lg transition-opacity">
                <Star size={15} className={selectedMail.isStarred ? "text-warning fill-warning" : "text-muted"} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <h1 className="text-xl font-semibold mb-4 leading-tight text-foreground">{selectedMail.subject}</h1>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-card mb-6">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0"
                  style={{ backgroundColor: getColor(selectedMail.senderName) }}
                >
                  {getInitials(selectedMail.senderName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-foreground">{selectedMail.senderName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent-light">Today</span>
                  </div>
                  <p className="text-xs text-muted">{selectedMail.senderEmail}</p>
                </div>
                <span className="text-xs text-muted">{timeAgo(selectedMail.receivedAt)}</span>
              </div>
              <div className="rounded-xl bg-card p-6 mb-4">
                <div className="text-sm leading-7 whitespace-pre-line text-[#94a3b8]">{selectedMail.content}</div>
              </div>
            </div>
            <div className="px-8 py-3 border-t border-border">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card">
                <input
                  type="text"
                  placeholder={`回复 ${selectedMail.senderName}...`}
                  className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted/50"
                />
                <div className="flex items-center gap-2">
                  <button className="text-muted hover:text-foreground"><Paperclip size={15} /></button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white hover:opacity-90 transition-opacity">
                    <SendHorizontal size={13} />发送
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted">选择一封邮件查看详情</p>
          </div>
        )}
      </div>

      {/* Right Sidebar - Subscriptions */}
      <div className="w-[320px] flex-shrink-0 border-l border-border flex flex-col">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Rss size={14} className="text-accent-light" />
            <h2 className="text-sm font-semibold text-foreground">我的订阅</h2>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {subCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                  activeCat === cat ? "bg-accent/20 text-accent-light" : "text-muted hover:text-foreground bg-card"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {subscriptions.map((sub) => (
            <div key={sub.id} className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-card-hover group mx-2">
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-white flex-shrink-0 mt-0.5 text-[8px] font-bold"
                style={{ backgroundColor: getColor(sub.sourceName) }}
              >
                {sub.sourceName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed mb-1 text-[#94a3b8]">{sub.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#475569]">{sub.sourceName}</span>
                  <span className="text-xs text-[#334155]">·</span>
                  <span className="text-xs text-[#475569]">{timeAgo(sub.publishedAt)}</span>
                </div>
              </div>
            </div>
          ))}
          {subscriptions.length === 0 && (
            <p className="text-xs text-muted text-center py-8">暂无订阅内容</p>
          )}
        </div>
      </div>
    </div>
  );
}
