import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, LogIn, Phone, ShieldCheck } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export function LoginPage() {
  const { signIn } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-slate-800">تسجيل الدخول للنظام</h1>
        <p className="text-xs text-slate-500 mt-1">
          أدخل بيانات الحساب المعتمد للمتابعة إلى لوحة التحكم
        </p>
      </div>

      {authError && (
        <Alert variant="error" className="mb-4">
          {authError}
        </Alert>
      )}

      {/* Secure Standard Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="رقم الهاتف أو البريد الإلكتروني"
          type="text"
          autoComplete="username"
          placeholder="07XXXXXXXX أو example@email.com"
          icon={<Phone className="w-4 h-4" />}
          error={errors.identifier?.message}
          {...register('identifier')}
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
          <div className="flex items-center justify-end mt-1.5 px-0.5">
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

      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-2 border-t border-slate-100">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>نظام آمن ومحمي ومخصص للخياطين المصرح لهم فقط</span>
      </div>
    </div>
  );
}
