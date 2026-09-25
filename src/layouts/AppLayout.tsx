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
  ArrowLeftRight,
  Phone,
  Check,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRoleBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';

export function AppLayout() {
  const { user, profile, shop, signOut, isConfigured, activeTailor, availableTailors, switchTailor } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [switchTailorModalOpen, setSwitchTailorModalOpen] = useState(false);
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

  const currentDisplayName = activeTailor?.name || profile?.full_name || user?.email || 'الخياط المسؤول';
  const currentPhone = activeTailor?.phone || profile?.phone || '';

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

        {/* Navigation links */}
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
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-amber-600 text-white font-semibold shadow-sm shadow-amber-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className={cn('w-5 h-5 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User profile, switch tailor & sign out */}
        <div className="p-4 border-t border-slate-800 space-y-2.5">
          <div className="flex items-start justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/70">
            <div className="flex items-start gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                <Scissors className="w-4 h-4" />
              </div>
              <div className="overflow-hidden text-right">
                <p className="text-xs font-bold text-white truncate">
                  {currentDisplayName}
                </p>
                {currentPhone && (
                  <p className="text-[11px] text-amber-400 font-mono flex items-center gap-1 mt-0.5" dir="ltr">
                    <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{currentPhone}</span>
                  </p>
                )}
                <div className="mt-1">
                  <UserRoleBadge role="owner" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSwitchTailorModalOpen(true)}
              className="text-[11px] border-slate-700 text-slate-300 hover:text-amber-300 hover:bg-slate-800 px-2 h-8"
              title="تبديل الخياط المسؤول"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 ml-1" />
              تبديل الخياط
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLogoutConfirmOpen(true)}
              className="text-[11px] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 px-2 h-8"
            >
              <LogOut className="w-3.5 h-3.5 ml-1" />
              خروج
            </Button>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE TOP BAR */}
      <header className="md:hidden sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 px-4 h-15 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
            <Scissors className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <span className="font-bold text-sm text-white truncate block max-w-[150px]">
              {shopName}
            </span>
            <span className="text-[10px] text-amber-400 block truncate font-medium">
              {currentDisplayName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSwitchTailorModalOpen(true)}
            className="p-1.5 rounded-lg text-amber-400 hover:bg-slate-800 border border-amber-500/30 flex items-center gap-1 text-[11px] px-2"
            title="تبديل الخياط"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>تبديل</span>
          </button>

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
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-xs">
          <div className="fixed inset-y-0 right-0 w-3/4 max-w-xs bg-slate-900 p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-amber-500" />
                  <span className="font-bold text-base text-white">{shopName}</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Current Tailor Card in Mobile Drawer */}
              <div className="my-4 p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{currentDisplayName}</div>
                    {currentPhone && (
                      <div className="text-[11px] text-amber-400 font-mono" dir="ltr">
                        {currentPhone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <UserRoleBadge role="owner" />
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSwitchTailorModalOpen(true);
                    }}
                    className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    تبديل الخياط
                  </button>
                </div>
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
                        'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium',
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
          <div className="bg-amber-500/10 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>الخياط النشط:</strong> {currentDisplayName} ({currentPhone || '0775175613'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSwitchTailorModalOpen(true)}
              className="text-[11px] font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-0.5 rounded-md transition-colors"
            >
              تبديل الحساب
            </button>
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

      {/* Switch Tailor Modal */}
      <Modal
        isOpen={switchTailorModalOpen}
        onClose={() => setSwitchTailorModalOpen(false)}
        title="تبديل الخياط المسؤول"
        description="اختر الخياط المسؤول الذي يعمل على النظام حالياً"
      >
        <div className="space-y-3 pt-2">
          {availableTailors.map((tailor) => {
            const isActive = activeTailor?.id === tailor.id || currentPhone === tailor.phone;
            return (
              <button
                key={tailor.id}
                type="button"
                onClick={() => {
                  switchTailor(tailor.id);
                  setSwitchTailorModalOpen(false);
                }}
                className={cn(
                  'w-full text-right p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer',
                  isActive
                    ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                      isActive ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                    )}
                  >
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{tailor.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">
                      {tailor.phone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <Check className="w-3.5 h-3.5" />
                      الحساب الحالي
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full hover:bg-amber-200">
                      تبديل الحساب
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          <div className="pt-2 flex justify-end">
            <Button variant="ghost" onClick={() => setSwitchTailorModalOpen(false)}>
              إغلاق
            </Button>
          </div>
        </div>
      </Modal>

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
