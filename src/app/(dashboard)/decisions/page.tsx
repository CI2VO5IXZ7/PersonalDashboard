"use client";

import { useState, useEffect, useCallback } from "react";
import { Brain, RefreshCw, AlertTriangle, ListChecks, Plus, X, Clock, CheckCircle2 } from "lucide-react";

interface DecisionItem {
  id: string; sourceType: string; title: string; summary?: string;
  priority: "urgent" | "important" | "normal"; status: "pending" | "converted" | "dismissed";
  tags: string[]; senderInitials?: string; receivedAt?: string;
}
interface TodoItem { id: string; title: string; time?: string; done: boolean; }

const pCfg = {
  urgent: { label: "紧急", cls: "text-[#ef4444] bg-[#ef4444]/10" },
  important: { label: "重要", cls: "text-[#f59e0b] bg-[#f59e0b]/10" },
  normal: { label: "普通", cls: "text-[#6b7280] bg-[#6b7280]/10" },
};
const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#6366f1"];
function getColor(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h); return colors[Math.abs(h) % colors.length]; }
function timeLabel(d?: string) { if (!d) return ""; return new Date(d).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }); }

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [summary, setSummary] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [tab, setTab] = useState<"decisions" | "todos">("decisions");
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: "1", title: "完成设计系统颜色令牌评审", time: "17:00", done: false },
    { id: "2", title: "团队周会 - 准备议程", time: "14:00", done: false },
    { id: "3", title: "更新团队 OKR 追踪表", time: "16:00", done: false },
    { id: "4", title: "整理本周工作周报", time: "18:00", done: true },
  ]);

  const fetchDecisions = useCallback(async () => {
    const res = await fetch("/api/decisions?status=pending");
    const data = await res.json();
    if (data.success) setDecisions(data.data);
  }, []);
  useEffect(() => { fetchDecisions(); }, [fetchDecisions]);

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/decisions/analyze", { method: "POST" });
      const data = await res.json();
      if (data.success) { setSummary(data.data.summary); fetchDecisions(); }
    } finally { setAnalyzing(false); }
  }
  async function addToTask(id: string) { await fetch(`/api/decisions/${id}/add-to-task`, { method: "POST" }); fetchDecisions(); }
  async function dismiss(id: string) { await fetch(`/api/decisions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "dismissed" }) }); fetchDecisions(); }
  function toggleTodo(id: string) { setTodos(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t)); }

  const pending = decisions.filter(d => d.status === "pending");
  const done = todos.filter(t => t.done).length;
  const total = todos.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const defaultSummary = summary || `识别出${pending.filter(d => d.priority === "urgent").length}项紧急、${pending.filter(d => d.priority === "important").length}项重要、${pending.filter(d => d.priority === "normal").length}项普通事项。`;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-10 py-4 sm:py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
            <Brain size={18} className="text-accent-light" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-foreground truncate">信息决策中心</h1>
            <p className="text-xs text-muted hidden sm:block">AI 已扫描你的邮件，以下事项需要你关注</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-success/10 text-success">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />AI 已同步
          </div>
          <button onClick={handleAnalyze} disabled={analyzing} className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-medium bg-card hover:bg-card-hover text-foreground transition-colors disabled:opacity-50 border border-border">
            <RefreshCw size={13} className={analyzing ? "animate-spin" : ""} /><span className="hidden sm:inline">重新分析</span>
          </button>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex lg:hidden border-b border-border">
        <button onClick={() => setTab("decisions")} className={`flex-1 py-3 text-sm font-medium text-center ${tab === "decisions" ? "text-accent-light border-b-2 border-accent" : "text-muted"}`}>
          待决策 ({pending.length})
        </button>
        <button onClick={() => setTab("todos")} className={`flex-1 py-3 text-sm font-medium text-center ${tab === "todos" ? "text-accent-light border-b-2 border-accent" : "text-muted"}`}>
          今日待办 ({total - done})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Decisions */}
        <div className={`flex-1 overflow-y-auto pb-24 px-4 sm:px-6 lg:px-8 pt-4 ${tab === "todos" ? "hidden lg:block" : ""}`}>
          {/* AI Summary */}
          <div className="mb-4 p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-start gap-3">
            <AlertTriangle size={16} className="text-accent-light mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium mb-1 text-foreground">AI 分析摘要</p>
              <p className="text-xs leading-relaxed text-muted">{defaultSummary}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <ListChecks size={14} className="text-accent-light" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">待决策事项</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium text-accent-light bg-accent/10">{pending.length}</span>
          </div>

          <div className="space-y-3">
            {pending.map(d => {
              const p = pCfg[d.priority];
              return (
                <div key={d.id} className="rounded-2xl p-4 bg-card border border-border hover:border-accent/30 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {d.senderInitials && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0 text-[11px] font-semibold" style={{ backgroundColor: getColor(d.senderInitials) }}>
                          {d.senderInitials}
                        </div>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${p.cls}`}>{p.label}</span>
                      {d.receivedAt && <span className="text-[11px] text-muted flex items-center gap-1"><Clock size={10} />{timeLabel(d.receivedAt)}</span>}
                    </div>
                    <button onClick={() => dismiss(d.id)} className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-card-hover flex-shrink-0"><X size={14} /></button>
                  </div>
                  <p className="text-sm font-semibold mb-1 text-foreground">{d.title}</p>
                  {d.summary && <p className="text-xs leading-relaxed mb-3 text-muted">{d.summary}</p>}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex gap-1.5 flex-wrap">
                      {d.tags.map(tag => <span key={tag} className="px-2 py-0.5 rounded-lg text-[11px] bg-card-hover text-muted">{tag}</span>)}
                    </div>
                    <button onClick={() => addToTask(d.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-accent-light hover:bg-accent/10 transition-all flex-shrink-0">
                      <Plus size={11} />加入待办
                    </button>
                  </div>
                </div>
              );
            })}
            {pending.length === 0 && <p className="text-sm text-muted text-center py-12">暂无待决策事项</p>}
          </div>
        </div>

        {/* Right: Today's Tasks */}
        <div className={`lg:w-[380px] lg:flex-shrink-0 lg:border-l lg:border-border overflow-y-auto pb-24 px-4 sm:px-6 pt-4 ${tab === "decisions" ? "hidden lg:block" : "flex-1"}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListChecks size={14} className="text-accent-light" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">今日待办</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium text-accent-light bg-accent/10">{total - done}待完成</span>
            </div>
            <span className="text-xs font-semibold text-foreground">{pct}%</span>
          </div>

          <div className="w-full rounded-full h-1.5 bg-card mb-5">
            <div className="h-1.5 rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>

          {/* In progress */}
          {todos.filter(t => !t.done).length > 0 && <p className="text-xs font-medium mb-2 uppercase tracking-wider text-muted">进行中</p>}
          <div className="space-y-2 mb-4">
            {todos.filter(t => !t.done).map(t => (
              <div key={t.id} onClick={() => toggleTodo(t.id)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card hover:bg-card-hover cursor-pointer transition-all border border-transparent hover:border-border">
                <div className="w-5 h-5 rounded-full border-2 border-accent flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{t.title}</p>
                  {t.time && <div className="flex items-center gap-1 mt-0.5 text-xs text-muted"><Clock size={10} />{t.time}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Done */}
          {todos.filter(t => t.done).length > 0 && (
            <>
              <p className="text-xs font-medium mb-2 uppercase tracking-wider text-muted">已完成 ({done})</p>
              <div className="space-y-2">
                {todos.filter(t => t.done).map(t => (
                  <div key={t.id} onClick={() => toggleTodo(t.id)} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/50 cursor-pointer opacity-60">
                    <div className="w-5 h-5 rounded-full border-2 border-success bg-success/20 flex-shrink-0 flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-through">{t.title}</p>
                      {t.time && <div className="flex items-center gap-1 mt-0.5 text-xs text-muted"><Clock size={10} />{t.time}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
