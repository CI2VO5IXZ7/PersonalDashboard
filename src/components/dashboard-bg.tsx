"use client";

import { useTheme } from "@/components/theme-provider";

export function DashboardBg({ children }: { children: React.ReactNode }) {
  const { backgroundImage } = useTheme();

  return (
    <div className="min-h-screen pb-24 relative">
      {backgroundImage && (
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
        </div>
      )}
      <div className={`relative z-10 ${!backgroundImage ? "bg-background" : ""}`}>
        {children}
      </div>
    </div>
  );
}
