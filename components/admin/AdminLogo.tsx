import Image from 'next/image';

interface AdminLogoProps {
  className?: string;
  imageClassName?: string;
  priority?: boolean;
}

export default function AdminLogo({
  className = '',
  imageClassName = '',
  priority = false,
}: AdminLogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/admin-logo-floatbase.png"
        alt="Floatbase Smart Management logo"
        width={1254}
        height={1254}
        priority={priority}
        unoptimized
        className={`h-auto w-full object-contain ${imageClassName}`}
      />
    </span>
  );
}
