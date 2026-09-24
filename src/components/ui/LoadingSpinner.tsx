import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export function LoadingSpinner({
  className,
  size = 'md',
  text,
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-6 gap-3 text-slate-500', className)}>
      <Loader2 className={cn('animate-spin text-amber-600', sizeMap[size])} />
      {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
    </div>
  );
}
