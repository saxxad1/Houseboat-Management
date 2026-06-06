'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Eye, Loader2, Save, Ship, Waves } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSeasonalData, normalizeSeason, seasonMeta, type SeasonType } from '@/data/seasonalData';
import { listRows, saveRow } from '@/lib/admin/data';
import { isReadOnlyAdminForTable } from '@/lib/admin/permissions';
import { cn } from '@/lib/utils';
import type { HouseboatSettings } from '@/types/database';

const seasonOptions: Array<{ value: SeasonType; title: string; subtitle: string }> = [
  {
    value: 'haor',
    title: 'Active Haor Season',
    subtitle: 'Tanguar Haor overnight houseboat website',
  },
  {
    value: 'padma',
    title: 'Active Padma Season',
    subtitle: 'Padma River event cruise website',
  },
];

export default function SeasonSettingsPage() {
  const [settings, setSettings] = useState<HouseboatSettings | null>(null);
  const [activeSeason, setActiveSeason] = useState<SeasonType>('haor');
  const [savedSeason, setSavedSeason] = useState<SeasonType>('haor');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    setReadOnly(isReadOnlyAdminForTable('houseboat_settings'));
    async function load() {
      const rows = await listRows<HouseboatSettings>('houseboat_settings');
      const row = rows[0] || null;
      const storedSeason = normalizeSeason(row?.active_season || window.localStorage.getItem('kuhelika-active-season'));
      setSettings(row);
      setActiveSeason(storedSeason);
      setSavedSeason(storedSeason);
      window.localStorage.setItem('kuhelika-active-season', storedSeason);
      setLoading(false);
    }

    load().catch(() => {
      const fallbackSeason = normalizeSeason(window.localStorage.getItem('kuhelika-active-season'));
      setActiveSeason(fallbackSeason);
      setSavedSeason(fallbackSeason);
      setLoading(false);
    });
  }, []);

  const data = useMemo(() => getSeasonalData(activeSeason), [activeSeason]);
  const meta = seasonMeta[activeSeason];
  const dirty = activeSeason !== savedSeason;

  const save = async () => {
    if (readOnly) return;
    setSaving(true);
    setMessage('');
    const timestamp = new Date().toISOString();
    try {
      const saved = await saveRow<HouseboatSettings>('houseboat_settings', {
        id: settings?.id,
        houseboat_name: settings?.houseboat_name || 'Kuhelika',
        tagline: settings?.tagline || data.site.tagline,
        description: settings?.description || data.site.description,
        phone: settings?.phone || data.site.phone,
        whatsapp: settings?.whatsapp || data.site.whatsapp,
        email: settings?.email || data.site.email,
        facebook_url: settings?.facebook_url || data.site.facebook,
        location: settings?.location || data.site.location,
        address: settings?.address || data.site.locationEn,
        bkash_number: settings?.bkash_number || '',
        nagad_number: settings?.nagad_number || '',
        bank_info: settings?.bank_info || '',
        primary_color: settings?.primary_color || '#075985',
        secondary_color: settings?.secondary_color || '#f59e0b',
        logo_url: settings?.logo_url || '/logo-kuhelika-clean.png',
        active_season: activeSeason,
        season_updated_at: timestamp,
      });
      setSettings(saved);
      setSavedSeason(activeSeason);
      window.localStorage.setItem('kuhelika-active-season', activeSeason);
      window.dispatchEvent(new Event('kuhelika-season-change'));
      setMessage('Season mode saved. Public website will now show content for this season.');
    } catch {
      setMessage('Save failed. Check Supabase connection/permission. In Demo mode, local switch will work.');
      window.localStorage.setItem('kuhelika-active-season', activeSeason);
      window.dispatchEvent(new Event('kuhelika-season-change'));
      setSavedSeason(activeSeason);
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
            <Waves className="h-5 w-5 text-[hsl(197,80%,30%)]" />
            Active Season Switch
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {seasonOptions.map((option) => {
            const selected = activeSeason === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (!readOnly) setActiveSeason(option.value);
                }}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all',
                  selected
                    ? 'border-[hsl(197,80%,30%)] bg-[hsl(195,95%,92%)] shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                  readOnly && 'cursor-default hover:border-slate-200 hover:bg-white'
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold text-slate-900">{option.title}</div>
                  {selected && <CheckCircle2 className="h-5 w-5 text-[hsl(197,80%,30%)]" />}
                </div>
                <p className="mt-1 text-sm text-slate-500">{option.subtitle}</p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Active Season</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Season</span>
              <Badge className="bg-[hsl(197,80%,30%)] text-white">{meta.adminName}</Badge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Location</span>
              <span className="text-right font-semibold text-slate-900">{meta.location}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Booking type</span>
              <span className="text-right font-semibold text-slate-900">{meta.bookingMode}</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Current hero title</div>
              <div className="mt-1 font-bold text-slate-900">{data.hero.subtitle}</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <div className="text-xs text-slate-500">Current CTA text</div>
              <div className="mt-1 font-bold text-slate-900">{data.hero.primaryCta}</div>
            </div>
            <div className="text-xs text-slate-400">
              Last updated: {settings?.season_updated_at ? new Date(settings.season_updated_at).toLocaleString('bn-BD') : 'Not saved yet'}
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="h-5 w-5 text-[hsl(197,80%,30%)]" />
              Season Content Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hero title</div>
              <div className="mt-2 text-lg font-bold text-slate-900">{data.hero.subtitle}</div>
              <p className="mt-1 text-sm text-slate-500">{data.hero.locationBadge}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Booking focus</div>
              <div className="mt-2 text-lg font-bold text-slate-900">{meta.bookingMode}</div>
              <p className="mt-1 text-sm text-slate-500">{meta.location}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Booking form mode</div>
              <div className="mt-2 flex items-center gap-2 font-bold text-slate-900">
                <Ship className="h-4 w-4 text-[hsl(197,80%,30%)]" />
                {activeSeason === 'padma' ? 'Event booking request' : 'Houseboat/cabin booking request'}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Availability mode</div>
              <div className="mt-2 flex items-center gap-2 font-bold text-slate-900">
                <CalendarClock className="h-4 w-4 text-[hsl(197,80%,30%)]" />
                {activeSeason === 'padma' ? 'Date + event slots' : 'Date + cabin availability'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-semibold text-slate-900">
            {dirty ? 'Season changed, click Save.' : 'Season settings updated.'}
          </div>
          {message && <div className="mt-1 text-sm text-slate-500">{message}</div>}
        </div>
        {!readOnly && (
          <Button onClick={save} disabled={saving || !dirty} className="gap-2 bg-[hsl(197,80%,30%)] hover:bg-[hsl(197,80%,24%)]">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Season
          </Button>
        )}
      </div>
    </div>
  );
}
