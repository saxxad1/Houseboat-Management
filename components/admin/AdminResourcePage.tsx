'use client';

import { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Search, Trash2, Upload, Video } from 'lucide-react';
import { toast } from 'sonner';
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
import { isVideoUrl } from '@/lib/videoUtils';
import type { AdminTableName } from '@/types/database';

export type ResourceField = {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'boolean' | 'tags' | 'image' | 'images';
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  min?: number;
  colSpan?: 'full';
};

export type ResourceColumn = {
  key: string;
  label: string;
  type?: 'money' | 'status' | 'boolean' | 'image' | 'images' | 'date' | 'tags';
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

function getDefaultForm(fields: ResourceField[]) {
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    if (field.defaultValue !== undefined) {
      acc[field.name] = field.defaultValue;
      return acc;
    }
    if (field.type === 'select') {
      acc[field.name] = field.options?.[0]?.value || '';
      return acc;
    }
    if (field.type === 'boolean') {
      acc[field.name] = false;
      return acc;
    }
    if (field.type === 'number') {
      acc[field.name] = 0;
      return acc;
    }
    if (field.type === 'tags') {
      acc[field.name] = '';
      return acc;
    }
    acc[field.name] = '';
    return acc;
  }, {});
}

function valueToString(value: unknown) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function createSlug(value: unknown) {
  const base = valueToString(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0980-\u09ffa-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return base || `item-${Date.now()}`;
}

function normalizeForm(form: Record<string, unknown>, fields: ResourceField[]) {
  const next: Record<string, unknown> = { ...form };

  if ('slug' in next && !valueToString(next.slug).trim()) {
    next.slug = createSlug(next.name || next.title);
  }

  fields.forEach((field) => {
    const value = next[field.name];
    if (field.type === 'number') {
      const numberValue = Number(value || field.defaultValue || 0);
      next[field.name] = typeof field.min === 'number' ? Math.max(numberValue, field.min) : numberValue;
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
    if (field.type === 'select' && value === 'none') {
      next[field.name] = null;
    }
  });

  // Hack for capacity: allow "2-3" strings to be saved in an integer column by encoding it
  if ('capacity' in next && typeof next.capacity === 'string' && next.capacity.includes('-')) {
    const parts = next.capacity.split('-');
    if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      next.capacity = parseInt(parts[0], 10) * 1000 + parseInt(parts[1], 10);
    }
  } else if ('capacity' in next) {
    next.capacity = parseInt(String(next.capacity).replace(/\D/g, ''), 10) || 2;
  }

  return next;
}

function renderCell(row: Record<string, unknown>, column: ResourceColumn) {
  const value = row[column.key];

  if (column.type === 'image' || column.type === 'images') {
    const images = column.type === 'images' ? valueToString(value).split(',').filter(Boolean) : [valueToString(value)].filter(Boolean);
    const firstImage = images[0];

    if (firstImage && isVideoUrl(firstImage)) {
      return (
        <div className="h-12 w-16 rounded-md bg-slate-100 flex flex-col items-center justify-center border border-slate-200">
          <Video className="w-5 h-5 text-slate-500 mb-0.5" />
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Video</span>
        </div>
      );
    }

    return firstImage ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={firstImage} alt="Resource preview" className="h-12 w-16 rounded-md object-cover" />
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

  // Decode capacity
  if (column.key === 'capacity' && typeof value === 'number' && value >= 1000) {
    return <span className="line-clamp-2">{`${Math.floor(value / 1000)}-${value % 1000}`}</span>;
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
  renderTop,
}: AdminResourcePageProps & { renderTop?: (rows: AdminRow[]) => React.ReactNode }) {
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
    const newForm = row ? { ...getDefaultForm(fields), ...(row as Record<string, unknown>) } : getDefaultForm(fields);
    
    // Decode capacity
    if (newForm.capacity && typeof newForm.capacity === 'number' && newForm.capacity >= 1000) {
      newForm.capacity = `${Math.floor(newForm.capacity / 1000)}-${newForm.capacity % 1000}`;
    }
    
    setForm(newForm);
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const normalizedForm = normalizeForm(form, fields);
      const missingField = fields.find((field) => field.required && !valueToString(normalizedForm[field.name]).trim());
      if (missingField) {
        throw new Error(`${missingField.label} is required`);
      }
      const invalidNumberField = fields.find((field) =>
        field.type === 'number'
        && typeof field.min === 'number'
        && Number(normalizedForm[field.name]) < field.min
      );
      if (invalidNumberField) {
        throw new Error(`${invalidNumberField.label} must be at least ${invalidNumberField.min}`);
      }
      await saveRow(table, normalizedForm);
      setOpen(false);
      await load();
      window.dispatchEvent(new Event('kuhelika-public-data-change'));
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
      window.dispatchEvent(new Event('kuhelika-public-data-change'));
      setMessage('Deleted successfully');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const handleUpload = async (fieldName: string, file?: File, isMultiple?: boolean) => {
    if (!file) return;
    setSaving(true);
    const toastId = toast.loading('Uploading image...');
    try {
      const url = await uploadHouseboatFile('houseboat-media', storageFolder || table, file);
      setForm((current) => {
        if (isMultiple) {
          const existing = valueToString(current[fieldName]).split(',').filter(Boolean);
          return { ...current, [fieldName]: [...existing, url].join(',') };
        }
        return { ...current, [fieldName]: url };
      });
      toast.success('Image uploaded successfully', { id: toastId });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Upload failed';
      setMessage(errorMsg);
      toast.error(errorMsg, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const removeImage = (fieldName: string, indexToRemove: number) => {
    setForm((current) => {
      const existing = valueToString(current[fieldName]).split(',').filter(Boolean);
      return { ...current, [fieldName]: existing.filter((_, i) => i !== indexToRemove).join(',') };
    });
  };

  return (
    <div className="space-y-5">
      {renderTop?.(rows)}
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
                const selectValue = value === null || value === undefined || value === '' ? (field.options?.[0]?.value || '') : valueToString(value);
                return (
                  <div key={field.name} className={`space-y-2 ${commonClass}`}>
                    <Label>{field.label}</Label>
                    <Select value={selectValue} onValueChange={(next) => setForm((current) => ({ ...current, [field.name]: next }))}>
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
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              await handleUpload(field.name, file);
                            }
                            event.target.value = '';
                          }} 
                        />
                      </label>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">Upload an image or paste a YouTube/Facebook video link.</p>
                  </div>
                );
              }

              if (field.type === 'images') {
                const images = valueToString(value).split(',').filter(Boolean);
                return (
                  <div key={field.name} className={`space-y-3 ${commonClass}`}>
                    <Label>{field.label}</Label>
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative group aspect-video rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt="Image preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(field.name, idx)}
                              className="absolute top-1 right-1 p-1 bg-white/90 rounded-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200 transition-colors">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              await handleUpload(field.name, file, true);
                            }
                            event.target.value = ''; // Reset input to allow selecting the same file again
                          }} 
                        />
                      </label>
                      <span className="text-xs text-slate-500">You can upload multiple images (one by one).</span>
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
