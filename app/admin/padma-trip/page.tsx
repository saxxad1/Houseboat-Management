'use client';

import { useEffect, useState } from 'react';
import { CalendarClock, CheckCircle2, Loader2, Map, Save, Ship, Users, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { listRows, saveRow } from '@/lib/admin/data';
import { isReadOnlyAdminForTable } from '@/lib/admin/permissions';
import type { HouseboatSettings } from '@/types/database';

const padmaDetails = [
  {
    icon: CalendarClock,
    title: 'Trip Type',
    desc: 'Padma Day Long trip from morning to evening. No room-wise booking.',
  },
  {
    icon: Users,
    title: 'Room Sharing',
    desc: 'Rooms are fresh-up/rest facilities. Usually 4-6 guests share a room.',
  },
  {
    icon: CheckCircle2,
    title: 'Separate Allocation',
    desc: 'Male and female guests are allocated separate rooms. Mixed room sharing is not allowed.',
  },
  {
    icon: Utensils,
    title: 'Food',
    desc: 'Breakfast, lunch, tea-biscuits and live BBQ arrangement.',
  },
  {
    icon: Map,
    title: 'Sightseeing',
    desc: 'Padma cruising, Padma Bridge view, white char and seasonal photo stop.',
  },
  {
    icon: Ship,
    title: 'Booking Flow',
    desc: 'Guests select date and guest count only. Floatbase team manages room allocation.',
  },
];

export default function PadmaTripAdminPage() {
  const [settings, setSettings] = useState<HouseboatSettings | null>(null);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    setReadOnly(isReadOnlyAdminForTable('houseboat_settings'));
    async function load() {
      const rows = await listRows<HouseboatSettings>('houseboat_settings');
      const row = rows[0] || null;
      setSettings(row);
      setPrice(Number(row?.padma_price_per_person || 0));
      setLoading(false);
    }

    load().catch((error) => {
      setMessage(error instanceof Error ? error.message : 'Failed to load Padma trip settings');
      setLoading(false);
    });
  }, []);

  const save = async () => {
    if (readOnly) return;
    setSaving(true);
    setMessage('');
    try {
      const saved = await saveRow<HouseboatSettings>('houseboat_settings', {
        ...settings,
        id: settings?.id,
        houseboat_name: settings?.houseboat_name || 'Floatbase',
        padma_price_per_person: Math.max(Number(price || 0), 0),
      });
      setSettings(saved);
      setPrice(Number(saved.padma_price_per_person || 0));
      window.dispatchEvent(new Event('floatboat-public-data-change'));
      setMessage('Padma trip price saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Ship className="h-5 w-5 text-[hsl(197,80%,30%)]" />
            Padma Day Long Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="padma-price">Price per person</Label>
            <Input
              id="padma-price"
              type="number"
              min={0}
              value={price}
              onChange={(event) => setPrice(Number(event.target.value || 0))}
              placeholder="2000"
              disabled={readOnly}
              className="max-w-md"
            />
            <p className="text-sm text-slate-500">
              Booking form total will be calculated as price per person x number of guests.
            </p>
          </div>
          {!readOnly && (
            <Button onClick={save} disabled={saving} className="gap-2 bg-[hsl(197,80%,30%)] hover:bg-[hsl(197,80%,24%)]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Padma Price
            </Button>
          )}
        </CardContent>
      </Card>

      {message && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {padmaDetails.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardContent className="p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(195,95%,92%)] text-[hsl(197,80%,30%)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="font-bold text-slate-900">{item.title}</div>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
