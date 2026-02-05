// Dashboard page with tiles for overview metrics
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AppShell } from './AppShell';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { StatusBadge, StatusType } from './StatusBadge';
import { FileText, Database, Plug, CreditCard, ArrowRight, Archive, TrendingUp } from 'lucide-react';
import { getUser } from '../../lib/auth';
import { apiClient } from '../../lib/api';
import { Connector, DocumentSummary } from '../../lib/types';
import { format } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
  documentCount?: number;
  lastSync?: {
    status: StatusType;
    timestamp: string;
    message: string;
  };
}

export function DashboardPage() {
  const user = getUser();
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'error' | 'info' }>>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch documents to count them
      const docsResponse = await apiClient.get<{ documents: DocumentSummary[] }>(
        `/customers/${user?.customerId || ''}/documents`,
      );
      
      // Fetch connectors to find last sync
      const connectors = await apiClient.get<Connector[]>(
        `/customers/${user?.customerId || ''}/connectors`,
      );

      // Find most recent sync
      let lastSync = undefined;
      if (connectors && connectors.length > 0) {
        const sorted = [...connectors].sort((a, b) => {
          const dateA = new Date(a.lastSyncAt || 0).getTime();
          const dateB = new Date(b.lastSyncAt || 0).getTime();
          return dateB - dateA;
        });
        
        if (sorted[0]?.lastSyncAt) {
          lastSync = {
            status: sorted[0].lastSyncStatus as StatusType,
            timestamp: sorted[0].lastSyncAt,
            message: sorted[0].lastSyncMessage || '',
          };
        }
      }

      setData({
        documentCount: docsResponse.documents?.length,
        lastSync,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Mock data for charts
  const reportingTrendData = [
    { date: 'Jan 29', generated: 8, viewed: 12 },
    { date: 'Jan 30', generated: 12, viewed: 15 },
    { date: 'Jan 31', generated: 15, viewed: 18 },
    { date: 'Feb 1', generated: 11, viewed: 14 },
    { date: 'Feb 2', generated: 18, viewed: 20 },
    { date: 'Feb 3', generated: 14, viewed: 16 },
    { date: 'Feb 4', generated: 20, viewed: 22 },
  ];

  const documentActivityData = [
    { month: 'Aug', uploads: 45 },
    { month: 'Sep', uploads: 62 },
    { month: 'Oct', uploads: 58 },
    { month: 'Nov', uploads: 71 },
    { month: 'Dec', uploads: 83 },
    { month: 'Jan', uploads: 95 },
  ];

  return (
    <AppShell notifications={notifications} onClearNotification={clearNotification}>
      <div className="space-y-6">
        {/* CHANGEABLE: Page heading */}
        <div>
          <h1>Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your recipe vault and integrations
          </p>
        </div>

        {/* Dashboard tiles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tile A: Documents stored (real, navigable) */}
          <Card className="p-3">
            <div className="flex items-start justify-between mb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Documents Stored
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-1.5">
                <FileText className="size-3.5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-semibold leading-none mb-1">
              {loading ? '—' : data.documentCount ?? '—'}
            </div>
            <p className="text-xs text-muted-foreground">Active</p>
          </Card>

          {/* Tile B: Archived */}
          <Card className="p-3">
            <div className="flex items-start justify-between mb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Archived
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-1.5">
                <Archive className="size-3.5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-semibold leading-none mb-1">
              47
            </div>
            <p className="text-xs text-muted-foreground">Documents archived</p>
          </Card>

          {/* Tile C: Last sync status (real) */}
          <Card className="p-3">
            <div className="flex items-start justify-between mb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Last Sync Status
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-1.5">
                <Plug className="size-3.5 text-primary" />
              </div>
            </div>
            {loading ? (
              <div className="text-muted-foreground text-sm">Loading...</div>
            ) : data.lastSync ? (
              <>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="flex items-center justify-center size-5 rounded-full bg-green-100">
                    <svg className="size-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-2xl font-semibold leading-none">
                    {format(new Date(data.lastSync.timestamp), 'MMM d')}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(data.lastSync.timestamp), 'h:mm a')}
                </p>
              </>
            ) : (
              <div className="text-muted-foreground text-sm">No syncs yet</div>
            )}
          </Card>

          {/* Tile D: Total storage (placeholder) */}
          <Card className="p-3">
            <div className="flex items-start justify-between mb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Storage Used
              </CardTitle>
              <div className="rounded-full bg-primary/10 p-1.5">
                <Database className="size-3.5 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-semibold leading-none mb-1">
              247 MB
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                of 10 GB available
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="bg-primary h-1 rounded-full" style={{ width: '2.4%' }}></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reporting Trend Chart */}
          <Card className="py-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="size-4" />
                Reporting Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={reportingTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="generated" stroke="#2A3855" activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="viewed" stroke="#ff0000" activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Document Activity Chart */}
          <Card className="py-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4" />
                Document Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={documentActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="uploads" fill="#F8ECD2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
