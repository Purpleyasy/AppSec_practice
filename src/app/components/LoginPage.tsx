// Login page - no shell, standalone form
// CHANGEABLE: Copy text can be customized for different branding
import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { setToken, setUser } from '../../lib/auth';
import { apiClient } from '../../lib/api';
import { APP_NAME } from '../../lib/config';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Spinner } from './Spinner';

interface LoginResponse {
  token: string;
  username: string;
  customerId: string;
}

type AuthMode = 'signin' | 'signup';

export function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign-up validation
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        if (!email) {
          setError('Email is required');
          setLoading(false);
          return;
        }
      }

      const response = await apiClient.post<LoginResponse>('/login', {
        username,
        password,
      });

      setToken(response.token);
      setUser({
        username: response.username,
        customerId: response.customerId,
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="w-full max-w-md">
        <div className="bg-card border-2 border-[var(--border)] rounded-lg p-8" style={{ boxShadow: 'var(--shadow-lg)' }}>
          {/* Tab selector */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg mb-8">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'signin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* CHANGEABLE: Heading and subtitle */}
          <div className="text-center mb-8">
            <h1 className="mb-2">
              {mode === 'signin' ? `Sign in to ${APP_NAME}` : `Create your ${APP_NAME} account`}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'signin' 
                ? 'Access your documents and integrations'
                : 'Start managing your documents and integrations'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={mode === 'signup'}
                  placeholder="Enter your email"
                  autoFocus={mode === 'signup'}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus={mode === 'signin'}
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={mode === 'signup'}
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {error && (
              <div className="p-3 bg-[var(--status-failed-bg)] text-[var(--status-failed)] rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="ghost"
              className="w-full border border-[var(--border)]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                mode === 'signin' ? 'Sign in' : 'Create account'
              )}
            </Button>
          </form>

          {/* Social login placeholders */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="ghost"
              className="w-full border border-[var(--border)]"
              title="Enterprise SSO not configured"
            >
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              className="w-full border border-[var(--border)]"
              title="Enterprise SSO not configured"
            >
              SSO
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
