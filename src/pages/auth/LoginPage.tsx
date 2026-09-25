import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, LogIn, Phone, Scissors, ArrowLeft } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { RESPONSIBLE_TAILORS } from '@/lib/auth-context';

export function LoginPage() {
  const { signIn, isConfigured } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quickLoginId, setQuickLoginId] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    const result = await signIn(data.identifier, data.password);
    setIsSubmitting(false);

    if (result.error) {
      setAuthError(result.error);
    } else {
      navigate('/');
    }
  };

  const handleDirectTailorLogin = async (tailorId: string) => {
    const target = RESPONSIBLE_TAILORS.find((t) => t.id === tailorId);
    if (!target) return;

    setAuthError(null);
    setQuickLoginId(tailorId);
    setValue('identifier', target.phone);
    setValue('password', target.phone);

    const result = await signIn(target.phone, target.phone);
    setQuickLoginId(null);

    if (result.error) {
      setAuthError(result.error);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-800">تسجيل الدخول للنظام</h1>
        <p className="text-xs text-slate-500 mt-1">
          بوابة دخول الخياطين المسؤولين لإدارة الطلبات والزبائن
        </p>
      </div>

      {authError && (
        <Alert variant="error" className="mb-4">
          {authError}
        </Alert>
      )}

      {/* 1-Click Fast Login Cards for the 2 Responsible Tailors */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 px-1">
          <span>دخول سريع للخياط المسؤول</span>
          <span className="text-[11px] text-amber-700 font-normal">نقرة واحدة للمتابعة</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {RESPONSIBLE_TAILORS.map((tailor) => {
            const isLoggingIn = quickLoginId === tailor.id;
            return (
              <button
                key={tailor.id}
                type="button"
                onClick={() => handleDirectTailorLogin(tailor.id)}
                disabled={isSubmitting || quickLoginId !== null}
                className="group relative text-right p-3 rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 hover:from-amber-100/70 hover:to-amber-50 hover:border-amber-400 transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-60 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 w-full">
                  <div className="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-amber-600/30 shrink-0">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                    خياط مسؤول
                  </span>
                </div>

                <div className="mt-2.5">
                  <div className="font-bold text-slate-900 text-sm group-hover:text-amber-900 transition-colors">
                    {tailor.name}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-mono" dir="ltr">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>{tailor.phone}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-amber-100/80 flex items-center justify-between text-[11px] font-semibold text-amber-700 group-hover:text-amber-900">
                  <span>{isLoggingIn ? 'جاري الدخول...' : 'دخول فوري للنظام'}</span>
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-medium text-slate-400 shrink-0">
          أو الدخول برقم الهاتف وكلمة المرور
        </span>
        <div className="border-t border-slate-200 w-full" />
      </div>

      {/* Standard Form Login */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="رقم الهاتف أو البريد الإلكتروني"
          type="text"
          autoComplete="username"
          placeholder="0775175613 أو 0780572223"
          icon={<Phone className="w-4 h-4" />}
          error={errors.identifier?.message}
          {...register('identifier')}
        />

        <div>
          <Input
            label="كلمة المرور أو الرمز السري"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex items-center justify-between mt-1.5 px-0.5">
            <span className="text-[11px] text-slate-400">
              الرمز السري الافتراضي هو رقم الهاتف
            </span>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:underline"
            >
              مساعدة؟
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting && quickLoginId === null}
          className="w-full mt-2"
        >
          <LogIn className="w-5 h-5 ml-2" />
          دخول للنظام
        </Button>
      </form>

      {!isConfigured && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
          <p className="text-[11px] text-slate-500">
            النظام يعمل محلياً في الوضع السريع: اختر <strong>أبو خالد</strong> أو <strong>محفوظ</strong> للدخول المباشر.
          </p>
        </div>
      )}
    </div>
  );
}
