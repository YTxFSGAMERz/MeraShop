'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Search, MoreHorizontal, Eye, ChevronLeft, ChevronRight, Truck, MessageSquare, Download,
  Trash2, ArrowUpDown, FileDown, Printer, X,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { formatINR } from '@/lib/constants';
import { exportToCSV } from '@/lib/csv-export';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantName?: string;
  variantValue?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  email?: string;
  phone?: string;
  status: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  taxAmount: number;
  items: number;
  orderItems: OrderItem[];
  payment: { method: string | null; status: string } | null;
  shippingAddress: {
    name: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingNumber: string | null;
  trackingUrl: string | null;
  couponCode: string | null;
  adminNotes: string | null;
  customerNotes: string | null;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkStatusValue, setBulkStatusValue] = useState('confirmed');
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const openDetail = (order: Order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setAdminNotes(order.adminNotes || '');
    setDetailOpen(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          trackingNumber: trackingNumber || null,
          adminNotes: adminNotes || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('Order updated');
      setDetailOpen(false);
      fetchOrders();
    } catch {
      toast.error('Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIndex = (status: string) => statusFlow.indexOf(status);

  // ── Bulk Operations ────────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)));
    }
  };

  const allSelected = orders.length > 0 && selectedIds.size === orders.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const handleBulkStatusUpdate = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/orders/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', ids: Array.from(selectedIds), status: bulkStatusValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk status update failed');
      toast.success(`${data.affected} orders updated to ${bulkStatusValue}`);
      setSelectedIds(new Set());
      setBulkStatusOpen(false);
      fetchOrders();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Bulk status update failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkExport = () => {
    const selectedOrders = orders.filter((o) => selectedIds.has(o.id));
    const csvData = selectedOrders.map((o) => ({
      orderNumber: o.orderNumber,
      customer: o.customer,
      email: o.email || '',
      items: o.items,
      total: o.total,
      status: o.status,
      paymentMethod: o.payment?.method || '',
      date: new Date(o.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      }),
    }));
    exportToCSV(csvData, `merashop-orders-selected-${new Date().toISOString().split('T')[0]}`, [
      { key: 'orderNumber', label: 'Order Number' },
      { key: 'customer', label: 'Customer' },
      { key: 'email', label: 'Email' },
      { key: 'items', label: 'Items' },
      { key: 'total', label: 'Total' },
      { key: 'status', label: 'Status' },
      { key: 'paymentMethod', label: 'Payment Method' },
      { key: 'date', label: 'Date' },
    ]);
    toast.success(`Exported ${selectedOrders.length} orders`);
  };

  const handlePrintInvoices = () => {
    const selectedOrders = orders.filter((o) => selectedIds.has(o.id));
    if (selectedOrders.length === 0) return;

    const invoiceHtml = selectedOrders.map((order) => `
      <div style="page-break-after: always; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f97316; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h1 style="font-size: 24px; color: #f97316; margin: 0;">MeraShop</h1>
            <p style="color: #666; margin: 4px 0 0;">Tax Invoice</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-weight: bold;">Order #${order.orderNumber}</p>
            <p style="margin: 4px 0 0; color: #666;">${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div style="display: flex; gap: 40px; margin-bottom: 20px;">
          <div style="flex: 1;">
            <h3 style="color: #333; margin-bottom: 8px;">Bill To:</h3>
            <p style="margin: 2px 0; color: #555;">${order.shippingAddress.name}</p>
            <p style="margin: 2px 0; color: #555;">${order.shippingAddress.address1}</p>
            ${order.shippingAddress.address2 ? `<p style="margin: 2px 0; color: #555;">${order.shippingAddress.address2}</p>` : ''}
            <p style="margin: 2px 0; color: #555;">${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
            <p style="margin: 2px 0; color: #555;">Phone: ${order.shippingAddress.phone}</p>
          </div>
          <div style="flex: 1;">
            <h3 style="color: #333; margin-bottom: 8px;">Status:</h3>
            <p style="text-transform: capitalize; font-weight: 600; color: ${order.status === 'delivered' ? '#16a34a' : order.status === 'cancelled' ? '#dc2626' : '#f97316'};">${order.status}</p>
            ${order.trackingNumber ? `<p style="margin: 4px 0; color: #555;">Tracking: ${order.trackingNumber}</p>` : ''}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #f97316; color: white;">
              <th style="padding: 8px 12px; text-align: left;">Item</th>
              <th style="padding: 8px 12px; text-align: center;">Qty</th>
              <th style="padding: 8px 12px; text-align: right;">Unit Price</th>
              <th style="padding: 8px 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems.map((item) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 12px;">
                  ${item.productName}
                  ${item.variantName && item.variantValue ? `<br><small style="color: #888;">${item.variantName}: ${item.variantValue}</small>` : ''}
                </td>
                <td style="padding: 8px 12px; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px 12px; text-align: right;">${formatINR(item.unitPrice)}</td>
                <td style="padding: 8px 12px; text-align: right; font-weight: 600;">${formatINR(item.totalPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 300px;">
            <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #555;">
              <span>Subtotal</span><span>${formatINR(order.subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #555;">
              <span>Shipping</span><span>${formatINR(order.shippingCost)}</span>
            </div>
            ${order.discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #16a34a;">
                <span>Discount</span><span>-${formatINR(order.discountAmount)}</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #555;">
              <span>Tax</span><span>${formatINR(order.taxAmount)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 2px solid #f97316; font-weight: bold; font-size: 16px;">
              <span>Total</span><span>${formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        <div style="margin-top: 30px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 12px;">
          <p>Thank you for shopping with MeraShop!</p>
          <p>For queries, contact support@merashop.in</p>
        </div>
      </div>
    `).join('');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>MeraShop - Invoices</title>
            <style>
              @media print { @page { margin: 10mm; } }
              body { margin: 0; padding: 0; }
            </style>
          </head>
          <body>${invoiceHtml}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }

    toast.success(`Printing ${selectedOrders.length} invoices`);
  };

  const handleExportCSV = () => {
    const csvData = orders.map((o) => ({
      orderNumber: o.orderNumber,
      customer: o.customer,
      email: o.email || '',
      items: o.items,
      total: o.total,
      status: o.status,
      paymentMethod: o.payment?.method || '',
      date: new Date(o.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      }),
    }));
    exportToCSV(csvData, `merashop-orders-${new Date().toISOString().split('T')[0]}`, [
      { key: 'orderNumber', label: 'Order Number' },
      { key: 'customer', label: 'Customer' },
      { key: 'email', label: 'Email' },
      { key: 'items', label: 'Items' },
      { key: 'total', label: 'Total' },
      { key: 'status', label: 'Status' },
      { key: 'paymentMethod', label: 'Payment Method' },
      { key: 'date', label: 'Date' },
    ]);
    toast.success('CSV exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">{total} total orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={loading}>
          <Download className="mr-1 h-4 w-4" /> Export All
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter || 'all'} onValueChange={(v) => { setStatusFilter(v === 'all' ? '' : v); setPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order number or customer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="default" className="gap-1">
                <Checkbox checked={allSelected} className="h-3 w-3" />
                {selectedIds.size} selected
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    Update Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Set status for {selectedIds.size} orders</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setBulkStatusValue('pending'); setBulkStatusOpen(true); }}>
                    <span className="mr-2 h-2 w-2 rounded-full bg-yellow-500" /> Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setBulkStatusValue('confirmed'); setBulkStatusOpen(true); }}>
                    <span className="mr-2 h-2 w-2 rounded-full bg-blue-500" /> Confirmed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setBulkStatusValue('processing'); setBulkStatusOpen(true); }}>
                    <span className="mr-2 h-2 w-2 rounded-full bg-purple-500" /> Processing
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setBulkStatusValue('shipped'); setBulkStatusOpen(true); }}>
                    <span className="mr-2 h-2 w-2 rounded-full bg-cyan-500" /> Shipped
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setBulkStatusValue('delivered'); setBulkStatusOpen(true); }}>
                    <span className="mr-2 h-2 w-2 rounded-full bg-green-500" /> Delivered
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setBulkStatusValue('cancelled'); setBulkStatusOpen(true); }}>
                    <span className="mr-2 h-2 w-2 rounded-full bg-red-500" /> Cancelled
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkExport}
                className="gap-1"
              >
                <FileDown className="h-3.5 w-3.5" />
                Export Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrintInvoices}
                className="gap-1"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Invoices
              </Button>
              <div className="flex-1" />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
                className="gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    ref={(ref) => {
                      if (ref) {
                        (ref as HTMLButtonElement & { indeterminate?: boolean }).indeterminate = someSelected;
                      }
                    }}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><div className="h-5 w-20 animate-pulse rounded bg-muted" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className={cn(selectedIds.has(order.id) && 'bg-primary/5')}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{order.customer}</p>
                        {order.email && <p className="text-xs text-muted-foreground">{order.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell className="font-medium">{formatINR(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[order.status] || ''}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(order)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} orders)
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle>Order {selectedOrder.orderNumber}</SheetTitle>
                <SheetDescription>
                  {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Status Timeline */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Status Timeline</h3>
                  <div className="flex items-center gap-1">
                    {statusFlow.map((s, i) => (
                      <React.Fragment key={s}>
                        <div className="flex flex-col items-center gap-1">
                          <div className={`h-3 w-3 rounded-full ${
                            i <= getStatusIndex(selectedOrder.status) && selectedOrder.status !== 'cancelled'
                              ? 'bg-primary'
                              : 'bg-muted'
                          }`} />
                          <span className="text-[10px] capitalize">{s}</span>
                        </div>
                        {i < statusFlow.length - 1 && (
                          <div className={`flex-1 h-0.5 ${
                            i < getStatusIndex(selectedOrder.status) && selectedOrder.status !== 'cancelled'
                              ? 'bg-primary'
                              : 'bg-muted'
                          }`} />
                        )}
                      </React.Fragment>
                    ))}
                    {selectedOrder.status === 'cancelled' && (
                      <Badge variant="destructive" className="ml-2 text-xs">Cancelled</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Customer</h3>
                  <p className="text-sm">{selectedOrder.customer}</p>
                  {selectedOrder.email && <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>}
                  {selectedOrder.phone && <p className="text-sm text-muted-foreground">{selectedOrder.phone}</p>}
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <Truck className="h-4 w-4" /> Shipping Address
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    <p>{selectedOrder.shippingAddress.name}</p>
                    <p>{selectedOrder.shippingAddress.address1}</p>
                    {selectedOrder.shippingAddress.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                    <p>{selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>

                <Separator />

                {/* Order Items */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Items ({selectedOrder.orderItems.length})</h3>
                  <div className="space-y-2">
                    {selectedOrder.orderItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div>
                          <p>{item.productName}</p>
                          {item.variantName && item.variantValue && (
                            <p className="text-xs text-muted-foreground">{item.variantName}: {item.variantValue}</p>
                          )}
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatINR(item.unitPrice)}</p>
                        </div>
                        <p className="font-medium">{formatINR(item.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(selectedOrder.subtotal)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{formatINR(selectedOrder.shippingCost)}</span></div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatINR(selectedOrder.discountAmount)}</span></div>
                  )}
                  <div className="flex justify-between"><span>Tax</span><span>{formatINR(selectedOrder.taxAmount)}</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold"><span>Total</span><span>{formatINR(selectedOrder.total)}</span></div>
                </div>

                {/* Payment */}
                {selectedOrder.payment && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Payment</h3>
                    <p className="text-sm">Method: {selectedOrder.payment.method || 'N/A'}</p>
                    <Badge variant={selectedOrder.payment.status === 'completed' ? 'default' : 'secondary'} className="mt-1 text-xs">
                      {selectedOrder.payment.status}
                    </Badge>
                  </div>
                )}

                {selectedOrder.couponCode && (
                  <div>
                    <h3 className="text-sm font-semibold mb-1">Coupon</h3>
                    <Badge variant="outline">{selectedOrder.couponCode}</Badge>
                  </div>
                )}

                <Separator />

                {/* Update Status */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Update Order</h3>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={updateStatus} onValueChange={setUpdateStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Truck className="h-3 w-3" /> Tracking Number</Label>
                    <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Admin Notes</Label>
                    <Textarea rows={2} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Internal notes" />
                  </div>
                  <Button onClick={handleUpdateOrder} disabled={updating} className="w-full">
                    {updating ? 'Updating...' : 'Update Order'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Bulk Status Change Confirmation */}
      <AlertDialog open={bulkStatusOpen} onOpenChange={setBulkStatusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Status of {selectedIds.size} Orders</AlertDialogTitle>
            <AlertDialogDescription>
              Set status to <strong className="capitalize">{bulkStatusValue}</strong> for {selectedIds.size} selected orders?
              {bulkStatusValue === 'delivered' && ' This will also set the delivered date.'}
              {bulkStatusValue === 'cancelled' && ' This will cancel all selected orders.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkStatusUpdate} disabled={bulkLoading}>
              {bulkLoading ? 'Updating...' : `Set ${bulkStatusValue}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
