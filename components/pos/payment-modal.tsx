"use client"

import { useState, useEffect } from "react"
import type { CartItem } from "@/lib/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, QrCode, Banknote, CreditCard, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { QRCodeCanvas } from "qrcode.react"
import { XCircle } from "lucide-react"

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  method: "cash" | "qrcode" | "card"
  total: number
  items: CartItem[]
  onConfirm: () => void
  qrValue :string
  referenceNumber:string
}

export function PaymentModal({ open, onClose, method, total, items, onConfirm ,qrValue,referenceNumber}: PaymentModalProps) {
  const [cashReceived, setCashReceived] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const change = cashReceived ? Number.parseFloat(cashReceived) - total : 0
  const [isFailed, setIsFailed] = useState(false)
  useEffect(() => {
    if (!open) {
      setCashReceived("")
      setIsProcessing(false)
      setIsSuccess(false)
      setIsFailed(false)
    }
  }, [open])

  useEffect(() => {
  if (!open || method !== "qrcode") return

  let pollingTimer: NodeJS.Timeout
  let timeoutTimer: NodeJS.Timeout
  let stopped = false

  const startPolling = async () => {
    setIsProcessing(true)
    setIsFailed(false)

    // 轮询订单状态（每 2 秒）
    pollingTimer = setInterval(async () => {
      if (stopped) return

      try {
        const isPaid = await queryOrderStatus()

        if (isPaid) {
          stopped = true
          clearInterval(pollingTimer)
          clearTimeout(timeoutTimer)

          await saveOrder()

          setIsProcessing(false)
          setIsSuccess(true)

          setTimeout(() => {
          }, 1500)
        }
      } catch (err) {
        console.error("查询订单失败", err)
      }
    }, 2000)

    // ⏰ 30 秒超时
    timeoutTimer = setTimeout(() => {
      if (stopped) return

      stopped = true
      clearInterval(pollingTimer)

      setIsProcessing(false)
      setIsFailed(true)
    }, 300_000)
  }

  startPolling()

  return () => {
    stopped = true
    clearInterval(pollingTimer)
    clearTimeout(timeoutTimer)
  }
}, [open, method])

const saveOrder = async () => {
  //await fetch("http://127.0.0.1:4523/m1/7468733-7203316-default/merchant/saveOrder", {
  await fetch("http://172.20.10.6:8088/merchant/saveOrder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      merchantId: "123",
      orderId: referenceNumber,
      amount: total,
      detail: JSON.stringify({
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
      }),
    }),
  })
}

const queryOrderStatus = async () => {
    const res = await fetch(
      "http://172.20.10.6:8088/merchant/queryOrders?orderId="+referenceNumber,
    )
    const result = await res.json()
    console.log("2222222",result)
    // 假设完成状态是 "完成"
    return result.data[0].orderState === "消费"
}
  const handleConfirm = async () => {
    setIsProcessing(true)
    // 模拟支付处理
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsProcessing(false)
    setIsSuccess(true)
    // 显示成功后关闭
    setTimeout(() => {
      onConfirm()
    }, 1500)
  }

  const methodConfig = {
    cash: { icon: Banknote, label: "现金支付", color: "text-green-600" },
    qrcode: { icon: QrCode, label: "扫码支付", color: "text-primary" },
    card: { icon: CreditCard, label: "刷卡支付", color: "text-blue-600" },
  }

  const config = methodConfig[method]
  const Icon = config.icon

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">支付成功</h3>
            <p className="text-muted-foreground">交易已完成</p>
            <p className="text-2xl font-bold text-primary mt-4">${total.toFixed(2)}</p>
            {method === "cash" && change > 0 && (
              <p className="text-muted-foreground mt-2">找零: ${change.toFixed(2)}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }
if (isFailed) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center py-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">支付失败</h3>
          <p className="text-muted-foreground">
            超过 30 秒未完成支付
          </p>

          <Button className="mt-6 w-full" onClick={onClose}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn("w-5 h-5", config.color)} />
            {config.label}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 订单摘要 */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">商品数量</span>
              <span>{items.reduce((sum, item) => sum + item.quantity, 0)} 件</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">应付金额</span>
              <span className="text-xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* 支付方式特定内容 */}
          {method === "cash" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>收款金额</Label>
                <Input
                  type="number"
                  placeholder="输入收到的现金金额"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="text-lg"
                />
              </div>
              {cashReceived && Number.parseFloat(cashReceived) >= total && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg">
                  <div className="flex justify-between">
                    <span>找零</span>
                    <span className="font-semibold">${change.toFixed(2)}</span>
                  </div>
                </div>
              )}
              {/* 快捷金额按钮 */}
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 50, 100].map((amount) => (
                  <Button key={amount} variant="outline" onClick={() => setCashReceived(String(amount))}>
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {method === "qrcode" && (
            <div className="flex flex-col items-center py-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border">
                 <QRCodeCanvas value={qrValue} size={208} />
              </div>
              <div className="mt-4 text-center">
                <p className="font-medium text-foreground">请顾客扫描二维码付款</p>
              </div>
              <div className="mt-4 w-full bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">等待顾客扫码支付...</span>
                </div>
              </div>
            </div>
          )}

          {method === "card" && (
            <div className="flex flex-col items-center py-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-12 h-12 text-blue-600" />
              </div>
              <p className="text-muted-foreground">请将银行卡靠近读卡器</p>
            </div>
          )}

          {/* <Button
            onClick={handleConfirm}
            className="w-full"
            disabled={isProcessing || (method === "cash" && (!cashReceived || Number.parseFloat(cashReceived) < total))}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                处理中...
              </>
            ) : (
              `确认收款 $${total.toFixed(2)}`
            )}
          </Button> */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
