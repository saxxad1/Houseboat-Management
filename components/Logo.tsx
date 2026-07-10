'use client';

import Image from 'next/image';
import { usePublicData } from '@/components/PublicDataProvider';
import { FLOATBOAT_BRAND, normalizeBrandLogoUrl } from '@/lib/branding';

interface LogoProps {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export default function Logo({ className = '', imageClassName = '', priority = false }: LogoProps) {
  const { siteConfig } = usePublicData();

  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src={normalizeBrandLogoUrl(siteConfig.logoUrl) || FLOATBOAT_BRAND.logoUrl}
        alt={`${siteConfig.name} logo`}
        width={930}
        height={260}
        priority={priority}
        className={`h-auto w-full object-contain ${imageClassName}`}
      />
    </span>
  );
}
