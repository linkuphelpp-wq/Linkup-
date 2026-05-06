import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Sparkles } from 'lucide-react';

export default function DisplayNameModal({ open, suggestedName, onConfirm }) {
  const [displayName, setDisplayName] = useState(suggestedName);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (displayName.trim().length > 0) {
      onConfirm(displayName.trim());
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md w-[calc(100%-2rem)] mx-auto my-8 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-0 p-6"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-800 dark:text-white">
            أكمل ملفك الشخصي
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
            اختر اسم العرض الذي سيظهر للمستخدمين الآخرين
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300 font-medium">اسم العرض</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="مثال: محمد أحمد"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-base"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              يمكنك تغييره لاحقاً من الملف الشخصي
            </p>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={!displayName.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              متابعة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}