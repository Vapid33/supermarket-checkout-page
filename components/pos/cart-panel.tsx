"use client"

import type { CartItem } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Minus, Plus, Trash2, QrCode } from "lucide-react"

interface CartPanelProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
  onCheckout: (method: "qrcode" | "preAuth") => void
  isHotel?: boolean
}

export function CartPanel({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isHotel = false,
}: CartPanelProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const deposit = isHotel ? itemCount * 20 : 0
  const preAuthTotal = subtotal + deposit


  return (
    <div className="w-full lg:w-96 bg-card border-l border-border flex flex-col h-full">
      {/* 标题栏 */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-foreground">
            {isHotel ? "订房信息" : "订单信息"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {itemCount} {isHotel ? "间房" : "件商品"}
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCart}
            className="text-destructive"
          >
            清空
          </Button>
        )}
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
              <QrCode className="w-8 h-8" />
            </div>
            <p>{isHotel ? "尚未选择房型" : "购物车为空"}</p>
            <p className="text-sm">
              {isHotel ? "请选择房型加入订单" : "扫码或点击商品添加"}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-12 h-12 bg-background rounded-lg overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {item.name}
                </h4>
                <p className="text-primary font-semibold">
                  ${item.price.toFixed(2)}
                  {isHotel && <span className="text-xs text-muted-foreground"> / 晚</span>}
                </p>
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
                    onChange={(e) =>
                      onUpdateQuantity(item.id, Number(e.target.value) || 1)
                    }
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

      {/* 结算区 */}
<div className="p-4 border-t border-border space-y-4">
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">
        {isHotel ? "房间数量" : "商品数量"}
      </span>
      <span>{itemCount}</span>
    </div>

    {/* 房间总价 / 应付金额 */}
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">
        {isHotel ? "房间总价" : "应付金额"}
      </span>
      <span className="font-medium">
        ${subtotal.toFixed(2)}
      </span>
    </div>

    {/* 仅酒店展示押金 */}
    {isHotel && (
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">押金</span>
        <span className="font-medium">
          ${deposit.toFixed(2)}
        </span>
      </div>
    )}

    {/* 仅酒店展示预授权总额 */}
    {isHotel && (
      <div className="flex justify-between pt-2 border-t font-semibold">
        <span>预授权总额</span>
        <span className="text-primary text-lg">
          ${preAuthTotal.toFixed(2)}
        </span>
      </div>
    )}
  </div>

  {/* 按钮区 */}
  <div className="grid grid-cols-2 gap-2">
    {!isHotel && (
      <Button
        onClick={() => onCheckout("qrcode")}
        disabled={items.length === 0}
        className="flex flex-col gap-1 h-auto py-3"
      >
        <QrCode className="w-5 h-5" />
        <span className="text-xs">扫码支付</span>
      </Button>
    )}

    <Button
      onClick={() => onCheckout("preAuth")}
      disabled={items.length === 0}
      variant={isHotel ? "default" : "outline"}
      className={`flex flex-col gap-1 h-auto py-3 ${
        isHotel ? "col-span-2" : ""
      }`}
    >
      <QrCode className="w-5 h-5" />
      <span className="text-xs">
        {isHotel ? "预授权" : "预授权"}
      </span>
    </Button>
  </div>
</div>

    </div>
  )
}
