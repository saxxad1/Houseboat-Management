'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getPackageSectionStatus, togglePackageSectionStatus } from '@/lib/actions/packages';

export default function PackagesSectionToggle() {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getPackageSectionStatus();
        setIsVisible(status);
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
      const result = await togglePackageSectionStatus(checked);
      if (result && result.error) throw new Error(result.error);
      setIsVisible(checked);
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
