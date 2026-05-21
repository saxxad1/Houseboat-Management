'use client';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ReportTableProps {
  title: string;
  rows: Record<string, string | number>[];
}

export default function ReportTable({ title, rows }: ReportTableProps) {
  const columns = rows[0] ? Object.keys(rows[0]) : [];

  const exportCsv = () => {
    const csv = [columns.join(','), ...rows.map((row) => columns.map((column) => JSON.stringify(row[column] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!rows.length} className="w-full sm:w-auto">Export CSV</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => <TableHead key={column}>{column}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? rows.map((row, index) => (
            <TableRow key={index}>
              {columns.map((column) => <TableCell key={column}>{row[column]}</TableCell>)}
            </TableRow>
          )) : <TableRow><TableCell className="py-8 text-center text-slate-500">No report data</TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  );
}
