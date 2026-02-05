// Tenant badge component - displays logo + name + customerId
interface TenantBadgeProps {
  customerId: string;
  displayName: string;
  logoUrl?: string;
}

export function TenantBadge({ customerId, displayName, logoUrl }: TenantBadgeProps) {
  // Fallback: Generate initials from displayName
  const initials = displayName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="inline-flex items-center gap-3 px-4 py-2 bg-muted rounded-lg border border-border">
      {logoUrl ? (
        <img src={logoUrl} alt={`${displayName} logo`} className="size-10 rounded object-contain" />
      ) : (
        <div className="size-10 rounded bg-primary text-primary-foreground flex items-center justify-center">
          <span>{initials}</span>
        </div>
      )}
      <div className="flex flex-col">
        <span className="font-medium">{displayName}</span>
        <span className="text-sm text-muted-foreground">{customerId}</span>
      </div>
    </div>
  );
}
