'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Search, Trash2, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { deleteRow, listRows, saveRow, type AdminRow } from '@/lib/admin/data';
import { statusColors } from '@/lib/admin/constants';
import { uploadHouseboatFile } from '@/lib/supabase/storage';
import type { AdminTableName } from '@/types/database';

export type ResourceField = {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'boolean' | 'tags' | 'image';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  colSpan?: 'full';
};

export type ResourceColumn = {
  key: string;
  label: string;
  type?: 'money' | 'status' | 'boolean' | 'image' | 'date' | 'tags';
};

interface AdminResourcePageProps {
  table: AdminTableName;
  title: string;
  description: string;
  fields: ResourceField[];
  columns: ResourceColumn[];
  searchKeys?: string[];
  addLabel?: string;
  storageFolder?: string;
}

const emptyRow = {};

function valueToString(value: unknown) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function normalizeForm(form: Record<string, unknown>, fields: ResourceField[]) {
  const next: Record<string, unknown> = { ...form };

  fields.forEach((field) => {
    const value = next[field.name];
    if (field.type === 'number') {
      next[field.name] = Number(value || 0);
    }
    if (field.type === 'boolean') {
      next[field.name] = Boolean(value);
    }
    if (field.type === 'tags') {
      next[field.name] = valueToString(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  });

  return next;
}

function renderCell(row: Record<string, unknown>, column: ResourceColumn) {
  const value = row[column.key];

  if (column.type === 'image') {
    return value ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={String(value)} alt="" className="h-12 w-16 rounded-md object-cover" />
    ) : (
      <span className="text-slate-400">No image</span>
    );
  }

  if (column.type === 'money') {
    return `৳${Number(value || 0).toLocaleString()}`;
  }

  if (column.type === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (column.type === 'status') {
    const status = valueToString(value);
    return <Badge variant="outline" className={statusColors[status] || 'bg-slate-50'}>{status}</Badge>;
  }

  if (column.type === 'tags') {
    const items = Array.isArray(value) ? value.slice(0, 3) : valueToString(value).split(',').slice(0, 3);
    return (
      <div className="flex flex-wrap gap-1">
        {items.filter(Boolean).map((item) => (
          <Badge key={String(item)} variant="secondary" className="text-[10px]">{String(item)}</Badge>
        ))}
      </div>
    );
  }

  return <span className="line-clamp-2">{valueToString(value) || '-'}</span>;
}

export default function AdminResourcePage({
  table,
  title,
  description,
  fields,
  columns,
  searchKeys = [],
  addLabel = 'Add new',
  storageFolder,
}: AdminResourcePageProps) {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<Record<string, unknown>>(emptyRow);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await listRows(table));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Data load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const lower = query.toLowerCase();
    return rows.filter((row) =>
      (searchKeys.length ? searchKeys : columns.map((column) => column.key)).some((key) =>
        valueToString((row as Record<string, unknown>)[key]).toLowerCase().includes(lower)
      )
    );
  }, [columns, query, rows, searchKeys]);

  const edit = (row?: AdminRow) => {
    setMessage('');
    setForm(row ? { ...(row as Record<string, unknown>) } : {});
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const missingField = fields.find((field) => field.required && !valueToString(form[field.name]).trim());
      if (missingField) {
        throw new Error(`${missingField.label} is required`);
      }
      await saveRow(table, normalizeForm(form, fields));
      setOpen(false);
      await load();
      setMessage('Saved successfully');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this item?')) return;
    setMessage('');
    try {
      await deleteRow(table, id);
      await load();
      setMessage('Deleted successfully');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const handleUpload = async (fieldName: string, file?: File) => {
    if (!file) return;
    setSaving(true);
    try {
      const url = await uploadHouseboatFile('houseboat-media', storageFolder || table, file);
      setForm((current) => ({ ...current, [fieldName]: url }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <Button onClick={() => edit()} className="w-full gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search..." className="pl-9" />
            </div>
            {message && <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">{message}</div>}
          </div>

          <div className="rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key}>{column.label}</TableHead>
                  ))}
                  <TableHead className="w-[120px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={columns.length + 1}>Loading...</TableCell></TableRow>
                ) : filtered.length ? (
                  filtered.map((row) => (
                    <TableRow key={row.id}>
                      {columns.map((column) => (
                        <TableCell key={column.key}>{renderCell(row as Record<string, unknown>, column)}</TableCell>
                      ))}
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => edit(row)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(row.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={columns.length + 1} className="py-10 text-center text-slate-500">No data found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit item' : addLabel}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const value = form[field.name];
              const commonClass = field.colSpan === 'full' ? 'sm:col-span-2' : '';

              if (field.type === 'textarea' || field.type === 'tags') {
                return (
                  <div key={field.name} className={`space-y-2 ${field.type === 'textarea' ? 'sm:col-span-2' : commonClass}`}>
                    <Label>{field.label}</Label>
                    <Textarea
                      value={valueToString(value)}
                      placeholder={field.placeholder}
                      onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                      rows={field.type === 'tags' ? 2 : 4}
                    />
                  </div>
                );
              }

              if (field.type === 'select') {
                return (
                  <div key={field.name} className={`space-y-2 ${commonClass}`}>
                    <Label>{field.label}</Label>
                    <Select value={valueToString(value)} onValueChange={(next) => setForm((current) => ({ ...current, [field.name]: next }))}>
                      <SelectTrigger><SelectValue placeholder={field.placeholder || 'Select'} /></SelectTrigger>
                      <SelectContent>
                        {(field.options || []).map((option) => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              if (field.type === 'boolean') {
                return (
                  <div key={field.name} className={`flex items-center justify-between rounded-lg border border-slate-200 p-3 ${commonClass}`}>
                    <Label>{field.label}</Label>
                    <Switch checked={Boolean(value)} onCheckedChange={(checked) => setForm((current) => ({ ...current, [field.name]: checked }))} />
                  </div>
                );
              }

              if (field.type === 'image') {
                return (
                  <div key={field.name} className={`space-y-2 ${commonClass}`}>
                    <Label>{field.label}</Label>
                    <div className="flex min-w-0 gap-2">
                      <Input
                        className="min-w-0"
                        value={valueToString(value)}
                        placeholder={field.placeholder || 'Image URL'}
                        onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                      />
                      <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-slate-200 px-3 text-sm hover:bg-slate-50">
                        <Upload className="h-4 w-4" />
                        <input type="file" accept="image/*" className="hidden" onChange={(event) => handleUpload(field.name, event.target.files?.[0])} />
                      </label>
                    </div>
                  </div>
                );
              }

              return (
                <div key={field.name} className={`space-y-2 ${commonClass}`}>
                  <Label>{field.label}</Label>
                  <Input
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                    value={valueToString(value)}
                    placeholder={field.placeholder}
                    onChange={(event) => setForm((current) => ({ ...current, [field.name]: event.target.value }))}
                  />
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
