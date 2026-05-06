import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function WarningModal({ open, message, onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <AlertTriangle className="h-16 w-16 text-yellow-500" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-gray-900">
          تنبية هام
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2 whitespace-pre-wrap">
            {message || 'يرجى التواصل مع الدعم للاستفسار.'}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold shadow-md"
          >
            فهمت، متابعة
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}