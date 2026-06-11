'use client';

import React, { useEffect, useState } from 'react';
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  FileText,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatINR } from '@/lib/constants';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  stats: {
    totalRevenue: number;
    ordersToday: number;
    totalProducts: number;
    activeUsers: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: string;
    items: number;
    date: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    sold: number;
    image: string | null;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    category: string;
    stock: number;
    threshold: number;
  }>;
  revenueChart: Array<{ month: string; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div>Failed to load dashboard data.</div>;

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatINR(data.stats.totalRevenue),
      icon: IndianRupee,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'Orders Today',
      value: data.stats.ordersToday.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Total Products',
      value: data.stats.totalProducts.toString(),
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      title: 'Active Users',
      value: data.stats.activeUsers.toString(),
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back to MeraShop Admin
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" asChild>
            <Link href="/admin/products">
              <Plus className="mr-1 h-4 w-4" />
              Add Product
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">
              <FileText className="mr-1 h-4 w-4" />
              View Orders
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Overview
            </CardTitle>
            <CardDescription>Monthly revenue for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {data.revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatINR(value), 'Revenue']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--border))',
                      backgroundColor: 'hsl(var(--card))',
                      color: 'hsl(var(--card-foreground))',
                    }}
                    itemStyle={{ color: 'hsl(var(--card-foreground))' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performers by total sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topProducts.map((product, i) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{product.sold} sold</p>
                    <p className="text-xs text-muted-foreground">{formatINR(product.price)}</p>
                  </div>
                </div>
              ))}
              {data.topProducts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Orders */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Orders</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/orders">
                  View All <ArrowUpRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>{formatINR(order.total)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColors[order.status] || ''}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {data.recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No recent orders
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Products below threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="text-xs">
                      {product.stock} left
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Threshold: {product.threshold}
                    </p>
                  </div>
                </div>
              ))}
              {data.lowStockProducts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All products are well stocked
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/products">
                <Package className="mr-1 h-4 w-4" /> Manage Products
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/categories">
                <ShoppingCart className="mr-1 h-4 w-4" /> Manage Categories
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/banners">
                <FileText className="mr-1 h-4 w-4" /> Manage Banners
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/coupons">
                <IndianRupee className="mr-1 h-4 w-4" /> Manage Coupons
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/analytics">
                <TrendingUp className="mr-1 h-4 w-4" /> View Analytics
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
