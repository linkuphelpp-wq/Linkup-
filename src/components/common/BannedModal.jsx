import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldX, AlertTriangle, LogOut } from 'lucide-react';

export default function BannedModal({ open, type = 'banned', onClose }) {
  // type: 'banned' | 'deleted'
  const isBanned = type === 'banned';

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex justify-center mb-2">
            {isBanned ? (
              <ShieldX className="h-16 w-16 text-red-500" />
            ) : (
              <AlertTriangle className="h-16 w-16 text-amber-500" />
            )}
          </div>
          <DialogTitle className="text-center text-xl font-bold text-gray-900">
            {isBanned ? 'تم إيقاف حسابك' : 'تم حذف حسابك'}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            {isBanned
              ? 'لقد تم إيقاف حسابك بسبب انتهاك شروط الاستخدام. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الدعم.'
              : 'تم حذف حسابك نهائياً. إذا حدث هذا عن طريق الخطأ، يرجى التواصل مع الدعم.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-md"
          >
            <LogOut className="h-5 w-5 mr-2" />
            تسجيل الخروج
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = 'mailto:atheer@linkup.app?subject=مشكلة في الحساب'}
            className="w-full h-12 rounded-xl border-gray-300 text-gray-700"
          >
            تواصل مع الدعم
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}