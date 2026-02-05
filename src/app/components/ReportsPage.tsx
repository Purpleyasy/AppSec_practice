// Reports page placeholder
import { AppShell } from './AppShell';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileBarChart } from 'lucide-react';

export function ReportsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1>Reports</h1>
          <p className="text-muted-foreground mt-1">
            View analytics and generate reports
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="size-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Reporting and analytics features are currently being developed and will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
