import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';

type SidebarLinkProps = {
  to: string;
  label: string;
  icon?: ReactNode;
  active: boolean;
  /** Shown at the end: a count or a short status. */
  badge?: ReactNode;
  /** A book under «Dərsliklər»: indented, smaller. */
  nested?: boolean;
  onNavigate?: () => void;
};

export function SidebarLink({
  to,
  label,
  icon,
  active,
  badge,
  nested,
  onNavigate,
}: SidebarLinkProps) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-sm px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        nested ? 'min-h-9 pl-11 text-[13px]' : 'min-h-11',
        active
          ? 'bg-secondary font-sans-black text-secondary-foreground'
          : 'font-sans-medium text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge}
    </Link>
  );
}
