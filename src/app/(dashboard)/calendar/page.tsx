"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus, ListChecks, CheckCircle2, Flag } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  time?: string;
  done: boolean;
  priority: "high" | "medium" | "low";
}

const DAYS = ["日", "一", "二", "三", "四", "五", "六"];

const sampleEvents: CalendarEvent[] = [
  { id: "1", title: "产品评审会议", date: "2025-01-08", time: "10:00", color: "#3b82f6" },
  { id: "2", title: "投资人沟通", date: "2025-01-15", time: "16:00", color: "#ef4444" },
  { id: "3", title: "团队周会", date: "2025-01-18", time: "14:00", color: "#22c55e" },
  { id: "4", title: "设计系统评审", date: "2025-01-22", time: "11:00", color: "#8b5cf6" },
  { id: "5", title: "路线图沟通", date: "2025-01-25", time: "15:00", color: "#f59e0b" },
];

const sampleTasks: Task[] = [
  { id: "1", title: "完成 Q4 设计评审文档", time: "17:00", done: false, priority: "high" },
  { id: "2", title: "更新 API 文档至 v3.0", done: false, priority: "medium" },
  { id: "3", title: "安排投资人会议", done: false, priority: "high" },
  { id: "4", title: "代码审查 - 新功能分支", time: "14:00", done: false, priority: "medium" },
  { id: "5", title: "整理本周工作周报", done: true, priority: "low" },
  { id: "6", title: "更新团队 OKR 追踪表", done: false, priority: "low" },
  { id: "7", title: "安排欧盟市场调研", done: false, priority: "low" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const priorityColors: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#6b7280",
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1));
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  function toggleTask(id: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const completedCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;

  // Check which days have events
  const eventDays = new Set(
    sampleEvents
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .map((e) => new Date(e.date).getDate())
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-10 py-5">
        <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
          <CalendarIcon size={18} className="text-accent-light" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground">日历 & 待办</h1>
          <p className="text-xs text-muted">{year}年{month + 1}月 · {totalCount - completedCount}项待完成</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden px-6 gap-6">
        {/* Left - Calendar + Upcoming */}
        <div className="w-[560px] flex-shrink-0 overflow-y-auto pb-24">
          {/* Month Calendar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-5 px-4">
              <h2 className="text-sm font-semibold text-foreground">{year}年{month + 1}月</h2>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-card transition-colors text-muted">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-card transition-colors text-muted">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2 px-4">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs py-1.5 font-medium text-muted">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 px-4">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === 8 && month === 0 && year === 2025;
                const hasEvent = eventDays.has(day);
                return (
                  <button
                    key={day}
                    className={`relative flex flex-col items-center justify-center rounded-xl py-1.5 transition-all h-10 ${
                      isToday
                        ? "bg-accent text-white"
                        : "text-foreground hover:bg-card"
                    }`}
                  >
                    <span className="text-sm leading-none">{day}</span>
                    {hasEvent && (
                      <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isToday ? "bg-white" : "bg-accent-light"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="px-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">即将到来</span>
            </div>
            <div className="flex flex-col gap-2">
              {sampleEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-card">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={10} className="text-muted" />
                      <p className="text-xs text-muted">
                        {new Date(event.date).getMonth() + 1}月{new Date(event.date).getDate()}日 · {event.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Task List */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Task Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListChecks size={15} className="text-accent-light" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">任务清单</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent text-white hover:opacity-90 transition-opacity">
              <Plus size={13} />新建任务
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-1.5 mb-4">
            {[
              { key: "all" as const, label: `全部 ${totalCount}` },
              { key: "pending" as const, label: `待完成 ${totalCount - completedCount}` },
              { key: "done" as const, label: `已完成 ${completedCount}` },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  filter === f.key ? "bg-accent/20 text-accent-light" : "text-muted bg-card hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="w-full rounded-full h-1.5 bg-card">
              <div
                className="h-1.5 rounded-full bg-accent transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs mt-1.5 text-muted">{completedCount}/{totalCount}已完成</p>
          </div>

          {/* Tasks */}
          <div className="flex flex-col gap-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                  task.done ? "bg-card/50 opacity-60" : "bg-card hover:bg-card-hover"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                  task.done ? "border-success bg-success/20" : "border-accent"
                }`}>
                  {task.done && <CheckCircle2 size={12} className="text-success" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${task.done ? "line-through text-muted" : "text-foreground"}`}>{task.title}</p>
                  {task.time && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={10} className="text-muted" />
                      <span className="text-xs text-muted">{task.time}</span>
                    </div>
                  )}
                </div>
                <Flag size={13} style={{ color: priorityColors[task.priority] }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
