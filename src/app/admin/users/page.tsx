'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Search, MoreHorizontal, Pencil, Shield, User, Download,
} from 'lucide-react';
import {
  Card, CardContent,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/csv-export';

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  isActive: boolean;
  orders: number;
  addresses: number;
  createdAt: string;
}

interface UserDetail {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
  }>;
  addresses: Array<{
    id: string;
    label: string | null;
    name: string;
    city: string;
    state: string;
    isDefault: boolean;
  }>;
  _count: { orders: number; reviews: number; wishlistItems: number };
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('customer');
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search,
        role: roleFilter,
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openDetail = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      setUserDetail(data.user);
      setDetailOpen(true);
    } catch {
      toast.error('Failed to load user details');
    }
  };

  const openRoleEdit = (userId: string, currentRole: string) => {
    setEditUserId(userId);
    setEditRole(currentRole);
    setEditRoleOpen(true);
  };

  const handleRoleUpdate = async () => {
    if (!editUserId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('User role updated');
      setEditRoleOpen(false);
      fetchUsers();
    } catch {
      toast.error('Failed to update user role');
    } finally {
      setSaving(false);
    }
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    manager: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    customer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    seller: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const handleExportCSV = () => {
    const csvData = users.map((u) => ({
      name: u.name || '',
      email: u.email,
      role: u.role,
      joinedDate: new Date(u.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      }),
      ordersCount: u.orders,
    }));
    exportToCSV(csvData, `merashop-users-${new Date().toISOString().split('T')[0]}`, [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'role', label: 'Role' },
      { key: 'joinedDate', label: 'Joined Date' },
      { key: 'ordersCount', label: 'Orders Count' },
    ]);
    toast.success('CSV exported successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">{total} total users</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={loading}>
          <Download className="mr-1 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-8"
              />
            </div>
            <Select value={roleFilter || 'all'} onValueChange={(v) => { setRoleFilter(v === 'all' ? '' : v); setPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}><div className="h-5 w-20 animate-pulse rounded bg-muted" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{user.name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell className="text-sm">{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={roleColors[user.role] || ''}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.orders}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetail(user.id)}>
                            <User className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRoleEdit(user.id, user.role)}>
                            <Shield className="mr-2 h-4 w-4" /> Change Role
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
          <p className="text-sm text-muted-foreground">Page {page} of {totalPages} ({total} users)</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* User Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {userDetail && (
            <>
              <SheetHeader>
                <SheetTitle>{userDetail.name || 'Unknown User'}</SheetTitle>
                <SheetDescription>{userDetail.email}</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {userDetail.name ? userDetail.name.split(' ').map((n) => n[0]).join('').toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Badge variant="secondary" className={roleColors[userDetail.role] || ''}>{userDetail.role}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Joined {new Date(userDetail.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{userDetail._count.orders}</p><p className="text-xs text-muted-foreground">Orders</p></CardContent></Card>
                  <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{userDetail._count.reviews}</p><p className="text-xs text-muted-foreground">Reviews</p></CardContent></Card>
                  <Card><CardContent className="p-3 text-center"><p className="text-lg font-bold">{userDetail._count.wishlistItems}</p><p className="text-xs text-muted-foreground">Wishlist</p></CardContent></Card>
                </div>

                <Separator />

                {/* Addresses */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Addresses ({userDetail.addresses.length})</h3>
                  {userDetail.addresses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No saved addresses</p>
                  ) : (
                    <div className="space-y-2">
                      {userDetail.addresses.map((addr) => (
                        <div key={addr.id} className="rounded-lg border p-3 text-sm">
                          <p className="font-medium">{addr.name}</p>
                          <p className="text-muted-foreground">{addr.city}, {addr.state}</p>
                          {addr.isDefault && <Badge variant="outline" className="mt-1 text-xs">Default</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Recent Orders */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">Recent Orders</h3>
                  {userDetail.orders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No orders yet</p>
                  ) : (
                    <div className="space-y-2">
                      {userDetail.orders.map((order) => (
                        <div key={order.id} className="flex justify-between rounded-lg border p-3 text-sm">
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                            <Badge variant="secondary" className="text-xs">{order.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Change Role Dialog */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>Select a new role for this user</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>New Role</Label>
            <Select value={editRole} onValueChange={setEditRole}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleOpen(false)}>Cancel</Button>
            <Button onClick={handleRoleUpdate} disabled={saving}>
              {saving ? 'Updating...' : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
