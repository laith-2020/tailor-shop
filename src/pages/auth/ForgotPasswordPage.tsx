import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/schemas/auth';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

export function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    const result = await sendPasswordReset(data.email);
    setIsSubmitting(false);

    if (result.error) {
      setAuthError(result.error);
    } else {
      setIsSuccess(true);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-slate-800">استعادة كلمة المرور</h1>
        <p className="text-xs text-slate-500 mt-1">
          أدخل بريدك الإلكتروني المسجل وسنرسل لك رابط إعادة تعيين كلمة المرور
        </p>
      </div>

      {isSuccess ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-800">
            تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني بنجاح!
          </p>
          <p className="text-xs text-slate-500">
            يرجى مراجعة صندوق الوارد ورسائل البريد غير المرغوب فيه (Spam).
          </p>
          <div className="pt-4">
            <Link to="/login">
              <Button variant="outline" className="w-full">
                العودة لصفحة تسجيل الدخول
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {authError && <Alert variant="error">{authError}</Alert>}

          <Input
            label="البريد الإلكتروني"
            type="email"
            placeholder="example@shop.com"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full"
          >
            إرسال رابط الاستعادة
          </Button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
              الرجوع لتسجيل الدخول
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
