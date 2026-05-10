import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  ar: {
    settings: {
      title: 'الإعدادات',
      subtitle: 'تحكم كامل في تطبيقك كما تحب',
      sections: {
        account: 'الحساب',
        appearance: 'المظهر',
        calls: 'المكالمات',
        privacy: 'الخصوصية والأمان',
        more: 'المزيد',
      },
      items: {
        profile: { label: 'الملف الشخصي', desc: 'تعديل اسمك وصورتك' },
        fontSize: { label: 'حجم الخط' },
        fontFamily: { label: 'نوع الخط' },
        compactMode: { label: 'تصغير الأبعاد', desc: 'مناسب للشاشات الصغيرة' },
        language: { label: 'لغة التطبيق', desc: 'اختر لغة الواجهة' },
        muteMic: { label: 'كتم الميكروفون تلقائياً' },
        speaker: { label: 'مكبر الصوت افتراضياً' },
        appLock: { label: 'قفل التطبيق', desc: 'حماية إضافية برمز سري' },
        dataManagement: { label: 'إدارة البيانات', desc: 'التحكم في تخزين بياناتك' },
        resetApp: { label: 'إعادة ضبط التطبيق', desc: 'مسح جميع المحادثات والبيانات' },
        support: { label: 'تواصل مع المطور', desc: 'ملاحظات، اقتراحات، أو مشاكل' },
        share: { label: 'شارك التطبيق', desc: 'دع أصدقاءك ينضمون' },
        partner: { label: 'تكوين شراكة', desc: 'انضم كشريك رسمي' },
        admin: { label: 'لوحة الإدارة', desc: 'إدارة المستخدمين والمحتوى' },
      },
      quickActions: { atheer: 'من هو أثير؟', about: 'من نحن', privacy: 'الخصوصية' },
      modals: {
        reset: {
          title: 'تأكيد إعادة الضبط',
          warning: 'هذا الإجراء لا يمكن التراجع عنه. اكتب كلمة "حذف" للتأكيد',
          placeholder: 'اكتب كلمة حذف هنا...',
          cancel: 'إلغاء',
          confirm: 'تأكيد الحذف',
          loading: 'جارٍ...',
        },
        language: { title: 'لغة التطبيق' },
        fontSize: { title: 'حجم الخط' },
        fontFamily: { title: 'نوع الخط' },
      },
      sizes: { small: 'صغير', medium: 'متوسط', large: 'كبير', xlarge: 'كبير جداً' },
      fonts: { tajawal: 'Tajawal', cairo: 'Cairo', rubik: 'Rubik', 'ibm-plex': 'IBM Plex' },
      languages: { ar: 'العربية', en: 'English', fr: 'Français' },
    },
    common: {
      back: 'رجوع',      menu: 'القائمة',
      loading: 'جارٍ التحميل...',
      offline: 'لا يوجد اتصال بالإنترنت - بعض الميزات غير متاحة',
    },
  },
  en: {
    settings: {
      title: 'Settings',
      subtitle: 'Full control over your app, your way',
      sections: {
        account: 'Account',
        appearance: 'Appearance',
        calls: 'Calls',
        privacy: 'Privacy & Security',
        more: 'More',
      },
      items: {
        profile: { label: 'Profile', desc: 'Edit your name and photo' },
        fontSize: { label: 'Font Size' },
        fontFamily: { label: 'Font Family' },
        compactMode: { label: 'Compact Mode', desc: 'Optimized for small screens' },
        language: { label: 'App Language', desc: 'Choose interface language' },
        muteMic: { label: 'Mute Mic by Default' },
        speaker: { label: 'Speaker On by Default' },
        appLock: { label: 'App Lock', desc: 'Extra protection with PIN' },
        dataManagement: { label: 'Data Management', desc: 'Control your data storage' },
        resetApp: { label: 'Reset App', desc: 'Delete all chats and data' },
        support: { label: 'Contact Developer', desc: 'Feedback, suggestions, or issues' },
        share: { label: 'Share App', desc: 'Invite your friends' },
        partner: { label: 'Become a Partner', desc: 'Join as an official partner' },
        admin: { label: 'Admin Panel', desc: 'Manage users and content' },
      },
      quickActions: { atheer: 'Who is Atheer?', about: 'About Us', privacy: 'Privacy' },
      modals: {
        reset: {
          title: 'Confirm Reset',
          warning: 'This action cannot be undone. Type "delete" to confirm',
          placeholder: 'Type delete here...',
          cancel: 'Cancel',
          confirm: 'Confirm Delete',
          loading: 'Processing...',
        },
        language: { title: 'App Language' },
        fontSize: { title: 'Font Size' },
        fontFamily: { title: 'Font Family' },
      },
      sizes: { small: 'Small', medium: 'Medium', large: 'Large', xlarge: 'Extra Large' },
      fonts: { tajawal: 'Tajawal', cairo: 'Cairo', rubik: 'Rubik', 'ibm-plex': 'IBM Plex' },
      languages: { ar: 'العربية', en: 'English', fr: 'Français' },
    },    common: {
      back: 'Back',
      menu: 'Menu',
      loading: 'Loading...',
      offline: 'No internet connection - some features unavailable',
    },
  },
  fr: {
    settings: {
      title: 'Paramètres',
      subtitle: 'Contrôle total de votre application',
      sections: {
        account: 'Compte',
        appearance: 'Apparence',
        calls: 'Appels',
        privacy: 'Confidentialité & Sécurité',
        more: 'Plus',
      },
      items: {
        profile: { label: 'Profil', desc: 'Modifier votre nom et photo' },
        fontSize: { label: 'Taille de police' },
        fontFamily: { label: 'Famille de police' },
        compactMode: { label: 'Mode compact', desc: 'Optimisé pour petits écrans' },
        language: { label: 'Langue de l\'application', desc: 'Choisir la langue d\'interface' },
        muteMic: { label: 'Muet par défaut' },
        speaker: { label: 'Haut-parleur par défaut' },
        appLock: { label: 'Verrouillage', desc: 'Protection supplémentaire par code' },
        dataManagement: { label: 'Gestion des données', desc: 'Contrôler le stockage' },
        resetApp: { label: 'Réinitialiser', desc: 'Supprimer toutes les données' },
        support: { label: 'Contacter le développeur', desc: 'Retours, suggestions, problèmes' },
        share: { label: 'Partager l\'app', desc: 'Inviter vos amis' },
        partner: { label: 'Devenir partenaire', desc: 'Rejoindre comme partenaire' },
        admin: { label: 'Panneau admin', desc: 'Gérer utilisateurs et contenu' },
      },
      quickActions: { atheer: 'Qui est Atheer ?', about: 'À propos', privacy: 'Confidentialité' },
      modals: {
        reset: {
          title: 'Confirmer la réinitialisation',
          warning: 'Cette action est irréversible. Tapez "supprimer" pour confirmer',
          placeholder: 'Tapez supprimer ici...',
          cancel: 'Annuler',
          confirm: 'Confirmer',
          loading: 'En cours...',
        },
        language: { title: 'Langue de l\'application' },
        fontSize: { title: 'Taille de police' },
        fontFamily: { title: 'Famille de police' },
      },
      sizes: { small: 'Petite', medium: 'Moyenne', large: 'Grande', xlarge: 'Très grande' },
      fonts: { tajawal: 'Tajawal', cairo: 'Cairo', rubik: 'Rubik', 'ibm-plex': 'IBM Plex' },      languages: { ar: 'العربية', en: 'English', fr: 'Français' },
    },
    common: {
      back: 'Retour',
      menu: 'Menu',
      loading: 'Chargement...',
      offline: 'Pas de connexion - certaines fonctionnalités indisponibles',
    },
  },
};

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('atheer_language') || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('atheer_language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    return value;
  };

  const changeLanguage = (lng) => setLanguage(lng);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};