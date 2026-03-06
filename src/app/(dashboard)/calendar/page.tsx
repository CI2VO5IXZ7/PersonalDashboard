"use client";

import { useState } from "react";
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Clock, Plus, ListChecks, CheckCircle2, Flag } from "lucide-react";

interface CalEvent { id: string; title: string; date: string; time: string; color: string; }
interface Task { id: string; title: string; time?: string; done: boolean; priority: "high" | "medium" | "low"; }

const DAYS = ["日", "一", "二", "三", "四", "五", "六"];
const sampleEvents: CalEvent[] = [
  { id: "1", title: "产品评审会议", date: "2025-01-08", time: "10:00", color: "#3b82f6" },
  { id: "2", title: "投资人沟通", date: "2025-01-15", time: "16:00", color: "#ef4444" },
  { id: "3", title: "团队周会", date: "2025-01-18", time: "14:00", color: "#22c55e" },
  { id: "4", title: "设计系统评审", date: "2025-01-22", time: "11:00", color: "#8b5cf6" },
  { id: "5", title: "路线图沟通", date: "2025-01-25", time: "15:00", color: "#f59e0b" },
];
const initTasks: Task[] = [
  { id: "1", title: "完成 Q4 设计评审文档", time: "17:00", done: false, priority: "high" },
  { id: "2", title: "更新 API 文档至 v3.0", done: false, priority: "medium" },
  { id: "3", title: "安排投资人会议", done: false, priority: "high" },
  { id: "4", title: "代码审查 - 新功能分支", time: "14:00", done: false, priority: "medium" },
  { id: "5", title: "整理本周工作周报", done: true, priority: "low" },
  { id: "6", title: "更新团队 OKR 追踪表", done: false, priority: "low" },
  { id: "7", title: "安排欧盟市场调研", done: false, priority: "low" },
];
const pColors: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#6b7280" };

export default function CalendarPage() {
  const [cur, setCur] = useState(new Date(2025, 0, 1));
  const [tasks, setTasks] = useState<Task[]>(initTasks);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [tab, setTab] = useState<"calendar" | "tasks">("calendar");

  const y = cur.getFullYear(), m = cur.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  const fd = new Date(y, m, 1).getDay();
  const prev = () => setCur(new Date(y, m - 1, 1));
  const next = () => setCur(new Date(y, m + 1, 1));
  const toggle = (id: string) => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const ft = tasks.filter(t => filter === "pending" ? !t.done : filter === "done" ? t.done : true);
  const doneC = tasks.filter(t => t.done).length;
  const totalC = tasks.length;
  const eventDays = new Set(sampleEvents.filter(e => { const d = new Date(e.date); return d.getFullYear() === y && d.getMonth() === m; }).map(e => new Date(e.date).getDate()));

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 sm:px-8 lg:px-10 py-4 sm:py-5 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
          <CalIcon size={18} className="text-accent-light" />
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-semibold text-foreground">日历 & 待办</h1>
          <p className="text-xs text-muted">{y}年{m + 1}月 · {totalC - doneC}项待完成</p>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="flex lg:hidden border-b border-border">
        <button onClick={() => setTab("calendar")} className={`flex-1 py-3 text-sm font-medium text-center ${tab === "calendar" ? "text-accent-light border-b-2 border-accent" : "text-muted"}`}>日历</button>
        <button onClick={() => setTab("tasks")} className={`flex-1 py-3 text-sm font-medium text-center ${tab === "tasks" ? "text-accent-light border-b-2 border-accent" : "text-muted"}`}>任务 ({totalC - doneC})</button>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Calendar + Upcoming */}
        <div className={`lg:w-[560px] lg:flex-shrink-0 overflow-y-auto pb-24 px-4 sm:px-6 pt-4 ${tab === "tasks" ? "hidden lg:block" : "flex-1"}`}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-foreground">{y}年{m + 1}月</h2>
              <div className="flex gap-1">
                <button onClick={prev} className="p-2 rounded-xl hover:bg-card text-muted"><ChevronLeft size={16} /></button>
                <button onClick={next} className="p-2 rounded-xl hover:bg-card text-muted"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => <div key={d} className="text-center text-xs py-2 font-medium text-muted">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: fd }).map((_, i) => <div key={`e${i}`} className="h-10 sm:h-11" />)}
              {Array.from({ length: dim }).map((_, i) => {
                const day = i + 1;
                const isToday = day === 8 && m === 0 && y === 2025;
                const has = eventDays.has(day);
                return (
                  <button key={day} className={`relative flex flex-col items-center justify-center rounded-xl py-1.5 h-10 sm:h-11 transition-all ${isToday ? "bg-accent text-white shadow-md shadow-accent/30" : "text-foreground hover:bg-card"}`}>
                    <span className="text-sm leading-none">{day}</span>
                    {has && <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isToday ? "bg-white" : "bg-accent-light"}`} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">即将到来</p>
            <div className="space-y-2">
              {sampleEvents.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-transparent hover:border-border transition-colors">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: ev.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{ev.title}</p>
                    <div className="flex items-center gap-1 mt-0.5"><Clock size={10} className="text-muted" /><p className="text-xs text-muted">{new Date(ev.date).getMonth() + 1}月{new Date(ev.date).getDate()}日 · {ev.time}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tasks */}
        <div className={`lg:flex-1 lg:border-l lg:border-border overflow-y-auto pb-24 px-4 sm:px-6 pt-4 ${tab === "calendar" ? "hidden lg:block" : "flex-1"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListChecks size={15} className="text-accent-light" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">任务清单</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-accent text-white hover:bg-accent/90 shadow-sm shadow-accent/20">
              <Plus size={13} />新建任务
            </button>
          </div>

          <div className="flex gap-1.5 mb-4 flex-wrap">
            {([["all", `全部 ${totalC}`], ["pending", `待完成 ${totalC - doneC}`], ["done", `已完成 ${doneC}`]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setFilter(k)} className={`px-3 py-1.5 rounded-full text-xs transition-colors ${filter === k ? "bg-accent/20 text-accent-light font-medium" : "text-muted bg-card"}`}>{l}</button>
            ))}
          </div>

          <div className="mb-4">
            <div className="w-full rounded-full h-1.5 bg-card"><div className="h-1.5 rounded-full bg-accent transition-all duration-500" style={{ width: `${totalC > 0 ? (doneC / totalC) * 100 : 0}%` }} /></div>
            <p className="text-xs mt-1.5 text-muted">{doneC}/{totalC}已完成</p>
          </div>

          <div className="space-y-2">
            {ft.map(t => (
              <div key={t.id} onClick={() => toggle(t.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all border border-transparent hover:border-border ${t.done ? "bg-card/50 opacity-60" : "bg-card hover:bg-card-hover"}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${t.done ? "border-success bg-success/20" : "border-accent"}`}>
                  {t.done && <CheckCircle2 size={12} className="text-success" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${t.done ? "line-through text-muted" : "text-foreground"}`}>{t.title}</p>
                  {t.time && <div className="flex items-center gap-1 mt-0.5"><Clock size={10} className="text-muted" /><span className="text-xs text-muted">{t.time}</span></div>}
                </div>
                <Flag size={13} style={{ color: pColors[t.priority] }} className="flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
