'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  Home,
  Building2,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/lib/stores/auth-store';
import { toast } from 'sonner';

interface Address {
  id: string;
  label: string | null;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi', 'Chandigarh',
];

const emptyForm = {
  label: '',
  name: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
};

export default function AddressesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/account/login');
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await fetch(`/api/addresses?userId=${user?.id}`);
        if (res.ok) {
          const data = await res.json();
          setAddresses(data.addresses);
        }
      } catch {
        // fallback
      }
      setLoading(false);
    };

    fetchAddresses();
  }, [isAuthenticated, user?.id, router]);

  if (!isAuthenticated || !user) return null;

  const openAddDialog = () => {
    setEditingAddress(null);
    setForm({ ...emptyForm, name: user.name, phone: user.phone || '' });
    setDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setForm({
      label: address.label || '',
      name: address.name,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.addressLine1.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!/^\d{6}$/.test(form.pincode.trim())) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setSaving(true);
    try {
      if (editingAddress) {
        // Update
        const res = await fetch('/api/addresses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addressId: editingAddress.id,
            userId: user.id,
            ...form,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || 'Failed to update address');
          return;
        }

        toast.success('Address updated successfully');
      } else {
        // Create
        const res = await fetch('/api/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            ...form,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error || 'Failed to add address');
          return;
        }

        toast.success('Address added successfully');
      }

      // Refresh list
      const res = await fetch(`/api/addresses?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
      }

      setDialogOpen(false);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAddressId) return;

    try {
      const res = await fetch('/api/addresses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId: deletingAddressId, userId: user.id }),
      });

      if (!res.ok) {
        toast.error('Failed to delete address');
        return;
      }

      setAddresses((prev) => prev.filter((a) => a.id !== deletingAddressId));
      toast.success('Address deleted');
    } catch {
      toast.error('Something went wrong');
    }

    setDeleteDialogOpen(false);
    setDeletingAddressId(null);
  };

  const handleSetDefault = async (address: Address) => {
    try {
      const res = await fetch('/api/addresses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: address.id,
          userId: user.id,
          isDefault: true,
        }),
      });

      if (res.ok) {
        const refreshRes = await fetch(`/api/addresses?userId=${user.id}`);
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setAddresses(data.addresses);
        }
        toast.success('Default address updated');
      }
    } catch {
      toast.error('Failed to set default address');
    }
  };

  const getLabelIcon = (label: string | null) => {
    if (!label) return <MapPin className="size-4" />;
    const lower = label.toLowerCase();
    if (lower.includes('home')) return <Home className="size-4" />;
    if (lower.includes('office') || lower.includes('work')) return <Building2 className="size-4" />;
    return <MapPin className="size-4" />;
  };

  return (
    <div className="container-shop section-padding">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/account">
            <Button variant="ghost" size="icon" className="size-9">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-foreground">My Addresses</h1>
        </div>
        <Button size="sm" className="gap-1.5" onClick={openAddDialog}>
          <Plus className="size-4" />
          Add New
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-24 rounded-lg bg-muted animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MapPin className="size-12 mx-auto text-muted-foreground/40 mb-3" />
            <h2 className="text-lg font-semibold text-foreground mb-1">No Addresses Saved</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Add an address for faster checkout
            </p>
            <Button onClick={openAddDialog} className="gap-1.5">
              <Plus className="size-4" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={address.isDefault ? 'border-primary/30 bg-primary/5' : ''}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Label and Default Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                        {getLabelIcon(address.label)}
                      </span>
                      {address.label && (
                        <span className="text-sm font-medium text-foreground">{address.label}</span>
                      )}
                      {address.isDefault && (
                        <Badge variant="default" className="text-[10px] h-5 gap-0.5">
                          <CheckCircle className="size-2.5" />
                          Default
                        </Badge>
                      )}
                    </div>

                    {/* Address Details */}
                    <p className="text-sm font-medium text-foreground">{address.name}</p>
                    <p className="text-sm text-muted-foreground">{address.addressLine1}</p>
                    {address.addressLine2 && (
                      <p className="text-sm text-muted-foreground">{address.addressLine2}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Phone: {address.phone}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => openEditDialog(address)}
                      aria-label="Edit address"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    {!address.isDefault && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-amber-600 hover:text-amber-700"
                          onClick={() => handleSetDefault(address)}
                          aria-label="Set as default"
                        >
                          <Star className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => {
                            setDeletingAddressId(address.id);
                            setDeleteDialogOpen(true);
                          }}
                          aria-label="Delete address"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="label">Label (e.g., Home, Office)</Label>
              <Input
                id="label"
                value={form.label}
                onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="Home"
                className="h-10"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="addr-name">Full Name *</Label>
              <Input
                id="addr-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                className="h-10"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="addr-phone">Phone Number *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  +91
                </span>
                <Input
                  id="addr-phone"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  className="pl-12 h-10"
                  placeholder="9876543210"
                  required
                />
              </div>
            </div>

            {/* Address Line 1 */}
            <div className="space-y-2">
              <Label htmlFor="addr-line1">Address Line 1 *</Label>
              <Input
                id="addr-line1"
                value={form.addressLine1}
                onChange={(e) => setForm((prev) => ({ ...prev, addressLine1: e.target.value }))}
                placeholder="House/Flat No., Building, Street"
                className="h-10"
                required
              />
            </div>

            {/* Address Line 2 */}
            <div className="space-y-2">
              <Label htmlFor="addr-line2">Address Line 2</Label>
              <Input
                id="addr-line2"
                value={form.addressLine2}
                onChange={(e) => setForm((prev) => ({ ...prev, addressLine2: e.target.value }))}
                placeholder="Locality, Landmark (optional)"
                className="h-10"
              />
            </div>

            {/* City + State */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="addr-city">City *</Label>
                <Input
                  id="addr-city"
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addr-state">State *</Label>
                <select
                  id="addr-state"
                  value={form.state}
                  onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="">Select State</option>
                  {indianStates.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pincode */}
            <div className="space-y-2">
              <Label htmlFor="addr-pincode">Pincode *</Label>
              <Input
                id="addr-pincode"
                value={form.pincode}
                onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                placeholder="6-digit pincode"
                className="h-10"
                required
              />
            </div>

            {/* Default Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="addr-default"
                checked={form.isDefault}
                onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="addr-default" className="text-sm font-normal">
                Set as default address
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : editingAddress ? (
                'Save Changes'
              ) : (
                'Add Address'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
