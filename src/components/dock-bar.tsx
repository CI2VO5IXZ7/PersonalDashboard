"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Mail, Brain, Calendar, Settings, Bookmark, Plus, X, ExternalLink, Pencil, icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface DockItemData {
  id: string;
  type: string;
  title: string;
  iconType: string;
  iconValue: string;
  targetPath?: string;
  targetUrl?: string;
  openMode: string;
  sortOrder: number;
  isVisible: boolean;
}

const iconMap: Record<string, LucideIcon> = { mail: Mail, brain: Brain, calendar: Calendar, settings: Settings, bookmark: Bookmark, "external-link": ExternalLink };

function getIcon(iconValue: string): LucideIcon {
  if (iconMap[iconValue]) return iconMap[iconValue];
  const pascalName = iconValue.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("") as keyof typeof icons;
  if (icons[pascalName]) return icons[pascalName] as LucideIcon;
  return Bookmark;
}

export function DockBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [items, setItems] = useState<DockItemData[]>([]);
  const [showAddBookmark, setShowAddBookmark] = useState(false);
  const [showEditIcon, setShowEditIcon] = useState<string | null>(null);
  const [bmTitle, setBmTitle] = useState("");
  const [bmUrl, setBmUrl] = useState("");
  const [editIconValue, setEditIconValue] = useState("");

  const fetchDock = useCallback(async () => {
    try {
      const res = await fetch("/api/dock");
      const data = await res.json();
      if (data.success) setItems(data.data.filter((d: DockItemData) => d.isVisible));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchDock(); }, [fetchDock]);

  async function addBookmark() {
    if (!bmTitle.trim() || !bmUrl.trim()) return;
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: bmTitle, url: bmUrl, isPinnedToDock: true }),
      });
      const data = await res.json();
      if (data.success) {
        setBmTitle(""); setBmUrl(""); setShowAddBookmark(false);
        // Refresh after bookmark creation pins to dock
        await fetch(`/api/bookmarks/${data.data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPinnedToDock: true }),
        });
        fetchDock();
      }
    } catch { /* ignore */ }
  }

  async function handleUpdateIcon(itemId: string) {
    if (!editIconValue.trim()) return;
    await fetch(`/api/dock/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ iconValue: editIconValue }),
    });
    setShowEditIcon(null); setEditIconValue("");
    fetchDock();
  }

  async function removeDockItem(itemId: string) {
    await fetch(`/api/dock/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: false }),
    });
    fetchDock();
  }

  function handleClick(item: DockItemData) {
    if (item.type === "bookmark" && item.targetUrl) {
      if (item.openMode === "newTab") {
        window.open(item.targetUrl, "_blank");
      } else {
        window.location.href = item.targetUrl;
      }
    } else if (item.targetPath) {
      router.push(item.targetPath);
    }
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-4 z-50">
        <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1e293b]/90 backdrop-blur-xl border border-[#334155]/50 shadow-2xl">
          {items.map((item) => {
            const isActive = item.targetPath ? pathname.startsWith(item.targetPath) : false;
            const Icon = getIcon(item.iconValue);
            return (
              <div key={item.id} className="relative flex flex-col items-center group">
                <button
                  onClick={() => handleClick(item)}
                  onContextMenu={(e) => { e.preventDefault(); setShowEditIcon(item.id); setEditIconValue(item.iconValue); }}
                  className={`flex items-center justify-center w-[42px] h-[42px] rounded-xl transition-all duration-200 ${
                    isActive ? "bg-[#3b82f6]/20 text-[#60a5fa]" : "text-[#64748b] hover:text-[#94a3b8] hover:bg-[#334155]/50"
                  }`}
                >
                  <Icon size={20} />
                </button>
                {isActive && <div className="absolute -top-2 w-1 h-1 rounded-full bg-[#60a5fa]" />}
                <div className="absolute -top-9 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none transition-all duration-150 bg-[#334155] text-[#e2e8f0] opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100">
                  {item.title}
                </div>
              </div>
            );
          })}

          {/* Add Bookmark Button */}
          <div className="relative flex flex-col items-center group">
            <button
              onClick={() => setShowAddBookmark(!showAddBookmark)}
              className="flex items-center justify-center w-[42px] h-[42px] rounded-xl transition-all duration-200 text-[#64748b] hover:text-[#94a3b8] hover:bg-[#334155]/50"
            >
              <Plus size={18} />
            </button>
            <div className="absolute -top-9 px-2 py-1 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none transition-all duration-150 bg-[#334155] text-[#e2e8f0] opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100">
              添加书签
            </div>
          </div>
        </div>
      </div>

      {/* Add Bookmark Modal */}
      {showAddBookmark && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowAddBookmark(false)}>
          <div className="w-[360px] rounded-2xl bg-card border border-border p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">添加书签到 Dock</h3>
              <button onClick={() => setShowAddBookmark(false)} className="text-muted hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <input value={bmTitle} onChange={(e) => setBmTitle(e.target.value)} placeholder="书签名称" className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-foreground outline-none focus:border-accent" />
              <input value={bmUrl} onChange={(e) => setBmUrl(e.target.value)} placeholder="https://example.com" className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-foreground outline-none focus:border-accent" />
              <button onClick={addBookmark} className="w-full py-2 rounded-xl text-sm font-medium bg-accent text-white hover:opacity-90">添加</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Icon Modal */}
      {showEditIcon && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowEditIcon(null)}>
          <div className="w-[360px] rounded-2xl bg-card border border-border p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2"><Pencil size={14} />编辑图标</h3>
              <button onClick={() => setShowEditIcon(null)} className="text-muted hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted mb-1">图标名称 (Lucide 图标名)</label>
                <input value={editIconValue} onChange={(e) => setEditIconValue(e.target.value)} placeholder="如: heart, star, globe..." className="w-full px-3 py-2 text-sm rounded-xl bg-background border border-border text-foreground outline-none focus:border-accent" />
                <p className="text-xs text-muted mt-1">
                  浏览图标: <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-accent-light hover:underline">lucide.dev/icons</a>
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleUpdateIcon(showEditIcon)} className="flex-1 py-2 rounded-xl text-sm font-medium bg-accent text-white hover:opacity-90">保存</button>
                {items.find(i => i.id === showEditIcon)?.type === "bookmark" && (
                  <button onClick={() => { removeDockItem(showEditIcon); setShowEditIcon(null); }} className="py-2 px-4 rounded-xl text-sm font-medium bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30">移除</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
