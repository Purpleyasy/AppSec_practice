// Billing page placeholder
import { AppShell } from './AppShell';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CreditCard } from 'lucide-react';

export function BillingPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1>Billing</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription and payment methods
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="size-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Billing management features are currently being developed and will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
