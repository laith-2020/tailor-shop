import { useState, useDeferredValue } from 'react';
import { Link } from 'react-router-dom';
import { Ruler, Search, X, User, Copy, Eye, PlusCircle } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { MeasurementCard } from '@/components/measurements/MeasurementCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';

export function MeasurementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearch = useDeferredValue(searchTerm);
  const { shop } = useAuth();
  const unit = shop?.measurement_unit || 'سم';

  const { data, isLoading } = useOrders({
    search: deferredSearch,
    limit: 50,
  });

  const ordersWithMeasurements = (data?.data || []).filter((o) => o.measurements);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">سجل وبطاقات المقاسات</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            استعراض مقاسات الزبائن المفصلة وإمكانية إعادة استخدامها في طلبات جديدة
          </p>
        </div>

        <Link to="/orders">
          <Button variant="primary">
            <PlusCircle className="w-4 h-4 ml-1.5" />
            تفصيل طلب بمقاس جديد
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Input
          placeholder="بحث باسم العميل، الهاتف، أو رقم الطلب..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4 text-slate-400" />}
          className="pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : ordersWithMeasurements.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Ruler className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">لا توجد بطاقات مقاسات مطابقة</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              لم يتم العثور على مقاسات مسجلة للبحث الحالي. يمكنك إنشاء طلب جديد وتدوين القياسات.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ordersWithMeasurements.map((ord) => (
            <div key={ord.id} className="space-y-2">
              {/* Order and Customer Header Card */}
              <div className="flex items-center justify-between p-3 rounded-t-xl bg-slate-800 text-white text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-sm">{ord.customer?.full_name || 'عميل'}</span>
                  <span className="text-slate-400 font-mono" dir="ltr">({ord.customer?.phone})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-amber-400">{ord.order_number}</span>
                  <Link
                    to={`/orders?newCustomerOrder=${ord.customer_id}&copyLast=true`}
                    title="نسخ هذه المقاسات لطلب جديد"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-slate-200 hover:text-white hover:bg-slate-700"
                    >
                      <Copy className="w-3.5 h-3.5 ml-1" />
                      استخدام
                    </Button>
                  </Link>
                  <Link to={`/orders/${ord.id}`} title="عرض الطلب">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-slate-200 hover:text-white hover:bg-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Measurement Details Card */}
              <MeasurementCard
                measurements={ord.measurements}
                unit={unit}
                className="rounded-t-none border-t-0 shadow-sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
