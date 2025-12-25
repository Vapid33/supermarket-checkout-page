"use client"

import { cn } from "@/lib/utils"
import { ShoppingCart, Receipt, BarChart3, Settings, Store } from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const menuItems = [
  { id: "cashier", label: "收银台", icon: ShoppingCart },
  { id: "orders", label: "订单记录", icon: Receipt },
  { id: "stats", label: "营业统计", icon: BarChart3 },
  { id: "settings", label: "设置", icon: Settings },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-20 lg:w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-semibold text-foreground">智慧超市</h1>
            <p className="text-xs text-muted-foreground">POS收银系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all",
              "hover:bg-accent",
              activeTab === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground",
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="hidden lg:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-accent-foreground">张</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-foreground">张小明</p>
            <p className="text-xs text-muted-foreground">收银员</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
