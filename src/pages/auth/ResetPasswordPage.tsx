import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    const result = await updatePassword(data.password);
    setIsSubmitting(false);

    if (result.error) {
      setAuthError(result.error);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-slate-800">تعيين كلمة المرور الجديدة</h1>
        <p className="text-xs text-slate-500 mt-1">أدخل كلمة مرور قوية جديدة لحسابك</p>
      </div>

      {isSuccess ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-800">
            تم تحديث كلمة المرور بنجاح!
          </p>
          <p className="text-xs text-slate-500">
            جاري تحويلك تلقائياً لصفحة تسجيل الدخول...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {authError && <Alert variant="error">{authError}</Alert>}

          <Input
            label="كلمة المرور الجديدة"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="تأكيد كلمة المرور"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full"
          >
            حفظ كلمة المرور
          </Button>
        </form>
      )}
    </div>
  );
}
