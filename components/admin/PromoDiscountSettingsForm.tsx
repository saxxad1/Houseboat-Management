'use client';

import { useState, useEffect } from 'react';
import { listRows, saveRow } from '@/lib/admin/data';
import type { HouseboatSettings } from '@/types/database';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PromoDiscountSettingsForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [form, setForm] = useState({
    promo_discount_percent: '',
    promo_discount_start_date: '',
    promo_discount_end_date: '',
    promo_discount_title: '',
  });

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      setError(null);
      try {
        const rows = await listRows<HouseboatSettings>('houseboat_settings');
        const data = rows.length > 0 ? rows[0] : null;

        if (data) {
          setSettingsId(data.id);
          setForm({
            promo_discount_percent: data.promo_discount_percent ? String(data.promo_discount_percent) : '',
            promo_discount_start_date: data.promo_discount_start_date || '',
            promo_discount_end_date: data.promo_discount_end_date || '',
            promo_discount_title: data.promo_discount_title || '',
          });
        } else {
          setError('No houseboat settings found. Please go to the Settings tab and add Houseboat Settings first.');
        }
      } catch (err: any) {
        console.error('Failed to load promo settings:', err);
        setError(err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await saveRow<HouseboatSettings>('houseboat_settings', {
        id: settingsId,
        promo_discount_percent: form.promo_discount_percent ? parseInt(form.promo_discount_percent, 10) : null,
        promo_discount_start_date: form.promo_discount_start_date || null,
        promo_discount_end_date: form.promo_discount_end_date || null,
        promo_discount_title: form.promo_discount_title || null,
      });

      setSuccess('Promotional discount settings updated successfully');
      
      // Auto hide success message
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to save promo settings:', err);
      // If the column doesn't exist, it usually throws a PGRST204 or similar error
      if (err.message && (err.message.includes('Could not find the') || err.message.includes('column'))) {
        setError('Database migration is missing! Please run the SQL file in your Supabase Dashboard.');
      } else {
        setError(err.message || 'Failed to save settings');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-500 animate-pulse">Loading promo settings...</div>;
  }

  return (
    <Card className="mb-8 border-indigo-100 shadow-sm">
      <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-50">
        <CardTitle className="text-lg text-indigo-900">Promotional Discount</CardTitle>
        <CardDescription>
          Set a global percentage discount for a specific date range. This will override the default weekday discount on the website.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
          {success && <div className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-md">{success}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="promo_discount_percent">Discount Percentage (%)</Label>
              <Input
                id="promo_discount_percent"
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 20"
                value={form.promo_discount_percent}
                onChange={(e) => setForm({ ...form, promo_discount_percent: e.target.value })}
              />
              <p className="text-xs text-slate-500">Leave blank or 0 to disable</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promo_discount_title">Promotion Title</Label>
              <Input
                id="promo_discount_title"
                type="text"
                placeholder="e.g. Monsoon Special Offer"
                value={form.promo_discount_title}
                onChange={(e) => setForm({ ...form, promo_discount_title: e.target.value })}
              />
              <p className="text-xs text-slate-500">Shown to users on the website</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promo_discount_start_date">Start Date</Label>
              <Input
                id="promo_discount_start_date"
                type="date"
                value={form.promo_discount_start_date}
                onChange={(e) => setForm({ ...form, promo_discount_start_date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="promo_discount_end_date">End Date</Label>
              <Input
                id="promo_discount_end_date"
                type="date"
                value={form.promo_discount_end_date}
                onChange={(e) => setForm({ ...form, promo_discount_end_date: e.target.value })}
              />
            </div>
          </div>
          
          <div className="pt-4">
            <Button type="submit" disabled={saving || !settingsId} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? 'Saving...' : 'Save Promotion'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
