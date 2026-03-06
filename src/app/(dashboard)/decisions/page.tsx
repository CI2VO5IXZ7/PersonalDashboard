"use client";

import { useState, useEffect, useCallback } from "react";
import { Brain, RefreshCw, AlertTriangle, ListChecks, Plus, X, Clock, CheckCircle2 } from "lucide-react";

interface DecisionItem {
  id: string;
  sourceType: string;
  title: string;
  summary?: string;
  priority: "urgent" | "important" | "normal";
  status: "pending" | "converted" | "dismissed";
  tags: string[];
  senderInitials?: string;
  receivedAt?: string;
}

interface TodoItem {
  id: string;
  title: string;
  time?: string;
  done: boolean;
}

const priorityConfig = {
  urgent: { label: "紧急", color: "text-[#ef4444]", bg: "bg-[#ef4444]/10" },
  important: { label: "重要", color: "text-[#f59e0b]", bg: "bg-[#f59e0b]/10" },
  normal: { label: "普通", color: "text-[#6b7280]", bg: "bg-[#6b7280]/10" },
};

const avatarColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#6366f1"];
function getColor(s: string) {
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function timeLabel(dateStr?: string) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 24) return `${new Date(dateStr).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [analysisSummary, setAnalysisSummary] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [todayTodos, setTodayTodos] = useState<TodoItem[]>([
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
      if (data.success) {
        setAnalysisSummary(data.data.summary);
        fetchDecisions();
      }
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleAddToTask(id: string) {
    await fetch(`/api/decisions/${id}/add-to-task`, { method: "POST" });
    fetchDecisions();
  }

  async function handleDismiss(id: string) {
    await fetch(`/api/decisions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "dismissed" }),
    });
    fetchDecisions();
  }

  function toggleTodo(id: string) {
    setTodayTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }

  const pendingDecisions = decisions.filter((d) => d.status === "pending");
  const completedTodos = todayTodos.filter((t) => t.done).length;
  const totalTodos = todayTodos.length;
  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const defaultSummary = analysisSummary ||
    `从你的邮件中，AI 识别出${pendingDecisions.filter(d => d.priority === "urgent").length}项紧急事项、${pendingDecisions.filter(d => d.priority === "important").length}项重要事项和${pendingDecisions.filter(d => d.priority === "normal").length}项普通事项。`;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
            <Brain size={18} className="text-accent-light" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-foreground">信息决策中心</h1>
            <p className="text-xs text-muted">AI 已扫描你的邮件，以下事项需要你关注</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-[#22c55e]/10 text-[#22c55e]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            AI 已同步
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-card hover:bg-card-hover text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={analyzing ? "animate-spin" : ""} />
            重新分析
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden px-6 gap-6">
        {/* Left - Decisions */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* AI Summary */}
          <div className="mx-2 mb-4 p-4 rounded-2xl bg-accent/5 border border-accent/20 flex items-start gap-3">
            <AlertTriangle size={16} className="text-accent-light mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1 text-foreground">AI 分析摘要</p>
              <p className="text-xs leading-relaxed text-muted">{defaultSummary}</p>
            </div>
          </div>

          {/* Decision Items Header */}
          <div className="flex items-center justify-between px-2 mb-3">
            <div className="flex items-center gap-2">
              <ListChecks size={14} className="text-accent-light" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">待决策事项</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium text-accent-light bg-accent/10">{pendingDecisions.length}</span>
            </div>
          </div>

          {/* Decision Cards */}
          <div className="space-y-3 px-2">
            {pendingDecisions.map((d) => {
              const pCfg = priorityConfig[d.priority];
              return (
                <div key={d.id} className="rounded-xl p-4 bg-card border border-border hover:border-border/80 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {d.senderInitials && (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0 text-[11px] font-semibold"
                          style={{ backgroundColor: getColor(d.senderInitials) }}
                        >
                          {d.senderInitials}
                        </div>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${pCfg.color} ${pCfg.bg}`}>
                        {pCfg.label}
                      </span>
                      {d.receivedAt && (
                        <span className="text-xs flex-shrink-0 flex items-center gap-1 text-muted">
                          <Clock size={10} />
                          {timeLabel(d.receivedAt)}
                        </span>
                      )}
                    </div>
                    <button onClick={() => handleDismiss(d.id)} className="flex-shrink-0 p-1 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-semibold mb-1.5 leading-snug text-foreground">{d.title}</p>
                  {d.summary && <p className="text-xs leading-relaxed mb-3 text-muted">{d.summary}</p>}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-1.5 flex-wrap">
                      {d.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-card-hover text-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleAddToTask(d.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 text-accent-light hover:bg-accent/10 transition-all"
                    >
                      <Plus size={11} />加入待办
                    </button>
                  </div>
                </div>
              );
            })}
            {pendingDecisions.length === 0 && (
              <p className="text-sm text-muted text-center py-12">暂无待决策事项，点击"重新分析"扫描邮件</p>
            )}
          </div>
        </div>

        {/* Right - Today's Tasks */}
        <div className="w-[360px] flex-shrink-0 overflow-y-auto pb-24">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListChecks size={14} className="text-accent-light" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">今日待办</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium text-accent-light bg-accent/10">
                {totalTodos - completedTodos}待完成
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>完成率</span>
              <span className="font-semibold text-foreground">{completionRate}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-5">
            <div className="w-full rounded-full h-1.5 bg-card">
              <div className="h-1.5 rounded-full bg-accent transition-all duration-500" style={{ width: `${completionRate}%` }} />
            </div>
          </div>

          {/* In Progress */}
          <p className="text-xs font-medium mb-2 uppercase tracking-wider text-muted">进行中</p>
          <div className="flex flex-col gap-2 mb-4">
            {todayTodos.filter((t) => !t.done).map((todo) => (
              <div
                key={todo.id}
                onClick={() => toggleTodo(todo.id)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card hover:bg-card-hover cursor-pointer transition-all"
              >
                <div className="w-5 h-5 rounded-full border-2 border-accent flex-shrink-0 flex items-center justify-center" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug text-foreground">{todo.title}</p>
                  {todo.time && (
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted">
                      <Clock size={10} />
                      {todo.time}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Completed */}
          {todayTodos.some((t) => t.done) && (
            <>
              <p className="text-xs font-medium mb-2 uppercase tracking-wider text-muted">已完成 ({completedTodos})</p>
              <div className="flex flex-col gap-2">
                {todayTodos.filter((t) => t.done).map((todo) => (
                  <div
                    key={todo.id}
                    onClick={() => toggleTodo(todo.id)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card/50 cursor-pointer transition-all opacity-60"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-success bg-success/20 flex-shrink-0 flex items-center justify-center">
                      <CheckCircle2 size={12} className="text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug text-foreground line-through">{todo.title}</p>
                      {todo.time && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-muted">
                          <Clock size={10} />
                          {todo.time}
                        </div>
                      )}
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
