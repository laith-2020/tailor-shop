import React from 'react';
import { Scissors } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { shop } = useAuth();
  const shopName = shop?.name || 'مخيطة حضرموت';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-600/20 mb-4 transform hover:scale-105 transition-transform">
          <Scissors className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          {shopName}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          نظام إدارة طلبات وتفصيل الأثواب والمقاسات
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100 sm:px-10">
          {children}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          جميع الحقوق محفوظة &copy; {new Date().getFullYear()} {shopName}
        </p>
      </div>
    </div>
  );
}
