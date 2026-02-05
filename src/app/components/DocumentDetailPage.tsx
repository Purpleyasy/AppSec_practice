// Document detail page - view title, content, and metadata
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { AppShell } from './AppShell';
import { TenantBadge } from './TenantBadge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { ArrowLeft } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Customer, DocumentDetail } from '../../lib/types';
import { format } from 'date-fns';

export function DocumentDetailPage() {
  const { customerId, docId } = useParams<{ customerId: string; docId: string }>();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'error' | 'info' }>>([]);

  useEffect(() => {
    loadData();
  }, [customerId, docId]);

  const loadData = async () => {
    try {
      const [docResponse, customerResponse] = await Promise.all([
        apiClient.get<DocumentDetail>(`/customers/${customerId}/documents/${docId}`),
        apiClient.get<Customer>(`/customers/${customerId}`),
      ]);

      setDocument(docResponse);
      setCustomer(customerResponse);
    } catch (error) {
      console.error('Failed to load document:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AppShell notifications={notifications} onClearNotification={clearNotification}>
      <div className="space-y-6">
        {/* Back button */}
        <Button variant="ghost" asChild>
          <Link to={`/customers/${customerId}/documents`}>
            <ArrowLeft className="size-4 mr-2" />
            Back to documents
          </Link>
        </Button>

        {loading ? (
          <div className="text-muted-foreground">Loading document...</div>
        ) : document ? (
          <div className="space-y-6">
            {/* Document title */}
            <div>
              <h1>{document.title}</h1>
              <p className="text-muted-foreground mt-2">
                Created: {format(new Date(document.createdAt || document.updatedAt), 'MMMM d, yyyy h:mm a')}
              </p>
            </div>

            {/* Document content */}
            <Card>
              <CardHeader>
                <h3>Content</h3>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none whitespace-pre-wrap font-mono text-sm">
                  {document.content}
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <h3>Metadata</h3>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-muted-foreground">Document ID</dt>
                    <dd className="font-mono text-sm">{document.id}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Owner Tenant</dt>
                    <dd className="font-mono text-sm">{document.customerId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Size</dt>
                    <dd>{document.size ?? document.content.length} bytes</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Created</dt>
                    <dd>{format(new Date(document.createdAt || document.updatedAt), 'MMMM d, yyyy h:mm a')}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-muted-foreground">Document not found</div>
        )}
      </div>
    </AppShell>
  );
}
