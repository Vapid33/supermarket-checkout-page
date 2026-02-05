"use client"

import { useState, useCallback } from "react"
import type { CartItem, Order, Product } from "@/lib/store"
import { rooms } from "@/lib/store"
import { CartPanel } from "./cart-panel"
import { PaymentModal } from "./payment-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface HotelBookingViewProps {
  onNewOrder: (order: Order) => void
}

export function HotelView({ onNewOrder }: HotelBookingViewProps) {
  const { toast } = useToast()

  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] =
    useState<"qrcode" | "preAuth">("preAuth")
  const [showPayment, setShowPayment] = useState(false)

  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")

  const nights =
    checkIn && checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(checkOut).getTime() -
              new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 1

  /** ✅ 直接接收 Product（房型就是商品） */
  const addRoom = useCallback((room: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === room.id)

      if (existing) {
        return prev.map((item) =>
          item.id === room.id
            ? { ...item, quantity: item.quantity + nights }
            : item
        )
      }

      return [
        ...prev,
        {
          ...room,
          quantity: nights,
        },
      ]
    })
  }, [nights])

  const totalAmount = cart.reduce(
    (sum, item) => sum + (item.price + 20) * item.quantity,
    0
  )

  const referenceNumber = Date.now().toString()

  const handlePaymentConfirm = useCallback(() => {
    const order: Order = {
      id: referenceNumber,
      items: cart,
      total: totalAmount,
      paymentMethod,
      status: paymentMethod === "preAuth" ? "预授权" : "消费",
      createdAt: new Date(),
      cashierId: "前台",
    }

    onNewOrder(order)
    setCart([])
    setShowPayment(false)

    toast({
      title: paymentMethod === "preAuth" ? "预授权成功" : "支付成功",
      description: `订单 ${order.id} 已生成`,
    })
  }, [cart, totalAmount, paymentMethod, onNewOrder, toast])

  const qrValue = JSON.stringify({
    merchantId: "898340149000006",
    terminalId: "02228293",
    referenceNumber,
    amount: totalAmount,
    transactionType: paymentMethod === "preAuth" ? "预授权" : "消费",
  })

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      {/* 左侧：房型选择 */}
      <div className="flex-1 p-6 overflow-auto space-y-6">
        <h2 className="text-2xl font-bold">酒店订房</h2>

        <div className="flex gap-4">
          <div className="space-y-2">
            <label className="text-sm">入住日期</label>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm">离店日期</label>
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {rooms.map((room) => (
            <Card key={room.id}>
              <CardContent className="p-4 space-y-2">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-32 object-cover rounded"
                />
                <h3 className="font-semibold">{room.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ${room.price} / 晚
                </p>
                <Button
                  onClick={() => addRoom(room)}
                  className="w-full"
                >
                  选择
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 右侧：复用收银台 */}
      <CartPanel
        items={cart}
        onUpdateQuantity={() => {}}
        onRemoveItem={(id) =>
          setCart((prev) => prev.filter((i) => i.id !== id))
        }
        onClearCart={() => setCart([])}
        onCheckout={(method) => {
          setPaymentMethod(method)
          setShowPayment(true)
        }}
        isHotel={true}
      />

      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        method={paymentMethod}
        total={totalAmount}
        items={cart}
        onConfirm={handlePaymentConfirm}
        qrValue={qrValue}
        referenceNumber={referenceNumber}
        isHotel={true}
      />
    </div>
  )
}
