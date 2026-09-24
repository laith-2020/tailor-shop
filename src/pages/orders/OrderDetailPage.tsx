import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Edit,
  Phone,
  CheckCircle2,
  DollarSign,
  Receipt,
  FileText,
  AlertCircle,
  Scissors,
} from 'lucide-react';
import { useOrder, useUpdateOrder, useUpdateOrderStatus, useUpdateOrderPayment } from '@/hooks/useOrders';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MeasurementCard } from '@/components/measurements/MeasurementCard';
import { OrderFormModal } from '@/components/orders/OrderFormModal';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import type { OrderFormData } from '@/schemas/order';
import type { OrderStatus } from '@/types/database';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const autoPrint = searchParams.get('print') === 'true';

  const navigate = useNavigate();
  const { shop } = useAuth();
  const shopName = shop?.name || 'مخيطة حضرموت';
  const currency = shop?.currency === 'JOD' ? 'د.أ' : (shop?.currency || 'د.أ');
  const unit = shop?.measurement_unit || 'سم';

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState<number>(0);
  const [printFormat, setPrintFormat] = useState<'a4' | 'receipt'>('a4');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: order, isLoading } = useOrder(id);
  const updateOrderMutation = useUpdateOrder();
  const updateStatusMutation = useUpdateOrderStatus();
  const updatePaymentMutation = useUpdateOrderPayment();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    if (autoPrint && order) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [autoPrint, order]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل بيانات الطلب..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">الطلب غير موجود</h2>
        <p className="text-sm text-slate-500">لم يتم العثور على سجل لهذا الطلب</p>
        <Link to="/orders">
          <Button variant="outline">العودة لقائمة الطلبات</Button>
        </Link>
      </div>
    );
  }

  const remaining = Math.max(0, (order.price || 0) - (order.paid_amount || 0));

  const handleUpdateSubmit = async (formData: OrderFormData) => {
    const updated = await updateOrderMutation.mutateAsync({
      id: order.id,
      data: formData,
    });
    showToast('تم حفظ التعديلات بنجاح');
    return updated;
  };

  const handleStatusChange = async (status: OrderStatus) => {
    await updateStatusMutation.mutateAsync({ orderId: order.id, status });
    showToast('تم تحديث حالة الطلب بنجاح');
  };

  const handleRecordPayment = async () => {
    const totalNewPaid = Math.min(order.price, (order.paid_amount || 0) + Number(newPaymentAmount));
    await updatePaymentMutation.mutateAsync({
      orderId: order.id,
      paidAmount: totalNewPaid,
    });
    setPaymentModalOpen(false);
    showToast('تم تسجيل الدفعة المالية بنجاح');
  };

  const triggerPrint = (format: 'a4' | 'receipt') => {
    setPrintFormat(format);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm animate-fadeIn no-print">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top action and header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
            title="رجوع لسجل الطلبات"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold font-mono text-amber-700">{order.order_number}</h1>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تاريخ الطلب: {order.order_date} | التسليم المتوقع:{' '}
              <strong className="text-slate-800 font-mono">{order.expected_delivery_date}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick status transition */}
          {order.status === 'new' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange('in_progress')}
              className="text-xs text-amber-700 bg-amber-50 border-amber-200"
            >
              بدء التفصيل
            </Button>
          )}
          {order.status === 'in_progress' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange('ready')}
              className="text-xs text-emerald-700 bg-emerald-50 border-emerald-200"
            >
              <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
              جاهز للتسليم
            </Button>
          )}
          {order.status === 'ready' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStatusChange('delivered')}
              className="text-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
              تسليم للزبون
            </Button>
          )}

          {/* Print formats */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerPrint('a4')}
            className="text-xs gap-1.5"
            title="طباعة سند ورشة كامل مقاس A4"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            طباعة A4
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => triggerPrint('receipt')}
            className="text-xs gap-1.5"
            title="طباعة إيصال استلام حراري صغير"
          >
            <Receipt className="w-3.5 h-3.5 text-purple-600" />
            إيصال كاشير
          </Button>

          <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)} className="text-xs">
            <Edit className="w-3.5 h-3.5 ml-1" />
            تعديل
          </Button>
        </div>
      </div>

      {/* Screen Presentation Grid (Normal Interactive Mode) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        {/* Customer & Garment Card */}
        <div className="space-y-6 md:col-span-1">
          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base flex items-center justify-between">
                <span>الزبون</span>
                {order.customer && (
                  <Link
                    to={`/customers/${order.customer.id}`}
                    className="text-xs text-amber-600 hover:underline"
                  >
                    عرض الملف
                  </Link>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-3 text-sm">
              <div>
                <span className="text-xs text-slate-400 block">الاسم</span>
                <span className="font-bold text-slate-800 text-base">
                  {order.customer?.full_name || 'غير محدد'}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">رقم الهاتف</span>
                <a
                  href={`tel:${order.customer?.phone}`}
                  className="font-mono text-slate-800 hover:text-amber-600 inline-flex items-center gap-1.5 font-semibold"
                  dir="ltr"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-600" />
                  {order.customer?.phone}
                </a>
              </div>
              {order.customer?.address && (
                <div>
                  <span className="text-xs text-slate-400 block">العنوان</span>
                  <span className="text-slate-700">{order.customer.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Garment Details Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <Scissors className="w-4 h-4 text-amber-600" />
                تفاصيل الثوب
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-3 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-xs text-slate-400">نوع الثوب</span>
                <span className="font-bold text-slate-800">{order.garment_type}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-xs text-slate-400">القماش</span>
                <span className="text-slate-800 font-medium">{order.fabric || 'لم يحدد'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-xs text-slate-400">اللون</span>
                <span className="text-slate-800 font-medium">{order.color || 'لم يحدد'}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-xs text-slate-400">موعد التسليم</span>
                <span className="font-mono font-bold text-amber-700">{order.expected_delivery_date}</span>
              </div>
              {order.notes && (
                <div className="pt-2">
                  <span className="text-xs text-slate-400 block mb-1">ملاحظات الطلب</span>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    {order.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment & Financials Card */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  الحساب والمدفوعات
                </span>
                {remaining > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewPaymentAmount(remaining);
                      setPaymentModalOpen(true);
                    }}
                    className="text-xs h-7 text-emerald-700 border-emerald-300 bg-emerald-50/50"
                  >
                    تسجيل دفعة
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3.5 space-y-3">
              <div className="flex justify-between items-center text-sm py-1 border-b border-slate-50">
                <span className="text-slate-500">السعر الإجمالي</span>
                <span className="font-mono font-bold text-slate-900">{order.price} {currency}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1 border-b border-slate-50">
                <span className="text-slate-500">المبلغ المدفوع</span>
                <span className="font-mono font-bold text-emerald-700">{order.paid_amount} {currency}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-slate-700 font-bold">المبلغ المتبقي</span>
                <span
                  className={`font-mono font-black text-lg ${
                    remaining > 0 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {remaining} {currency}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Measurements Card */}
        <div className="md:col-span-2">
          <MeasurementCard measurements={order.measurements} unit={unit} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINT-ONLY SECTION (A4 & Compact Receipt formats optimized for printers)  */}
      {/* ========================================================================= */}
      <div className="hidden print:block text-black bg-white text-right">
        {printFormat === 'a4' ? (
          /* A4 WORKSHOP INVOICE / TICKET */
          <div className="max-w-3xl mx-auto p-6 border-2 border-black/80 font-sans space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div>
                <h1 className="text-2xl font-black">{shopName}</h1>
                <p className="text-xs text-black/70">لتفصيل وخياطة الأثواب والدشاديش الرجالية</p>
                <p className="text-xs font-mono mt-1">هاتف: {shop?.phone || '0791234567'} | {shop?.address || 'عمان'}</p>
              </div>
              <div className="text-left font-mono">
                <div className="text-2xl font-black tracking-wider text-black">{order.order_number}</div>
                <div className="text-xs text-black/70">تاريخ الطلب: {order.order_date}</div>
              </div>
            </div>

            {/* Customer & Delivery Bar */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 border border-black text-sm">
              <div>
                <span className="font-bold block">اسم العميل: {order.customer?.full_name}</span>
                <span className="font-mono block" dir="ltr">الهاتف: {order.customer?.phone}</span>
                {order.customer?.address && <span className="text-xs block">العنوان: {order.customer.address}</span>}
              </div>
              <div className="text-left">
                <span className="font-bold block">موعد التسليم المتوقع:</span>
                <span className="text-lg font-black font-mono underline block mt-0.5">{order.expected_delivery_date}</span>
                <span className="text-xs block mt-1">حالة الطلب: {order.status === 'delivered' ? 'تم التسليم' : 'قيد التنفيذ'}</span>
              </div>
            </div>

            {/* Garment Details */}
            <div className="border border-black p-3 text-sm space-y-1">
              <div className="grid grid-cols-3 gap-2">
                <div><strong>نوع الثوب:</strong> {order.garment_type}</div>
                <div><strong>القماش:</strong> {order.fabric || '-'}</div>
                <div><strong>اللون:</strong> {order.color || '-'}</div>
              </div>
              {order.notes && (
                <div className="pt-2 text-xs border-t border-black/20 mt-2">
                  <strong>ملاحظات الطلب:</strong> {order.notes}
                </div>
              )}
            </div>

            {/* Measurements Table */}
            {order.measurements && (
              <div>
                <h3 className="font-bold text-sm mb-1.5 border-b border-black pb-1">جدول المقاسات ({unit})</h3>
                <div className="grid grid-cols-5 gap-1.5 text-xs text-center border border-black p-2 font-mono">
                  {order.measurements.length && <div className="border border-black/40 p-1"><span className="block font-sans font-semibold">طول الثوب</span>{order.measurements.length}</div>}
                  {order.measurements.shoulder && <div className="border border-black/40 p-1"><span className="block font-sans font-semibold">عرض الكتف</span>{order.measurements.shoulder}</div>}
                  {order.measurements.sleeve_length && <div className="border border-black/40 p-1"><span className="block font-sans font-semibold">طول الكم</span>{order.measurements.sleeve_length}</div>}
                  {order.measurements.chest && <div className="border border-black/40 p-1"><span className="block font-sans font-semibold">الصدر</span>{order.measurements.chest}</div>}
                  {order.measurements.waist && <div className="border border-black/40 p-1"><span className="block font-sans font-semibold">الخصر</span>{order.measurements.waist}</div>}
                  {order.measurements.hip && <div className="border border-black/40 p-1"><span className="block font-sans font-semibold">الورك</span>{order.measurements.hip}</div>}
                  {order.measurements.neck && <div className="border border-black/40 p-1"><span className="block font-sans font-semibold">الرقبة</span>{order.measurements.neck}</div>}
                  {order.measurements.arm_width && <div className="border border-black/40 p-1"><span className="block font-sans font-semibold">وسع الذراع</span>{order.measurements.arm_width}</div>}
                  {order.measurements.wrist && <div className="border border-black/40 p-1"><span className="block font-sans font-semibold">الكبك / المعصم</span>{order.measurements.wrist}</div>}
                  {order.measurements.bottom_width && <div className="border border-black/40 p-1"><span className="block font-sans font-semibold">وسع الأسفل</span>{order.measurements.bottom_width}</div>}
                  {order.measurements.pants_length && <div className="border border-black/40 p-1 bg-gray-100"><span className="block font-sans font-semibold">طول السروال</span>{order.measurements.pants_length}</div>}
                  {order.measurements.pants_waist && <div className="border border-black/40 p-1 bg-gray-100"><span className="block font-sans font-semibold">خصر السروال</span>{order.measurements.pants_waist}</div>}
                  {order.measurements.pants_thigh && <div className="border border-black/40 p-1 bg-gray-100"><span className="block font-sans font-semibold">فخذ السروال</span>{order.measurements.pants_thigh}</div>}
                  {order.measurements.pants_bottom && <div className="border border-black/40 p-1 bg-gray-100"><span className="block font-sans font-semibold">أسفل السروال</span>{order.measurements.pants_bottom}</div>}
                </div>
                {order.measurements.notes && (
                  <p className="text-xs mt-1 text-black/80"><strong>ملاحظات المقاس:</strong> {order.measurements.notes}</p>
                )}
              </div>
            )}

            {/* Financial Totals */}
            <div className="flex justify-between items-center border-t-2 border-black pt-3">
              <div className="text-xs text-black/70 max-w-sm">
                * يرجى إحضار هذا السند عند الاستلام.
                <br />
                * نرجو تجربة الثوب والتأكد من المقاسات عند الاستلام مباشرة.
              </div>

              <div className="border-2 border-black p-3 text-sm font-mono min-w-[220px]">
                <div className="flex justify-between py-0.5"><span>السعر:</span><span>{order.price} {currency}</span></div>
                <div className="flex justify-between py-0.5"><span>المدفوع:</span><span>{order.paid_amount} {currency}</span></div>
                <div className="flex justify-between py-1 border-t border-black font-bold text-base">
                  <span>المتبقي:</span>
                  <span>{remaining} {currency}</span>
                </div>
              </div>
            </div>

            {/* Signature Area */}
            <div className="flex justify-between text-xs pt-8 border-t border-dashed border-black/40">
              <div>توقيع الخياط: ........................</div>
              <div>توقيع الزبون: ........................</div>
            </div>
          </div>
        ) : (
          /* COMPACT 80MM THERMAL RECEIPT FORMAT */
          <div className="max-w-[80mm] mx-auto p-2 font-mono text-xs border border-black space-y-2 text-center">
            <div className="font-bold text-sm">{shopName}</div>
            <div className="text-[10px]">{shop?.address || 'عمان'} - هاتف: {shop?.phone || '0791234567'}</div>
            <div className="border-b border-dashed border-black my-1"></div>

            <div className="text-base font-bold">{order.order_number}</div>
            <div>تاريخ الطلب: {order.order_date}</div>
            <div className="border-b border-dashed border-black my-1"></div>

            <div className="text-right space-y-0.5">
              <div>الزبون: <strong>{order.customer?.full_name}</strong></div>
              <div>الهاتف: {order.customer?.phone}</div>
              <div>نوع الثوب: {order.garment_type}</div>
              <div>القماش: {order.fabric || '-'}</div>
              <div className="font-bold underline mt-1">موعد التسليم: {order.expected_delivery_date}</div>
            </div>

            <div className="border-b border-dashed border-black my-1"></div>

            {/* Summary financials */}
            <div className="space-y-0.5 text-right">
              <div className="flex justify-between"><span>السعر:</span><span>{order.price} {currency}</span></div>
              <div className="flex justify-between"><span>المدفوع:</span><span>{order.paid_amount} {currency}</span></div>
              <div className="flex justify-between font-bold text-sm border-t border-black pt-0.5">
                <span>المتبقي:</span>
                <span>{remaining} {currency}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-black my-1"></div>
            <div className="text-[10px]">شكراً لزيارتكم - {shopName}</div>
          </div>
        )}
      </div>

      {/* Edit Order Modal */}
      <OrderFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        order={order}
        onSubmit={handleUpdateSubmit}
        isLoading={updateOrderMutation.isPending}
      />

      {/* Record Payment Dialog */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="تسجيل دفعة نقدية جديدة"
        description={`الطلب: ${order.order_number} - المتبقي الإجمالي: ${remaining} ${currency}`}
        className="max-w-sm"
      >
        <div className="space-y-4 text-right">
          <Input
            label={`مبلغ الدفعة المستلمة (${currency})`}
            type="number"
            step="0.5"
            min="0"
            max={remaining}
            value={newPaymentAmount}
            onChange={(e) => setNewPaymentAmount(Number(e.target.value))}
            autoFocus
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setPaymentModalOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRecordPayment}
              isLoading={updatePaymentMutation.isPending}
            >
              حفظ الدفعة
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
