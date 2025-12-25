"use client"

import { useState, useCallback } from "react"
import { type Product, type CartItem, products, type Order } from "@/lib/store"
import { ProductGrid } from "./product-grid"
import { CartPanel } from "./cart-panel"
import { PaymentModal } from "./payment-modal"
import { useToast } from "@/hooks/use-toast"
import { randomUUID } from "crypto"

interface CashierViewProps {
  onNewOrder: (order: Order) => void
}

export function CashierView({ onNewOrder }: CashierViewProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qrcode" | "card">("qrcode")
  const [showPayment, setShowPayment] = useState(false)
   const { toast } = useToast()

  const addToCart = useCallback(
    (product: Product) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.id === product.id)
        if (existing) {
          return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
        }
        return [...prev, { ...product, quantity: 1 }]
      })
      // toast({
      //   title: "已添加",
      //   description: product.name,
      // })
    },
    [toast],
  )

  const handleScan = useCallback(
    (barcode: string) => {
      const product = products.find((p) => p.barcode === barcode)
      if (product) {
        addToCart(product)
      } else {
        toast({
          title: "未找到商品",
          description: `条码 ${barcode} 不存在`,
          variant: "destructive",
        })
      }
    },
    [addToCart, toast],
  )

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }, [])

  const removeItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  const handleCheckout = useCallback((method: "cash" | "qrcode" | "card") => {
    setPaymentMethod(method)
    setShowPayment(true)
  }, [])

  function getMinuteTimestampString(): string {
    const now = new Date();
    const year = now.getFullYear();
    // getMonth() 返回 0-11，需要加1
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    // 拼接成 yyyymmddhhmm 格式的数字字符串
    return `${year}${month}${day}${hours}${minutes}`;
  }
  const transactionAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  //const merchantId = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  const merchantId ="123"
  const terminalId = '02228293';
  const referenceNumber = getMinuteTimestampString() + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
 // const referenceNumber ="12345"
  const transactionType = "";
  const payload = {
    merchantId,
    terminalId,
    referenceNumber,
    transactionAmount,
    transactionType
  }
  const handlePaymentConfirm = useCallback(() => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const order: Order = {
      id: referenceNumber,
      items: [...cart],
      total: Number(total.toFixed(2)),
      paymentMethod,
      status: "completed",
      createdAt: new Date(),
      cashierId: "收银员1",
    }
    onNewOrder(order)
    setCart([])
    setShowPayment(false)
    toast({
      title: "交易完成",
      description: `订单 ${order.id} 已生成`,
    })
  }, [cart, paymentMethod, onNewOrder, toast])


// const qrValue =
//   `${origin}/pay?data=${encodeURIComponent(
//     btoa(JSON.stringify(payload))
//   )}`
const qrValue = JSON.stringify(payload);

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <ProductGrid products={products} onAddToCart={addToCart} onScan={handleScan} />
      </div>
      <CartPanel
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        onCheckout={handleCheckout}
      />
      <PaymentModal
        open={showPayment}
        onClose={() => setShowPayment(false)}
        method={paymentMethod}
        total={transactionAmount}
        items={cart}
        onConfirm={handlePaymentConfirm}
        qrValue ={qrValue}
        referenceNumber={referenceNumber}
      />
    </div>
  )
}
