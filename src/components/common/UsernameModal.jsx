import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AtSign, AlertCircle } from 'lucide-react';
import { db } from '../../firebase/config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export default function UsernameModal({ open, onConfirm, userId }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const validateUsername = (value) => {
    if (value.length < 3) return 'يجب أن يكون المعرف 3 أحرف على الأقل';
    if (value.length > 20) return 'يجب أن لا يتجاوز المعرف 20 حرفاً';
    if (!/^[a-zA-Z0-9._]+$/.test(value)) return 'المسموح فقط: الأحرف الإنجليزية، الأرقام، النقطة، والشرطة السفلية';
    if (value.startsWith('.') || value.startsWith('_') || value.endsWith('.') || value.endsWith('_')) return 'لا يمكن أن يبدأ أو ينتهي بنقطة أو شرطة سفلية';
    if (value.includes('..') || value.includes('__')) return 'لا يمكن تكرار النقطة أو الشرطة السفلية';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsChecking(true);
    try {
      const usernameRef = doc(db, "usernames", username);
      const usernameSnap = await getDoc(usernameRef);
      
      if (usernameSnap.exists()) {
        setError('هذا المعرف غير متوفر');
        setIsChecking(false);
        return;
      }

      await setDoc(usernameRef, { uid: userId });

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { username: username });

      localStorage.setItem('my_username', username);
      
      onConfirm(username);
    } catch (err) {
      console.error("خطأ في حفظ المعرف:", err);
      setError('حدث خطأ في الحفظ، حاول لاحقاً');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl p-6" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            اختر معرفك الفريد
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            هذا المعرف سيستخدمه الآخرون للاتصال بك
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="مثال: ahmed.123"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase());
                setError('');
              }}
              className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 text-base"
              autoFocus
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• 3 إلى 20 حرفاً</p>
            <p>• أحرف إنجليزية، أرقام، نقطة، شرطة سفلية</p>
            <p>• لا يمكن البدء أو الانتهاء بنقطة أو شرطة سفلية</p>
          </div>
          <Button
            type="submit"
            disabled={isChecking || !username}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-md"
          >
            {isChecking ? 'جاري التحقق...' : 'تأكيد المعرف'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}