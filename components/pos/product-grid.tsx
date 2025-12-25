"use client"

import type React from "react"

import { useState } from "react"
import type { Product } from "@/lib/store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Barcode, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  onScan: (barcode: string) => void
}

const categories = ["全部", "饮料", "零食", "方便食品", "乳制品", "日用品", "调味品", "肉类"]

export function ProductGrid({ products, onAddToCart, onScan }: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [barcodeInput, setBarcodeInput] = useState("")
  const [activeCategory, setActiveCategory] = useState("全部")

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode.includes(searchTerm)
    const matchesCategory = activeCategory === "全部" || product.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (barcodeInput.trim()) {
      onScan(barcodeInput.trim())
      setBarcodeInput("")
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 搜索和扫码区域 */}
      <div className="p-4 space-y-3 border-b border-border bg-card">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索商品名称或条码..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
            <div className="relative">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="扫码 / 输入条码"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="pl-10 w-48"
              />
            </div>
            <Button type="submit" size="icon" variant="secondary">
              <Plus className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* 分类标签 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="flex-shrink-0"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* 商品网格 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => onAddToCart(product)}
              className={cn(
                "p-3 bg-card rounded-xl border border-border",
                "hover:border-primary hover:shadow-md transition-all",
                "text-left group",
              )}
            >
              <div className="aspect-square bg-white rounded-lg mb-2 flex items-center justify-center overflow-hidden border border-border/50">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-medium text-sm text-foreground line-clamp-2 mb-1">{product.name}</h3>
              <div className="flex items-center justify-between">
                <span className="text-primary font-bold">${(product.price).toFixed(2)}</span>
                <Badge variant="secondary" className="text-xs">
                  {product.stock}件
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
