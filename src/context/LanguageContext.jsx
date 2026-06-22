import { createContext, useContext, useState, useEffect } from 'react';
import en from '../translations/en';
import ar from '../translations/ar';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => localStorage.getItem('appLang') || 'en');

    useEffect(() => {
        localStorage.setItem('appLang', lang);
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    }, [lang]);

    const changeLanguage = (newLang) => {
        setLang(newLang);
    };

    const isRTL = lang === 'ar';
    const t = lang === 'ar' ? ar : en;

    return (
        <LanguageContext.Provider value={{ lang, setLang, changeLanguage, isRTL, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
