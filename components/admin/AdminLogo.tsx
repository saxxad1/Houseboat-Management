import Image from 'next/image';

interface AdminLogoProps {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  variant?: 'stacked' | 'wide';
}

const logoConfig = {
  stacked: {
    src: '/admin-logo-floatbase.svg',
    width: 760,
    height: 520,
  },
  wide: {
    src: '/admin-logo-floatbase-wide.svg',
    width: 1120,
    height: 360,
  },
} as const;

export default function AdminLogo({
  className = '',
  imageClassName = '',
  priority = false,
  variant = 'wide',
}: AdminLogoProps) {
  const logo = logoConfig[variant];

  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src={logo.src}
        alt="Floatbase Smart Management logo"
        width={logo.width}
        height={logo.height}
        priority={priority}
        className={`h-auto w-full object-contain ${imageClassName}`}
      />
    </span>
  );
}
