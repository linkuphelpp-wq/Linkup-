import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

export default function ResetConfirmModal({ open, onClose, onConfirm }) {
  const [inputText, setInputText] = useState('');
  const CONFIRMATION_TEXT = 'RESET-NOW';

  const handleConfirm = () => {
    if (inputText === CONFIRMATION_TEXT) {
      onConfirm();
      setInputText('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-red-600">إعادة ضبط التطبيق</DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            سيؤدي هذا الإجراء إلى حذف جميع بياناتك المحلية وإعادة ضبط التطبيق. لا يمكن التراجع عن هذه العملية.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              للتأكيد، اكتب الكلمة التالية في الحقل أدناه: <strong>{CONFIRMATION_TEXT}</strong>
            </p>
          </div>
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`اكتب ${CONFIRMATION_TEXT}`}
            className="h-12 rounded-xl"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">إلغاء</Button>
          <Button
            onClick={handleConfirm}
            disabled={inputText !== CONFIRMATION_TEXT}
            className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            تأكيد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}