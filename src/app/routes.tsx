// React Router configuration - Data mode pattern
import { createBrowserRouter } from 'react-router';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { DocumentsPage } from './components/DocumentsPage';
import { DocumentDetailPage } from './components/DocumentDetailPage';
import { ConnectorsPage } from './components/ConnectorsPage';
import { BillingPage } from './components/BillingPage';
import { ReportsPage } from './components/ReportsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { NotFoundPage } from './components/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/customers/:customerId/documents',
    element: (
      <ProtectedRoute>
        <DocumentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/customers/:customerId/documents/:docId',
    element: (
      <ProtectedRoute>
        <DocumentDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/customers/:customerId/connectors',
    element: (
      <ProtectedRoute>
        <ConnectorsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/billing',
    element: (
      <ProtectedRoute>
        <BillingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute>
        <ReportsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
]);