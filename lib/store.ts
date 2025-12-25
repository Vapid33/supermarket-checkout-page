// 模拟商品数据库
export interface Product {
  id: string
  barcode: string
  name: string
  price: number
  category: string
  stock: number
  image: string
}

export interface CartItem extends Product {
  quantity: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  paymentMethod: "cash" | "qrcode" | "card"
  status: string
  refundAmount?: number
  createdAt: Date
  cashierId: string
}

// 模拟商品数据
export const products: Product[] = [
  {
    id: "1",
    barcode: "6901028001823",
    name: "可口可乐 330ml",
    price: 0.48, // 3.5 * 0.138 = 0.483 → 保留两位小数0.48
    category: "饮料",
    stock: 100,
    image: "/coca-cola-330ml-red-aluminum-can-cold-drink-produc.jpg",
  },
  {
    id: "2",
    barcode: "6920152400012",
    name: "康师傅红烧牛肉面",
    price: 0.62, // 4.5 * 0.138 = 0.621 → 保留两位小数0.62
    category: "方便食品",
    stock: 80,
    image: "/master-kong-kangshifu-braised-beef-instant-noodles.jpg",
  },
  {
    id: "3",
    barcode: "6902083886523",
    name: "农夫山泉 550ml",
    price: 0.28, // 2.0 * 0.138 = 0.276 → 保留两位小数0.28
    category: "饮料",
    stock: 200,
    image: "/nongfu-spring-natural-mineral-water-550ml-plastic-.jpg",
  },
  {
    id: "4",
    barcode: "6921168509256",
    name: "乐事薯片 原味 75g",
    price: 1.09, // 7.9 * 0.138 = 1.0902 → 保留两位小数1.09
    category: "零食",
    stock: 50,
    image: "/lay-s-classic-original-potato-chips-75g-yellow-bag.jpg",
  },
  {
    id: "5",
    barcode: "6923450657218",
    name: "伊利纯牛奶 250ml",
    price: 0.44, // 3.2 * 0.138 = 0.4416 → 保留两位小数0.44
    category: "乳制品",
    stock: 120,
    image: "/yili-pure-milk-250ml-white-blue-carton-box-chinese.jpg",
  },
  {
    id: "6",
    barcode: "6902538004045",
    name: "维达抽纸 3层100抽",
    price: 0.81, // 5.9 * 0.138 = 0.8142 → 保留两位小数0.81
    category: "日用品",
    stock: 60,
    image: "/vinda-facial-tissue-paper-soft-pack-3-ply-100-shee.jpg",
  },
  {
    id: "7",
    barcode: "6901236341582",
    name: "蒙牛酸酸乳 250ml",
    price: 0.52, // 3.8 * 0.138 = 0.5244 → 保留两位小数0.52
    category: "乳制品",
    stock: 90,
    image: "/mengniu-suan-suan-ru-yogurt-drink-250ml-pink-straw.jpg",
  },
  {
    id: "8",
    barcode: "6920584410126",
    name: "旺旺雪饼 84g",
    price: 0.90, // 6.5 * 0.138 = 0.897 → 保留两位小数0.90
    category: "零食",
    stock: 70,
    image: "/want-want-snow-rice-crackers-xue-bing-84g-white-ro.jpg",
  },
  {
    id: "9",
    barcode: "6901939621608",
    name: "海天酱油 500ml",
    price: 1.23, // 8.9 * 0.138 = 1.2282 → 保留两位小数1.23
    category: "调味品",
    stock: 45,
    image: "/haitian-soy-sauce-500ml-dark-glass-bottle-chinese-.jpg",
  },
  {
    id: "10",
    barcode: "6923644267674",
    name: "好丽友派 6枚",
    price: 1.78, // 12.9 * 0.138 = 1.7802 → 保留两位小数1.78
    category: "零食",
    stock: 40,
    image: "/orion-choco-pie-chocolate-coated-marshmallow-cake-.jpg",
  },
  {
    id: "11",
    barcode: "6902827110013",
    name: "双汇火腿肠 30g×10",
    price: 2.18, // 15.8 * 0.138 = 2.1804 → 保留两位小数2.18
    category: "肉类",
    stock: 55,
    image: "/shuanghui-ham-sausage-10-pack-red-packaging-chines.jpg",
  },
  {
    id: "12",
    barcode: "6921168593378",
    name: "奥利奥饼干 97g",
    price: 1.17, // 8.5 * 0.138 = 1.173 → 保留两位小数1.17
    category: "零食",
    stock: 65,
    image: "/oreo-cookies-97g-blue-package-chocolate-sandwich-b.jpg",
  },
];

// 生成模拟订单数据
export function generateMockOrders(): Order[] {
  const orders: Order[] = []
  const now = new Date()

  for (let i = 0; i < 50; i++) {
    const orderDate = new Date(now)
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 365))
    orderDate.setHours(Math.floor(Math.random() * 12) + 8)
    orderDate.setMinutes(Math.floor(Math.random() * 60))

    const itemCount = Math.floor(Math.random() * 5) + 1
    const items: CartItem[] = []

    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      const existingItem = items.find((item) => item.id === product.id)
      if (existingItem) {
        existingItem.quantity += Math.floor(Math.random() * 3) + 1
      } else {
        items.push({
          ...product,
          quantity: Math.floor(Math.random() * 3) + 1,
        })
      }
    }

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const status = Math.random() > 0.9 ? "refunded" : Math.random() > 0.95 ? "partial_refund" : "completed"

    orders.push({
      id: `ORD${String(i + 1).padStart(6, "0")}`,
      items,
      total: Number(total.toFixed(2)),
      paymentMethod: ["cash", "qrcode", "card"][Math.floor(Math.random() * 3)] as Order["paymentMethod"],
      status,
      refundAmount:
        status === "refunded"
          ? total
          : status === "partial_refund"
            ? Number((total * Math.random() * 0.5).toFixed(2))
            : undefined,
      createdAt: orderDate,
      cashierId: `收银员${Math.floor(Math.random() * 3) + 1}`,
    })
  }

  return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}
