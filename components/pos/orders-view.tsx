"use client"

import { useState,useEffect } from "react"
import type { Order } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Undo2, Calendar } from "lucide-react"
import { Banknote, QrCode, CreditCard } from "lucide-react" // Import missing icons
import { se } from "date-fns/locale"

interface OrdersViewProps {
  orders: Order[]
  onRefund: (orderId: string, amount: number) => void
}

// export function OrdersView({ orders, onRefund }: OrdersViewProps) {
export function OrdersView(onRefund: (orderId: string, amount: number) => void) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [refundAmount, setRefundAmount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  useEffect(() => {
      const fetchOrders = async () => {
        try {
          const res = await fetch(
            "http://172.20.10.6:8088/merchant/queryOrders",
          )
  
          if (!res.ok) {
            throw new Error("Failed to fetch orders")
          }
  
          const result = await res.json()
          console.log(result)
  
          // ⭐ 关键：接口数据 → Order[] 适配
          const adaptedOrders: Order[] = result.data.map((item: any) => ({
            id: item.raw.referenceNumber,
            total: item.raw.transactionAmount,
            status: item.orderState,
            createdAt: new Date(item.raw.originalTransactionTime),
            refundAmount: 0,
            items: [],
          }))
  
          setOrders(adaptedOrders)
        } catch (error) {
          console.error("获取订单失败:", error)
        } finally {

        }
      }
  
      fetchOrders()
    }, [])

  const filteredOrders = orders.filter((order) => {
    // 订单号筛选
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase())

    // 时间范围筛选
    let matchesDateRange = true
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      matchesDateRange = matchesDateRange && order.createdAt >= start
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      matchesDateRange = matchesDateRange && order.createdAt <= end
    }

    return matchesSearch && matchesDateRange
  })

  const setQuickDateRange = (range: "today" | "week" | "month") => {
    const today = new Date()
    const endDateStr = today.toISOString().split("T")[0]

    let startDateStr = endDateStr
    if (range === "week") {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      startDateStr = weekAgo.toISOString().split("T")[0]
    } else if (range === "month") {
      const monthAgo = new Date(today)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      startDateStr = monthAgo.toISOString().split("T")[0]
    }

    setStartDate(startDateStr)
    setEndDate(endDateStr)
  }

  const clearDateFilter = () => {
    setStartDate("")
    setEndDate("")
  }

  const getPaymentIcon = (method: Order["paymentMethod"]) => {
    switch (method) {
      case "cash":
        return <Banknote className="w-4 h-4" />
      case "qrcode":
        return <QrCode className="w-4 h-4" />
      case "card":
        return <CreditCard className="w-4 h-4" />
    }
  }

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "完成":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">已完成</Badge>
      case "退款":
        return <Badge variant="destructive">已退款</Badge>
      case "partial_refund":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">部分退款</Badge>
    }
  }

  const handleRefund = async (referenceNumber: string) => {
  if (!selectedOrder || !refundAmount) return

  const amount = Number.parseFloat(refundAmount)

    try {
      const result = await refundOrder(referenceNumber)
      setTimeout(() => {
        if (result.statusCode !== "00") {
          alert(`退款失败：${result.msg}`)
          return
        }

        // ✅ 退款成功，更新订单状态
        const isFullRefund = amount === selectedOrder.total

        selectedOrder.refundAmount =
          (selectedOrder.refundAmount || 0) + amount

        selectedOrder.status = isFullRefund
          ? "refunded"
          : "partial_refund"

        // 如果你 orders 是 props，需要通过父组件更新
        // 这里假设父组件会根据 onRefund 更新状态
        onRefund(selectedOrder.id, amount)

        // 关闭弹窗 & 清理
        setShowRefundDialog(false)
        setRefundAmount("")
        setSelectedOrder(null)
      }, 30000); // 模拟等待时间


    } catch (error) {
      console.error("退款异常", error)
      alert("退款请求异常，请稍后重试")
    }
}

  const refundOrder = async (referenceNumber: string) => {
    const res = await fetch(
      "http://172.20.10.6:8088/merchant/ActiveConsumeCancel",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referenceNumber,
        }),
      }
    )

    const json = await res.json()
    return json
  }


  return (
    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">订单记录</h2>
          <p className="text-muted-foreground">查看和管理所有交易记录</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索订单号..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">时间范围</span>
        </div>

        <div className="flex items-center gap-2">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40" />
          <span className="text-muted-foreground">至</span>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setQuickDateRange("today")} className="bg-transparent">
            今日
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickDateRange("week")} className="bg-transparent">
            近7天
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickDateRange("month")} className="bg-transparent">
            近30天
          </Button>
          {(startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={clearDateFilter} className="text-muted-foreground">
              清除
            </Button>
          )}
        </div>

        <div className="ml-auto text-sm text-muted-foreground">共 {filteredOrders.length} 条记录</div>
      </div>

      <div className="flex-1 overflow-auto bg-card rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>订单号</TableHead>
              <TableHead>时间</TableHead>
              <TableHead>金额</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              console.log(order),
              <TableRow key={order.id}>
                <TableCell className="font-mono font-medium">{order.id}</TableCell>
                <TableCell className="text-muted-foreground">
                  {order.createdAt.toLocaleDateString("zh-CN")}{" "}
                  {order.createdAt.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </TableCell>
                <TableCell className="font-semibold text-primary">${order.total.toFixed(2)}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {order.status === "完成" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedOrder(order)
                          setRefundAmount(order.total.toString())
                          setShowRefundDialog(true)
                        }}
                        className="text-destructive"
                      >
                        <Undo2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* 订单详情弹窗 */}
      <Dialog open={!!selectedOrder && !showRefundDialog} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">订单号</p>
                  <p className="font-mono font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">时间</p>
                  <p>{selectedOrder.createdAt.toLocaleString("zh-CN")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">收银员</p>
                  <p>{selectedOrder.cashierId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">状态</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-2">商品明细</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 flex justify-between">
                <span className="font-medium">订单总额</span>
                <span className="text-xl font-bold text-primary">${selectedOrder.total.toFixed(2)}</span>
              </div>

              {selectedOrder.refundAmount && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex justify-between">
                  <span>已退款金额</span>
                  <span className="font-semibold">${selectedOrder.refundAmount.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 退款弹窗 */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>订单退款</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">订单号</span>
                  <span className="font-mono">{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">订单金额</span>
                  <span className="font-semibold">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">退款金额</label>
                <Input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={selectedOrder.total}
                  step="0.01"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowRefundDialog(false)}>
                  取消
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleRefund(selectedOrder.id)}
                  disabled={
                    !refundAmount ||
                    Number.parseFloat(refundAmount) <= 0 ||
                    Number.parseFloat(refundAmount) > selectedOrder.total
                  }
                >
                  确认退款
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
