import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Camera, User } from 'lucide-react';
import { toast } from 'sonner';

export default function CallScreen({
  open,
  onClose,
  contact,
  muteMicOnJoin,
  callType = 'audio',
  callStatus,
  localStream,
  remoteStream,
  remoteUserData,
  startCall,
  stopCall,
  switchCamera,
  toggleVideo,
  isVideoEnabled,
  getRemotePeerId,
}) {
  const [micEnabled, setMicEnabled] = useState(!muteMicOnJoin);
  const [videoEnabled, setVideoEnabled] = useState(callType === 'video');
  const [callTimer, setCallTimer] = useState(0);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const timerRef = useRef(null);
  const appliedMuteRef = useRef(false);

  useEffect(() => {
    if (open && contact?.uid) {
      setVideoEnabled(callType === 'video');
      appliedMuteRef.current = false;

      getRemotePeerId(contact.uid).then((pid) => {
        if (!pid) {
          toast.error('المستخدم غير متصل حاليًا', {
            description: 'لا يمكن إجراء المكالمة الآن، حاول لاحقًا',
          });
          onClose();
          return;
        }
        startCall(
          pid,
          {
            displayName: contact.displayName || '',
            photoURL: contact.photoURL || '',
            username: contact.username || '',
          },
          callType
        );
      });
    }
  }, [open, contact?.uid, callType, startCall, getRemotePeerId, onClose]);

  useEffect(() => {
    if (muteMicOnJoin && localStream && !appliedMuteRef.current) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = false;
        setMicEnabled(false);
        appliedMuteRef.current = true;
      }
    }
  }, [localStream, muteMicOnJoin]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (callStatus?.includes('متصل')) {
      timerRef.current = setInterval(() => setCallTimer((p) => p + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      if (callStatus?.includes('انتهت') || callStatus?.includes('فشل')) setCallTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [callStatus]);

  const handleEndCall = () => {
    stopCall();
    clearInterval(timerRef.current);
    setCallTimer(0);
    onClose();
  };

  const toggleMic = () => {
    if (localStream) {
      const t = localStream.getAudioTracks()[0];
      if (t) {
        t.enabled = !t.enabled;
        setMicEnabled(t.enabled);
      }
    }
  };

  const handleToggleVideo = () => {
    const enabled = toggleVideo();
    setVideoEnabled(enabled);
  };

  const handleSwitchCamera = () => switchCamera();

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    return `${m.toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const displayName =
    remoteUserData?.displayName || contact?.displayName || contact?.username || 'مستخدم';
  const isVideoCall = callType === 'video';
  const isConnected = callStatus?.includes('متصل');

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleEndCall()}>
      <DialogContent className="w-full h-full max-w-none max-h-none p-0 m-0 border-none bg-black flex items-center justify-center">
        <div className="relative w-full h-full max-w-md mx-auto bg-gray-900 overflow-hidden">
          {isVideoCall && remoteStream && (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          {(!isVideoCall || !remoteStream) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
              <p className="text-sm text-gray-400 mb-4 bg-white/10 px-4 py-1 rounded-full">
                {callStatus}
              </p>
              <Avatar className="h-28 w-28 border-4 border-white/20 shadow-2xl mb-4">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white text-3xl font-bold">
                  {displayName?.charAt(0) || <User className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              <p className="text-xl font-bold text-white mb-1">{displayName}</p>
              {contact?.username && (
                <p className="text-sm text-gray-400">@{contact.username}</p>
              )}
              {isConnected && (
                <p className="text-2xl font-mono text-white mt-2">{formatTime(callTimer)}</p>
              )}
            </div>
          )}

          {isVideoCall && localStream && (
            <div className="absolute top-4 right-4 w-28 h-40 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg z-10 bg-black">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!videoEnabled && (
                <div className="absolute inset-0 bg-gray-800/80 flex items-center justify-center">
                  <VideoOff className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
          )}

          {isVideoCall && isConnected && (
            <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full">
              <p className="text-white text-sm font-mono">{formatTime(callTimer)}</p>
            </div>
          )}

          <div
            className={`absolute bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-center gap-4 ${
              isVideoCall ? 'bg-gradient-to-t from-black/80 to-transparent' : 'bg-gray-900'
            }`}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMic}
              className={`h-14 w-14 rounded-full border-2 ${
                micEnabled ? 'bg-gray-800/80 border-gray-500' : 'bg-red-600 border-red-500'
              }`}
            >
              {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleEndCall}
              className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 border-4 border-red-400/50 shadow-[0_0_25px_rgba(239,68,68,0.5)]"
            >
              <PhoneOff className="h-7 w-7" />
            </Button>
            {isVideoCall && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleVideo}
                  className={`h-14 w-14 rounded-full border-2 ${
                    videoEnabled ? 'bg-gray-800/80 border-gray-500' : 'bg-red-600 border-red-500'
                  }`}
                >
                  {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwitchCamera}
                  className="h-14 w-14 rounded-full border-2 bg-gray-800/80 border-gray-500"
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}