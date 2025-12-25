"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Store, Printer, Volume2, Monitor } from "lucide-react"

export function SettingsView() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">系统设置</h2>
        <p className="text-muted-foreground">管理收银台配置和偏好设置</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              店铺信息
            </CardTitle>
            <CardDescription>设置店铺基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>店铺名称</Label>
              <Input defaultValue="智慧超市旗舰店" />
            </div>
            <div className="space-y-2">
              <Label>店铺地址</Label>
              <Input defaultValue="北京市朝阳区xxx路xx号" />
            </div>
            <div className="space-y-2">
              <Label>联系电话</Label>
              <Input defaultValue="010-12345678" />
            </div>
            <Button>保存更改</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              打印设置
            </CardTitle>
            <CardDescription>配置小票打印机</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">自动打印小票</p>
                <p className="text-sm text-muted-foreground">结账后自动打印</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">打印商品明细</p>
                <p className="text-sm text-muted-foreground">在小票上显示商品</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>打印机端口</Label>
              <Input defaultValue="COM1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              声音设置
            </CardTitle>
            <CardDescription>配置提示音</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">扫码提示音</p>
                <p className="text-sm text-muted-foreground">扫描商品时播放</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">支付成功提示音</p>
                <p className="text-sm text-muted-foreground">收款成功时播放</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">错误提示音</p>
                <p className="text-sm text-muted-foreground">操作失败时播放</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              显示设置
            </CardTitle>
            <CardDescription>配置界面显示</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">显示商品图片</p>
                <p className="text-sm text-muted-foreground">在商品列表显示图片</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">显示库存数量</p>
                <p className="text-sm text-muted-foreground">在商品卡片显示库存</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">大字体模式</p>
                <p className="text-sm text-muted-foreground">增大界面字体</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
