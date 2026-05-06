import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, User, Calendar, Clock, Shield, Users, MessageCircle } from 'lucide-react';

export default function UserDetailModal({ user, onClose }) {
  if (!user) return null;
  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-white rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">تفاصيل المستخدم</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 mt-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback>{user.email?.charAt(0)?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-2 text-sm text-gray-700 w-full">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /> {user.email}</div>
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /> @{user.username || '—'}</div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /> تاريخ الإنشاء: {user.createdAt?.toDate?.()?.toLocaleDateString('ar-SA')}</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /> آخر ظهور: {user.lastSeen?.toDate?.()?.toLocaleString('ar-SA')}</div>
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-gray-400" /> الحالة: {user.status === 'banned' ? 'محظور' : 'نشط'}</div>
            <div className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-400" /> جهات الاتصال: {user.contacts?.length || 0}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}