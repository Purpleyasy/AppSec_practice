// Simple 404 page
import { Link } from 'react-router';
import { FileQuestion } from 'lucide-react';
import { Button } from './ui/button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="text-center">
        <FileQuestion className="size-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link to="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
