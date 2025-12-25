"use client"

import { useState, useEffect } from "react"
import { type Order, generateMockOrders } from "@/lib/store"
import { Sidebar } from "@/components/pos/sidebar"
import { CashierView } from "@/components/pos/cashier-view"
import { OrdersView } from "@/components/pos/orders-view"
import { StatsView } from "@/components/pos/stats-view"
import { SettingsView } from "@/components/pos/settings-view"
import { Toaster } from "@/components/ui/toaster"

export default function POSPage() {
  const [activeTab, setActiveTab] = useState("cashier")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)

  // useEffect(() => {
  //   // 初始化模拟订单数据
  //   setOrders(generateMockOrders())
  // }, [])
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)

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
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleNewOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev])
  }

  const handleRefund = (orderId: string, amount: number) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const isFullRefund = amount >= order.total
          return {
            ...order,
            status: isFullRefund ? "refunded" : "partial_refund",
            refundAmount: amount,
          }
        }
        return order
      }),
    )
  }

  return (
    <div className="h-screen flex bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === "cashier" && <CashierView onNewOrder={handleNewOrder} />}
        {/* {activeTab === "orders" && <OrdersView orders={orders} onRefund={handleRefund} />} */}
         {activeTab === "orders" && <OrdersView  onRefund={handleRefund}/>}
        {activeTab === "stats" && <StatsView orders={orders} />}
        {activeTab === "settings" && <SettingsView />}
      </main>

      <Toaster />
    </div>
  )
}
