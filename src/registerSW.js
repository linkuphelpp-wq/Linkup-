import { registerSW } from 'virtual:pwa-register';
import { toast } from 'sonner';

const updateSW = registerSW({
  onNeedRefresh() {
    toast('يوجد تحديث جديد!', {
      description: 'تم تحسين التطبيق، اضغط للتحديث',
      action: {
        label: 'تحديث الآن',
        onClick: () => updateSW(true),
      },
      duration: 0,
      position: 'top-center',
    });
  },
  onOfflineReady() {
    toast.success('التطبيق جاهز للعمل بدون إنترنت');
  },
});