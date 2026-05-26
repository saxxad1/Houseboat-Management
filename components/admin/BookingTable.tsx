'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { bookingStatusLabels, paymentStatusLabels, statusColors } from '@/lib/admin/constants';
import type { Booking, Customer, Room, TourPackage } from '@/types/database';

interface BookingTableProps {
  bookings: Booking[];
  customers: Customer[];
  rooms: Room[];
  packages: TourPackage[];
  onEdit: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
}

export default function BookingTable({
  bookings,
  customers,
  rooms,
  packages,
  onEdit,
  onCancel,
  onDelete,
}: BookingTableProps) {
  const customerMap = new Map(customers.map((customer) => [customer.id, customer]));
  const roomMap = new Map(rooms.map((room) => [room.id, room]));
  const packageMap = new Map(packages.map((pkg) => [pkg.id, pkg]));

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden">
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-b border-slate-100/50 hover:bg-transparent">
              <TableHead className="font-bold text-slate-500 whitespace-nowrap py-4">Code</TableHead>
              <TableHead className="font-bold text-slate-500 whitespace-nowrap">Season</TableHead>
              <TableHead className="font-bold text-slate-500 whitespace-nowrap">Customer</TableHead>
              <TableHead className="font-bold text-slate-500 whitespace-nowrap">Date</TableHead>
              <TableHead className="font-bold text-slate-500 whitespace-nowrap">Type / Slot</TableHead>
              <TableHead className="font-bold text-slate-500 whitespace-nowrap">Package</TableHead>
              <TableHead className="font-bold text-slate-500 whitespace-nowrap">Amount</TableHead>
              <TableHead className="font-bold text-slate-500 whitespace-nowrap">Payment</TableHead>
              <TableHead className="font-bold text-slate-500 whitespace-nowrap">Status</TableHead>
              <TableHead className="font-bold text-slate-500 whitespace-nowrap text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length ? (
              bookings.map((booking) => {
                const customer = booking.customer_id ? customerMap.get(booking.customer_id) : null;
                const room = booking.room_id ? roomMap.get(booking.room_id) : null;
                const pkg = booking.package_id ? packageMap.get(booking.package_id) : null;
                return (
                  <TableRow key={booking.id} className="border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-black text-slate-700">{booking.booking_code}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={(booking.season_type || 'haor') === 'padma' ? 'border-indigo-100 bg-indigo-50/80 text-indigo-700 shadow-sm shadow-indigo-100/50' : 'border-emerald-100 bg-emerald-50/80 text-emerald-700 shadow-sm shadow-emerald-100/50'}>
                        {(booking.season_type || 'haor') === 'padma' ? 'Padma' : 'Haor'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-800">{customer?.full_name || 'Unknown'}</div>
                      <div className="text-[11px] font-semibold text-slate-400 mt-0.5">{customer?.phone}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-700">{booking.event_date || booking.check_in_date}</div>
                      <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                        {(booking.season_type || 'haor') === 'padma' ? booking.event_slot || 'event slot' : `to ${booking.check_out_date}`}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-slate-600">{(booking.season_type || 'haor') === 'padma' ? booking.event_type || 'Event' : booking.booking_type === 'full_boat' ? 'Full boat' : room?.name || '-'}</TableCell>
                    <TableCell className="font-medium text-slate-600">{pkg?.title || '-'}</TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-700">৳{Number(booking.total_amount).toLocaleString()}</div>
                      <div className="text-[11px] font-bold text-rose-500 mt-0.5">Due ৳{Number(booking.due_amount).toLocaleString()}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColors[booking.payment_status]} bg-opacity-80 shadow-sm border-opacity-50`}>
                        {paymentStatusLabels[booking.payment_status]}
                      </Badge>
                      {booking.transaction_id && (
                        <div className="text-[11px] font-medium text-slate-500 mt-1 truncate max-w-[100px]" title={booking.transaction_id}>
                          Txn: {booking.transaction_id}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${statusColors[booking.booking_status]} bg-opacity-80 shadow-sm border-opacity-50`}>
                        {bookingStatusLabels[booking.booking_status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1 bg-slate-100/50 rounded-lg p-1 backdrop-blur-sm">
                        <Button variant="ghost" size="sm" className="h-8 hover:bg-white hover:shadow-sm" onClick={() => onEdit(booking)}>Edit</Button>
                        {booking.booking_status !== 'cancelled' && (
                          <Button variant="ghost" size="sm" className="h-8 hover:bg-white hover:shadow-sm" onClick={() => onCancel(booking)}>Cancel</Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 hover:shadow-sm" onClick={() => onDelete(booking)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="py-16 text-center">
                  <div className="text-slate-400 font-medium">No bookings found</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
