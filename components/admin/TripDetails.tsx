'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAdminDataset, saveRow } from '@/lib/admin/data';
import type { TripSlot } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Users, Wallet, ReceiptText, ArrowLeft, CalendarDays } from 'lucide-react';
import { currencyFormatter, bookingStatusLabels, statusColors } from '@/lib/admin/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ManualBooking {
  id: string;
  customer_name: string;
  phone: string;
  number_of_guests: number;
  total_amount: number;
}

interface ManualExpense {
  id: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  vendor_name: string;
  note: string;
}

interface ManualTripData {
  manualBookings: ManualBooking[];
  manualExpenses: ManualExpense[];
}

export function TripDetails({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<TripSlot | null>(null);
  const [tripIndex, setTripIndex] = useState<number>(0);
  
  const [manualBookings, setManualBookings] = useState<ManualBooking[]>([]);
  const [manualExpenses, setManualExpenses] = useState<ManualExpense[]>([]);
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  
  const [quickBookingForm, setQuickBookingForm] = useState({ customer_name: '', phone: '', number_of_guests: '2', total_amount: '0' });
  const [expenseForm, setExpenseForm] = useState({ title: '', category: 'food', amount: '', expense_date: new Date().toISOString().slice(0,10), vendor_name: '', note: '' });
  
  const [saving, setSaving] = useState(false);
  
  const handleSaveQuickBooking = async () => {
    if (!trip) return;
    setSaving(true);
    try {
      const newBooking: ManualBooking = {
        id: Math.random().toString(36).substr(2, 9),
        customer_name: quickBookingForm.customer_name,
        phone: quickBookingForm.phone,
        number_of_guests: Number(quickBookingForm.number_of_guests),
        total_amount: Number(quickBookingForm.total_amount)
      };
      
      const newBookings = [...manualBookings, newBooking];
      const payload = {
        manualBookings: newBookings,
        manualExpenses: manualExpenses
      };
      
      await saveRow('trip_slots', { id: trip.id, note: JSON.stringify(payload) });
      
      setManualBookings(newBookings);
      setIsBookingModalOpen(false);
      setQuickBookingForm({ customer_name: '', phone: '', number_of_guests: '2', total_amount: '0' });
      toast.success('Booking added successfully!');
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Failed to save booking');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExpense = async () => {
    if (!trip) return;
    setSaving(true);
    try {
      const newExpense: ManualExpense = {
        id: Math.random().toString(36).substr(2, 9),
        title: expenseForm.title,
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        expense_date: expenseForm.expense_date,
        vendor_name: expenseForm.vendor_name,
        note: expenseForm.note
      };
      
      const newExpenses = [...manualExpenses, newExpense];
      const payload = {
        manualBookings: manualBookings,
        manualExpenses: newExpenses
      };
      
      await saveRow('trip_slots', { id: trip.id, note: JSON.stringify(payload) });
      
      setManualExpenses(newExpenses);
      setIsExpenseModalOpen(false);
      setExpenseForm({ title: '', category: 'food', amount: '', expense_date: new Date().toISOString().slice(0,10), vendor_name: '', note: '' });
      toast.success('Expense added successfully!');
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };
  
  const loadData = useCallback(async () => {
    const data = await fetchAdminDataset();
      const foundTrip = data.trip_slots.find((t) => t.id === id);
      if (!foundTrip) {
        router.push('/admin/trips');
        return;
      }
      const sortedTrips = [...data.trip_slots].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
      const idx = sortedTrips.findIndex(t => t.id === id) + 1;
      
      setTrip(foundTrip);
      setTripIndex(idx);
      
      let parsedData: ManualTripData = { manualBookings: [], manualExpenses: [] };
      if (foundTrip.note) {
        try {
          parsedData = JSON.parse(foundTrip.note);
        } catch (e) {
          console.warn('Could not parse trip note as manual data');
        }
      }
      setManualBookings(parsedData.manualBookings || []);
      setManualExpenses(parsedData.manualExpenses || []);
      
      setLoading(false);
    }, [id, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !trip) {
    return <div className="p-8 text-center text-slate-500">Loading trip details...</div>;
  }

  const totalGuests = manualBookings.reduce((sum, b) => sum + (b.number_of_guests || 0), 0);
  const totalIncome = manualBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const totalExpense = manualExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/trips"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Trip {tripIndex}
          </h2>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
            <CalendarDays className="h-4 w-4" /> 
            {new Date(trip.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} 
            {' '}to{' '} 
            {new Date(trip.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Users className="h-4 w-4 text-sky-500" /> Total Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
            <p className="text-xs text-slate-500">{manualBookings.length} Bookings</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Wallet className="h-4 w-4 text-emerald-500" /> Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{currencyFormatter.format(totalIncome)}</div>
            <p className="text-xs text-slate-500">From manual bookings</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-red-500" /> Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{currencyFormatter.format(totalExpense)}</div>
            <p className="text-xs text-slate-500">{manualExpenses.length} Expense records</p>
          </CardContent>
        </Card>
        <Card className={`border-2 ${netProfit >= 0 ? 'border-emerald-100 bg-emerald-50/50' : 'border-red-100 bg-red-50/50'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Package className={`h-4 w-4 ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`} /> Net Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {currencyFormatter.format(netProfit)}
            </div>
            <p className="text-xs text-slate-500">Income minus Expenses</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-xl">
        <Tabs defaultValue="bookings" className="w-full">
          <div className="border-b border-slate-200 px-6 pt-4 flex justify-between items-center overflow-x-auto gap-4">
            <TabsList className="bg-transparent h-auto p-0 gap-6 border-b-0 justify-start flex-1 min-w-max">
              <TabsTrigger 
                value="bookings" 
                className="rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-[hsl(197,80%,30%)] data-[state=active]:text-[hsl(197,80%,30%)] data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Bookings ({manualBookings.length})
              </TabsTrigger>
              <TabsTrigger 
                value="expenses" 
                className="rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:border-[hsl(197,80%,30%)] data-[state=active]:text-[hsl(197,80%,30%)] data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                Expenses ({manualExpenses.length})
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="bookings" className="p-0 m-0 w-full overflow-hidden">
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manualBookings.map((booking) => {
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium text-slate-900">Manual</TableCell>
                        <TableCell>
                          <div className="font-semibold text-slate-800">{booking.customer_name}</div>
                          <div className="text-xs text-slate-500">{booking.phone}</div>
                        </TableCell>
                        <TableCell>{booking.number_of_guests} Pax</TableCell>
                        <TableCell className="font-semibold text-[hsl(197,80%,30%)]">
                          {currencyFormatter.format(Number(booking.total_amount || 0))}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold border ${statusColors.pending}`}>
                            Pending
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={async () => {
                            if (!trip) return;
                            const newBookings = manualBookings.filter(b => b.id !== booking.id);
                            const payload = { manualBookings: newBookings, manualExpenses };
                            await saveRow('trip_slots', { id: trip.id, note: JSON.stringify(payload) });
                            setManualBookings(newBookings);
                            toast.success('Removed');
                          }}>
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {manualBookings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                        No manual bookings found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setIsBookingModalOpen(true)}>
                Add Booking
              </Button>
            </div>
          </TabsContent>



          <TabsContent value="expenses" className="p-0 m-0 w-full overflow-hidden">
            <div className="overflow-x-auto w-full">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manualExpenses.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="text-slate-500">{exp.expense_date}</TableCell>
                      <TableCell className="font-medium text-slate-900">{exp.title}</TableCell>
                      <TableCell className="capitalize text-slate-500">{exp.category.replace('_', ' ')}</TableCell>
                      <TableCell className="text-slate-500">{exp.vendor_name || '-'}</TableCell>
                      <TableCell className="text-right font-semibold text-red-600">
                        -{currencyFormatter.format(Number(exp.amount || 0))}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={async () => {
                          if (!trip) return;
                          const newExpenses = manualExpenses.filter(e => e.id !== exp.id);
                          const payload = { manualBookings, manualExpenses: newExpenses };
                          await saveRow('trip_slots', { id: trip.id, note: JSON.stringify(payload) });
                          setManualExpenses(newExpenses);
                          toast.success('Removed');
                        }}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {manualExpenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                        No expenses recorded for this trip.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setIsExpenseModalOpen(true)}>
                Add Expense
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Booking (Trip {tripIndex})</DialogTitle>
            <DialogDescription>Quickly add a booking with just 4 basic details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input value={quickBookingForm.customer_name} onChange={e => setQuickBookingForm({...quickBookingForm, customer_name: e.target.value})} placeholder="e.g., John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={quickBookingForm.phone} onChange={e => setQuickBookingForm({...quickBookingForm, phone: e.target.value})} placeholder="e.g., 017XXXXXXXX" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Guests</Label>
                <Input type="number" min="1" value={quickBookingForm.number_of_guests} onChange={e => setQuickBookingForm({...quickBookingForm, number_of_guests: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <Input type="number" min="0" value={quickBookingForm.total_amount} onChange={e => setQuickBookingForm({...quickBookingForm, total_amount: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveQuickBooking} disabled={saving || !quickBookingForm.customer_name || !quickBookingForm.phone}>
              {saving ? 'Saving...' : 'Save Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense for Trip {tripIndex}</DialogTitle>
            <DialogDescription>Record an expense specifically for this trip slot.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={expenseForm.title} onChange={e => setExpenseForm({...expenseForm, title: e.target.value})} placeholder="e.g., Fuel, Grocery" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={expenseForm.category} onValueChange={val => setExpenseForm({...expenseForm, category: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food & Beverage</SelectItem>
                    <SelectItem value="fuel">Fuel & Transport</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input type="number" min="0" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Vendor (Optional)</Label>
              <Input value={expenseForm.vendor_name} onChange={e => setExpenseForm({...expenseForm, vendor_name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Note (Optional)</Label>
              <Textarea value={expenseForm.note} onChange={e => setExpenseForm({...expenseForm, note: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpenseModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveExpense} disabled={saving || !expenseForm.title || !expenseForm.amount}>
              {saving ? 'Saving...' : 'Save Expense'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
