import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export function LoginPage() {
  const { signIn, isConfigured } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    const result = await signIn(data.email, data.password);
    setIsSubmitting(false);

    if (result.error) {
      setAuthError(result.error);
    } else {
      navigate('/');
    }
  };

  const handleDemoFill = () => {
    setValue('email', 'demo@hadramout.com');
    setValue('password', 'demo1234');
    setAuthError(null);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-slate-800">تسجيل الدخول</h1>
        <p className="text-xs text-slate-500 mt-1">أدخل بيانات حسابك للمتابعة إلى لوحة التحكم</p>
      </div>

      {authError && (
        <Alert variant="error" className="mb-5">
          {authError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="البريد الإلكتروني"
          type="email"
          autoComplete="email"
          placeholder="example@shop.com"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="كلمة المرور"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end mt-1.5">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-amber-600 hover:text-amber-700 hover:underline"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full mt-2"
        >
          <LogIn className="w-5 h-5 ml-2" />
          دخول للنظام
        </Button>
      </form>

      {/* Demo Credentials Quick Login for Testing */}
      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={handleDemoFill}
          className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full transition-colors font-medium border border-amber-200/60"
        >
          <Sparkles className="w-3.5 h-3.5" />
          تعبئة بيانات تجريبية سريعة
        </button>
        {!isConfigured && (
          <p className="text-[11px] text-slate-400 mt-2">
            يمكنك الدخول ببيانات تجريبية أثناء فترة التطوير المحلية
          </p>
        )}
      </div>
    </div>
  );
}
