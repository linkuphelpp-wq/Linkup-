import { useState } from 'react';
import { Copy, Check, User } from 'lucide-react';

export default function HomeScreen({ myId, myUsername, user }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!myUsername) return;
    navigator.clipboard?.writeText(myUsername);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = user?.displayName || user?.name || 'مستخدم';

  return (
    <div className="relative">
      {/* شريط علوي عائم مع معرف المستخدم */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4">
        <header className="mx-auto max-w-4xl h-16 md:h-20 flex items-center justify-between px-5 backdrop-blur-2xl rounded-[2.5rem] border shadow-[0_10px_40px_rgba(0,0,0,0.1)] bg-white/70 border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-black tracking-tight hidden sm:block text-gray-900">LinkUp</span>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="backdrop-blur-sm rounded-full px-4 py-1.5 border flex items-center gap-2 bg-gray-100/80 border-gray-200">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-mono font-medium text-gray-800">@{myUsername || 'جاري...'}</span>
              <button onClick={handleCopy} className="ml-1 p-1 rounded-full hover:bg-gray-200">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-600" />}
              </button>
            </div>
          </div>

          <div className="w-10"></div>
        </header>
      </div>

      {/* محتوى ترحيبي بسيط */}
      <div className="pt-28 px-5 pb-4 max-w-md mx-auto w-full text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">أهلاً، {displayName}</h2>
        <p className="text-gray-500">
          شارك معرفك مع أصدقائك لبدء التواصل
        </p>
      </div>
    </div>
  );
}