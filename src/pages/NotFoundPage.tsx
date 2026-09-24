import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-black text-amber-600 mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mb-2">الصفحة غير موجودة</h2>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        الصفحة التي تحاول الوصول إليها قد تم نقلها أو أنها غير متوفرة.
      </p>
      <Link to="/">
        <Button variant="primary">
          <Home className="w-4 h-4 ml-2" />
          العودة للرئيسية
        </Button>
      </Link>
    </div>
  );
}
