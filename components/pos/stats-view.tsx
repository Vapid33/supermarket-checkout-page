"use client"

import { useMemo, useState } from "react"
import type { Order } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Receipt, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

interface StatsViewProps {
  orders: Order[]
}

type TimeRange = "day" | "month" | "year"

export function StatsView({ orders }: StatsViewProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("day")

  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisYear = new Date(now.getFullYear(), 0, 1)

    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today)
    const monthOrders = orders.filter((o) => new Date(o.createdAt) >= thisMonth)
    const yearOrders = orders.filter((o) => new Date(o.createdAt) >= thisYear)

    const calcStats = (orderList: Order[]) => {
      const completed = orderList.filter((o) => o.status === "completed")
      const totalRevenue = completed.reduce((sum, o) => sum + o.total, 0)

      return {
        orderCount: orderList.length,
        totalRevenue,
        avgOrderValue: orderList.length > 0 ? totalRevenue / orderList.length : 0,
      }
    }

    return {
      day: calcStats(todayOrders),
      month: calcStats(monthOrders),
      year: calcStats(yearOrders),
    }
  }, [orders])

  const chartData = useMemo(() => {
    const now = new Date()

    if (timeRange === "day") {
      // 按小时统计
      const hours = Array.from({ length: 24 }, (_, i) => ({
        name: `${i}时`,
        revenue: 0,
        orders: 0,
      }))

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      orders
        .filter((o) => new Date(o.createdAt) >= today)
        .forEach((o) => {
          const hour = new Date(o.createdAt).getHours()
          hours[hour].revenue += o.total
          hours[hour].orders += 1
        })

      return hours.slice(8, 22) // 只显示营业时间
    }

    if (timeRange === "month") {
      // 按日统计
      const days = Array.from({ length: 31 }, (_, i) => ({
        name: `${i + 1}日`,
        revenue: 0,
        orders: 0,
      }))

      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      orders
        .filter((o) => new Date(o.createdAt) >= thisMonth)
        .forEach((o) => {
          const day = new Date(o.createdAt).getDate() - 1
          if (day >= 0 && day < 31) {
            days[day].revenue += o.total
            days[day].orders += 1
          }
        })

      return days.slice(0, now.getDate())
    }

    // 按月统计
    const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"].map(
      (name) => ({ name, revenue: 0, orders: 0 }),
    )

    const thisYear = new Date(now.getFullYear(), 0, 1)
    orders
      .filter((o) => new Date(o.createdAt) >= thisYear)
      .forEach((o) => {
        const month = new Date(o.createdAt).getMonth()
        months[month].revenue += o.total
        months[month].orders += 1
      })

    return months.slice(0, now.getMonth() + 1)
  }, [orders, timeRange])

  const currentStats = stats[timeRange]

  const statCards = [
    {
      title: "营业额",
      value: `$${currentStats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "订单数",
      value: currentStats.orderCount,
      icon: Receipt,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "平均客单价",
      value: `$${currentStats.avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ]

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">营业统计</h2>
          <p className="text-muted-foreground">查看销售数据和趋势分析</p>
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
          {[
            { key: "day", label: "今日" },
            { key: "month", label: "本月" },
            { key: "year", label: "本年" },
          ].map((item) => (
            <Button
              key={item.key}
              variant={timeRange === item.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeRange(item.key as TimeRange)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bgColor)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 图表 */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">营业额趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "营业额"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">订单量趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: number) => [value, "订单数"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    dot={{ fill: "var(--chart-2)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
