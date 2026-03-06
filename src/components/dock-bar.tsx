"use client";

import { usePathname, useRouter } from "next/navigation";
import { Mail, Brain, Calendar, Settings } from "lucide-react";

const dockItems = [
  { path: "/mail", icon: Mail, label: "邮件&订阅" },
  { path: "/decisions", icon: Brain, label: "信息决策" },
  { path: "/calendar", icon: Calendar, label: "日历&待办" },
  { path: "/settings", icon: Settings, label: "设置" },
];

export function DockBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 z-50">
      <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1e293b]/90 backdrop-blur-xl border border-[#334155]/50 shadow-2xl">
        {dockItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <div key={item.path} className="relative flex flex-col items-center group">
              <button
                onClick={() => router.push(item.path)}
                className={`flex items-center justify-center w-[42px] h-[42px] rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#3b82f6]/20 text-[#60a5fa]"
                    : "text-[#64748b] hover:text-[#94a3b8] hover:bg-[#334155]/50"
                }`}
              >
                <Icon size={20} />
              </button>
              {isActive && (
                <div className="absolute -top-2 w-1 h-1 rounded-full bg-[#60a5fa]" />
              )}
              <div className="absolute -top-9 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none transition-all duration-150 bg-[#334155] text-[#e2e8f0] opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
