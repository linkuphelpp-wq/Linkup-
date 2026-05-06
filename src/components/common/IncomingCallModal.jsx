import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff, User } from 'lucide-react';

export default function IncomingCallModal({ open, caller, callType, onAccept, onReject }) {
  const isVideo = callType === 'video';
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-sm bg-gray-900 text-white border-none text-center p-6 rounded-2xl">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm bg-white/10 px-3 py-1 rounded-full">
            {isVideo ? 'مكالمة فيديو واردة' : 'مكالمة صوتية واردة'}
          </p>
          <Avatar className="h-24 w-24 border-2 border-white/20">
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-3xl font-bold">
              {caller?.displayName?.charAt(0) || <User className="h-10 w-10" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-bold">{caller?.displayName || 'مستخدم'}</p>
            {caller?.username && <p className="text-sm text-gray-400">@{caller.username}</p>}
          </div>
          <div className="flex gap-4 mt-4 w-full">
            <Button
              onClick={onReject}
              variant="destructive"
              className="flex-1 h-12 rounded-full bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="h-5 w-5 mr-2" />
              رفض
            </Button>
            <Button
              onClick={onAccept}
              className="flex-1 h-12 rounded-full bg-green-600 hover:bg-green-700"
            >
              <Phone className="h-5 w-5 mr-2" />
              رد
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}