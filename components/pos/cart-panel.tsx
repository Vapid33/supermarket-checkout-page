"use client"

import type { CartItem } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, QrCode, Banknote, CreditCard } from "lucide-react"

interface CartPanelProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
  onCheckout: (method: "cash" | "qrcode" | "card") => void
}

export function CartPanel({ items, onUpdateQuantity, onRemoveItem, onClearCart, onCheckout }: CartPanelProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="w-full lg:w-96 bg-card border-l border-border flex flex-col h-full">
      {/* 标题栏 */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">购物车</h2>
          <p className="text-sm text-muted-foreground">{itemCount} 件商品</p>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearCart} className="text-destructive">
            清空
          </Button>
        )}
      </div>

      {/* 商品列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
              <QrCode className="w-8 h-8" />
            </div>
            <p>购物车为空</p>
            <p className="text-sm">扫码或点击商品添加</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 bg-background rounded-lg flex-shrink-0 overflow-hidden">
                <img
                  // src={`/.jpg?height=48&width=48&query=${encodeURIComponent(item.name)}`}
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground truncate">{item.name}</h4>
                <p className="text-primary font-semibold">${(item.price).toFixed(2)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-transparent"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                    className="w-12 h-7 text-center p-0"
                    min={1}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 bg-transparent"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 结算区域 */}
      <div className="p-4 border-t border-border space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">商品数量</span>
            <span className="text-foreground">{itemCount} 件</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">应付金额</span>
            <span className="text-2xl font-bold text-primary">${(subtotal).toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => onCheckout("cash")}
            disabled={items.length === 0}
            variant="outline"
            className="flex flex-col gap-1 h-auto py-3"
          >
            <Banknote className="w-5 h-5" />
            <span className="text-xs">现金</span>
          </Button>
          <Button
            onClick={() => onCheckout("qrcode")}
            disabled={items.length === 0}
            className="flex flex-col gap-1 h-auto py-3"
          >
            <QrCode className="w-5 h-5" />
            <span className="text-xs">扫码支付</span>
          </Button>
          <Button
            onClick={() => onCheckout("card")}
            disabled={items.length === 0}
            variant="outline"
            className="flex flex-col gap-1 h-auto py-3"
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-xs">刷卡</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
