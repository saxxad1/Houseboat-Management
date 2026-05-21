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
    <div className="rounded-lg border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Room/Type</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length ? (
            bookings.map((booking) => {
              const customer = booking.customer_id ? customerMap.get(booking.customer_id) : null;
              const room = booking.room_id ? roomMap.get(booking.room_id) : null;
              const pkg = booking.package_id ? packageMap.get(booking.package_id) : null;
              return (
                <TableRow key={booking.id}>
                  <TableCell className="font-semibold">{booking.booking_code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{customer?.full_name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">{customer?.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div>{booking.check_in_date}</div>
                    <div className="text-xs text-slate-500">to {booking.check_out_date}</div>
                  </TableCell>
                  <TableCell>{booking.booking_type === 'full_boat' ? 'Full boat' : room?.name || '-'}</TableCell>
                  <TableCell>{pkg?.title || '-'}</TableCell>
                  <TableCell>
                    <div>৳{Number(booking.total_amount).toLocaleString()}</div>
                    <div className="text-xs text-red-500">Due ৳{Number(booking.due_amount).toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[booking.payment_status]}>
                      {paymentStatusLabels[booking.payment_status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[booking.booking_status]}>
                      {bookingStatusLabels[booking.booking_status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onEdit(booking)}>Edit</Button>
                      {booking.booking_status !== 'cancelled' && (
                        <Button variant="ghost" size="sm" onClick={() => onCancel(booking)}>Cancel</Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => onDelete(booking)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-slate-500">No bookings found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
