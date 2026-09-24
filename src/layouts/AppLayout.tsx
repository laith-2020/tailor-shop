import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Scissors,
  LayoutDashboard,
  Users,
  ClipboardList,
  Ruler,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRoleBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';

export function AppLayout() {
  const { user, profile, shop, signOut, isConfigured } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const shopName = shop?.name || 'مخيطة حضرموت';

  const navItems = [
    { label: 'الرئيسية', to: '/', icon: LayoutDashboard, exact: true },
    { label: 'العملاء', to: '/customers', icon: Users },
    { label: 'الطلبات', to: '/orders', icon: ClipboardList },
    { label: 'المقاسات', to: '/measurements', icon: Ruler },
    { label: 'الإعدادات', to: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    setLogoutConfirmOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row pb-16 md:pb-0">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-slate-900 text-white z-30 shadow-xl">
        {/* Brand header */}
        <div className="flex items-center gap-3 px-6 h-18 border-b border-slate-800">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-600 text-white shadow-md shadow-amber-600/30">
            <Scissors className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-base text-white truncate" title={shopName}>
              {shopName}
            </h1>
            <p className="text-xs text-slate-400">نظام إدارة الخياطة</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/20'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile & sign out */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-amber-500 font-bold border border-slate-700 shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden text-right">
                <p className="text-xs font-semibold text-white truncate">
                  {profile?.full_name || user?.email || 'مستخدم النظام'}
                </p>
                <div className="mt-0.5">
                  <UserRoleBadge role={profile?.role || 'owner'} />
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLogoutConfirmOpen(true)}
            className="w-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 justify-start"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* 2. MOBILE TOP BAR */}
      <header className="md:hidden sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 px-4 h-15 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
            <Scissors className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-white truncate max-w-[190px]">
            {shopName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:bg-slate-800"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs">
          <div className="fixed inset-y-0 right-0 w-64 bg-slate-900 text-white p-5 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <span className="font-bold text-base text-amber-500">{shopName}</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to);

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all',
                        isActive
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800'
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400 truncate mb-2">
                {profile?.full_name || user?.email}
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLogoutConfirmOpen(true);
                }}
              >
                <LogOut className="w-4 h-4 ml-1.5" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="flex-1 md:mr-64 flex flex-col min-h-screen">
        {/* Supabase status banner if running in local mock/demo mode */}
        {!isConfigured && (
          <div className="bg-amber-500/10 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>الوضع التجريبي مفعل:</strong> التطبيق يعمل حالياً بالوضع التجريبي المحلي. لربط Supabase الحقيقي، قم بإضافة مفاتيح الربط في ملف <code>.env</code>.
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>
      </main>

      {/* 4. MOBILE BOTTOM NAVIGATION (Quick thumb navigation for tailors on phones) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 shadow-lg z-20 flex items-center justify-around h-16 px-1 no-print">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-medium transition-colors',
                isActive ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              <Icon className={cn('w-5 h-5 mb-1', isActive && 'stroke-[2.5]')} />
              <span className="text-[11px] leading-none">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Logout Confirmation Dialog */}
      <Modal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        title="تأكيد تسجيل الخروج"
        description="هل أنت متأكد من رغبتك في تسجيل الخروج من النظام؟"
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setLogoutConfirmOpen(false)}>
            إلغاء
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            تسجيل الخروج
          </Button>
        </div>
      </Modal>
    </div>
  );
}
