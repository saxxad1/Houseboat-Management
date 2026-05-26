'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { listRows, saveRow } from '@/lib/admin/data';
import type { WebsiteContent } from '@/types/database';

export default function PackagesSectionToggle() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const content = await listRows<WebsiteContent>('website_content');
        setIsVisible(content.find((row) => row.section_key === 'packages')?.is_active ?? true);
      } catch (error) {
        console.error('Failed to load status', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleToggle = async (checked: boolean) => {
    try {
      setIsLoading(true);
      const content = await listRows<WebsiteContent>('website_content');
      const existing = content.find((row) => row.section_key === 'packages');
      await saveRow<WebsiteContent>('website_content', {
        id: existing?.id,
        section_key: 'packages',
        is_active: checked,
        title: existing?.title || 'Tour Packages',
        subtitle: existing?.subtitle || 'Choose from our carefully crafted itineraries for the perfect getaway.',
      });
      setIsVisible(checked);
      window.dispatchEvent(new Event('kuhelika-public-data-change'));
      toast.success(checked ? 'Tour Packages section is now visible on the website' : 'Tour Packages section is now hidden from the website');
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle section visibility');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between bg-slate-100/50 p-4 rounded-xl border border-slate-200 mb-2">
      <div>
        <h3 className="font-semibold text-slate-800">Tour Packages Visibility</h3>
        <p className="text-sm text-slate-500">Toggle this to show or hide the Tour Packages section on the main website.</p>
      </div>
      <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
        <Switch
          id="packages-section-visibility"
          checked={isVisible}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
        <Label htmlFor="packages-section-visibility" className="cursor-pointer font-medium">
          {isVisible ? 'Section ON' : 'Section OFF'}
        </Label>
      </div>
    </div>
  );
}
