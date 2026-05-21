'use client';

import Image from 'next/image';
import { usePublicData } from '@/components/PublicDataProvider';

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
        src={siteConfig.logoUrl || '/logo-kuhelika-clean.png'}
        alt={`${siteConfig.name} logo`}
        width={242}
        height={172}
        priority={priority}
        className={`h-auto w-full object-contain ${imageClassName}`}
      />
    </span>
  );
}
