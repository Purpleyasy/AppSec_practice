// Main application shell - top nav + sidebar + content area
import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  LayoutDashboard, 
  FileText, 
  Plug, 
  CreditCard,
  FileBarChart,
  Bell,
  ChevronDown,
  LogOut,
  Activity,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Archive
} from 'lucide-react';
import { getUser, clearToken } from '../../lib/auth';
import { APP_NAME } from '../../lib/config';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import logoImage from '../../assets/cbbbfe97c92deafa3ae7390ec77d06cdcfa13b94.png';

interface AppShellProps {
  children: ReactNode;
  notifications?: Array<{ id: string; message: string; type: 'error' | 'info' }>;
  onClearNotification?: (id: string) => void;
}

export function AppShell({ children, notifications = [], onClearNotification }: AppShellProps) {
  const navigate = useNavigate();
  const user = getUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  const sidebarLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: `/customers/${user?.customerId}/documents`, icon: FileText, label: 'Documents' },
    { to: '/reports', icon: FileBarChart, label: 'Reports' },
    { to: `/customers/${user?.customerId}/connectors`, icon: Plug, label: 'Integrations' },
    { to: '/archive', icon: Archive, label: 'Archive' },
    { to: '/billing', icon: CreditCard, label: 'Billing' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      {/* Top Navigation - Glass Effect on Unified Background */}
      <header 
        className="border-b border-[var(--nav-border)] bg-white backdrop-blur-[var(--glass-blur)] sticky top-0 z-50 text-[var(--nav-text)]" 
        style={{ boxShadow: 'var(--glass-shadow)', backdropFilter: 'var(--glass-blur)' }}
      >
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-8">
            <img src={logoImage} alt="VaultSync" className="h-12" />
          </div>
          
          <div className="flex items-center gap-4">
            {/* Plan pill badge */}
            <div 
              className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium"
              style={{ 
                background: 'linear-gradient(135deg, #F8ECD2 0%, #D2DEF8 100%)'
              }}
            >
              Professional
            </div>

            {/* Bell notification dropdown - Glass Effect */}
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <button
                  className="relative p-2 hover:bg-[var(--nav-hover-bg)] rounded-md transition-colors border border-transparent hover:border-[var(--border-subtle)]"
                >
                  <Bell className="size-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 size-2 bg-[var(--danger)] rounded-full" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-80 max-h-96 overflow-y-auto bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-[var(--glass-border)] text-[var(--nav-text)]" 
                style={{ boxShadow: 'var(--glass-shadow)', backdropFilter: 'var(--glass-blur)' }}
              >
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                    No notifications
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 rounded-md border ${
                          notif.type === 'error' 
                            ? 'bg-[var(--status-failed-bg)] text-[var(--status-failed)] border-[var(--status-failed)]' 
                            : 'bg-[var(--surface)] text-[var(--text)] border-[var(--border-subtle)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm flex-1">{notif.message}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onClearNotification?.(notif.id);
                            }}
                            className="text-xs underline hover:no-underline"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User dropdown - Glass Effect */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--nav-hover-bg)] rounded-md transition-colors border border-transparent hover:border-[var(--border-subtle)]">
                <div className="size-8 rounded-full bg-[var(--accent)] border border-[var(--border)] flex items-center justify-center" style={{ boxShadow: 'var(--shadow-xs)' }}>
                  <span className="text-sm text-[var(--text-emphasis)]">{user?.username?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{user?.username}</span>
                  <span className="text-xs text-[var(--text-muted)]">{user?.customerId}</span>
                </div>
                <ChevronDown className="size-4 text-[var(--text-muted)]" />
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-[var(--glass-border)] text-[var(--nav-text)]"
                style={{ boxShadow: 'var(--glass-shadow)', backdropFilter: 'var(--glass-blur)' }}
              >
                <DropdownMenuItem className="focus:bg-[var(--nav-hover-bg)] focus:text-[var(--nav-text)]">
                  <Activity className="size-4 mr-2" />
                  Activity
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-[var(--nav-hover-bg)] focus:text-[var(--nav-text)]">
                  <Settings className="size-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-[var(--nav-hover-bg)] focus:text-[var(--nav-text)]">
                  <Shield className="size-4 mr-2" />
                  Security
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[var(--border-subtle)]" />
                <DropdownMenuItem onClick={handleLogout} className="focus:bg-[var(--nav-hover-bg)] focus:text-[var(--nav-text)]">
                  <LogOut className="size-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Navigation - Unified Background with Outlined Structure */}
        <aside 
          className={`border-r border-[var(--nav-border)] bg-gradient-to-b from-[var(--surface-hover)]/50 to-[var(--card-background)] transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'} text-[var(--nav-text)]`}
        >
          <nav className="p-4 space-y-1 flex-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = window.location.pathname === link.to || 
                               (link.to !== '/dashboard' && window.location.pathname.startsWith(link.to));

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#D2DEF8] to-[#D2DEF8]/90 text-[var(--nav-active-text)] font-medium shadow-lg shadow-[#D2DEF8]/20' 
                      : 'text-[var(--nav-text)] hover:bg-[var(--surface-hover)] hover:text-[var(--nav-active-text)]'
                  }`}
                  title={sidebarCollapsed ? link.label : undefined}
                >
                  <Icon className="size-5 shrink-0" />
                  {!sidebarCollapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </nav>
          
          {/* Support CTA Card */}
          {!sidebarCollapsed && (
            <div className="mx-4 mb-4">
              <div 
                className="rounded-2xl p-4 space-y-3"
                style={{
                  background: 'linear-gradient(135deg, #D2DEF8 0%, #F8ECD2 100%)'
                }}
              >
                <div className="flex items-start gap-2">
                  <HelpCircle className="size-6 shrink-0 text-[var(--nav-active-text)]" />
                  <div>
                    <h3 className="font-semibold text-sm text-[var(--nav-active-text)]">Need Help?</h3>
                    <p className="text-xs text-[var(--nav-active-text)]/80 mt-1">
                      Get 24/7 support from our expert team
                    </p>
                  </div>
                </div>
                <button className="w-full bg-white hover:bg-white/90 text-[var(--nav-active-text)] font-medium text-sm py-2.5 px-4 rounded-xl transition-all hover:scale-105 shadow-sm">
                  Contact Support
                </button>
              </div>
            </div>
          )}
          
          {/* Bottom section with Collapse */}
          <div className="px-4 pb-4 space-y-2 border-t border-[var(--nav-border)] pt-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[var(--nav-hover-bg)] transition-colors w-full text-[var(--nav-text)] border border-transparent hover:border-[var(--border-subtle)]"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="size-5 shrink-0" />
              ) : (
                <>
                  <ChevronLeft className="size-5 shrink-0" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content Area - Same Unified Background */}
        <main className="flex-1 overflow-auto bg-[var(--bg)]">
          <div className="max-w-7xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
