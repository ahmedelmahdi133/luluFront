const fs = require('fs');
const path = require('path');

const map = {
    // Dashboard & Stats
    'stats-grid': 'grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5',
    'stat-card': 'bg-white rounded-xl p-5 shadow-sm border border-slate-100 transition-all relative overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-0.5 before:content-[\'\'] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[var(--stat-accent-color,#4f46e5)] before:opacity-80',
    'stat-card-icon': 'w-12 h-12 rounded-lg flex items-center justify-center shrink-0 rtl:ml-4 rtl:mr-0',
    'stat-card-label': 'text-sm text-slate-500 font-medium mb-0.5',
    'stat-card-value': 'text-2xl font-bold text-slate-900 leading-tight',
    'stat-card-trend': 'text-xs font-semibold mt-2 flex items-center gap-1',
    'up': 'text-emerald-600',
    'down': 'text-red-600',
    'quick-action': 'flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl no-underline text-slate-900 transition-all shadow-sm hover:border-indigo-600 hover:bg-indigo-50 hover:-translate-y-0.5 hover:shadow-md group',
    'quick-action-icon': 'w-[42px] h-[42px] rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 rtl:ml-3 rtl:mr-0',
    
    // Empty states
    'empty-state': 'flex flex-col items-center justify-center text-center text-slate-400 p-12',
    'empty-state-icon': 'text-slate-200 mb-3 opacity-50',
    'empty-state-title': 'text-base font-semibold text-slate-600 mb-1',
    'empty-state-desc': 'text-sm max-w-[250px]',

    // App Layout / Sidebar
    'app-shell': 'flex h-screen overflow-hidden bg-slate-50',
    'sidebar': 'w-[264px] bg-slate-900 flex flex-col shrink-0 transition-[width] duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.15)] z-[200] relative overflow-hidden',
    'sidebar.collapsed': 'w-[72px]',
    'sidebar-logo': 'p-5 border-b border-white/10 flex items-center gap-3 min-h-[64px]',
    'sidebar-logo-icon': 'w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0',
    'sidebar-logo-text': 'flex flex-col overflow-hidden whitespace-nowrap',
    'sidebar-logo-name': 'text-white font-bold text-base tracking-wide',
    'sidebar-logo-sub': 'text-slate-400 text-xs',
    'sidebar-nav': 'flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-700',
    'sidebar-group': 'mb-4',
    'sidebar-group-label': 'px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider',
    'sidebar-item': 'flex items-center gap-3 px-6 py-2.5 mx-3 rounded-lg text-slate-400 no-underline transition-colors hover:bg-white/5 hover:text-white group',
    'sidebar-item.active': 'bg-indigo-600/10 text-indigo-400 font-medium',
    'sidebar-item-icon': 'shrink-0',
    'sidebar-divider': 'h-px bg-white/5 mx-6 my-2',
    'sidebar-footer': 'p-4 border-t border-white/5 bg-slate-900/50',
    'sidebar-user-card': 'flex flex-col mb-3 px-2',
    'sidebar-user-name': 'text-sm font-semibold text-white truncate',
    'sidebar-user-role': 'text-xs text-slate-400',
    'sidebar-logout': 'w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors border-none cursor-pointer',
    'sidebar-version': 'text-center text-[10px] text-slate-600 pb-2',
    
    // Header
    'app-header': 'h-16 bg-white/85 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-5 z-[100] shrink-0',
    'header-left': 'flex items-center gap-4',
    'header-title': 'text-lg font-bold text-slate-800 m-0',
    'header-right': 'flex items-center gap-3',
    'header-search': 'relative flex items-center',
    'search-icon': 'absolute left-3 text-slate-400 rtl:right-3 rtl:left-auto',
    'search-input': 'w-64 pl-9 pr-12 py-2 text-sm bg-slate-100 border-none rounded-lg outline-none focus:ring-2 focus:ring-indigo-600/20 rtl:pr-9 rtl:pl-12 transition-all',
    'search-shortcut': 'absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white rounded border border-slate-200 text-[10px] font-mono text-slate-400 rtl:left-2 rtl:right-auto',
    'header-divider': 'w-px h-6 bg-slate-200 mx-1',
    'notification-btn': 'relative p-2 text-slate-500 hover:text-slate-800 transition-colors bg-transparent border-none cursor-pointer',
    'notification-badge': 'absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white',
    
    // User Menu
    'user-menu-container': 'relative',
    'user-menu-btn': 'flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer',
    'user-avatar': 'w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm',
    'user-name-short': 'text-sm font-medium text-slate-700 hidden sm:block',
    'chevron': 'text-slate-400 transition-transform',
    'chevron.open': 'rotate-180',
    'user-dropdown-menu': 'absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-[200]',
    'dropdown-header': 'px-4 py-2 flex flex-col',
    'dropdown-divider': 'h-px bg-slate-100 my-1',
    'dropdown-item': 'w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors border-none bg-transparent cursor-pointer',
    'dropdown-overlay': 'fixed inset-0 z-[199]',
    
    // Grid Utilities
    'grid-2': 'grid grid-cols-1 lg:grid-cols-2 gap-5',
    'grid-3': 'grid grid-cols-1 lg:grid-cols-3 gap-5',
    'grid-4': 'grid grid-cols-1 lg:grid-cols-4 gap-5',
    'grid-2-1': 'grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5',
    'grid-1-1': 'grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-5',
    
    // App CSS
    'section-title': 'text-lg font-bold text-slate-900 mb-4 flex items-center gap-2',
    'alert-banner': 'p-3 px-4 rounded-md text-sm font-semibold flex items-center gap-2',
    'alert-banner-danger': 'bg-red-50 text-red-800',
    'alert-banner-warning': 'bg-amber-50 text-amber-900',
    'alert-banner-success': 'bg-emerald-50 text-emerald-800',
    'alert-banner-info': 'bg-cyan-50 text-cyan-800',
};

function processFile(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    let regexClassName = /className=(["'])(.*?)\1/g;
    content = content.replace(regexClassName, (match, quote, classString) => {
        let classes = classString.split(' ');
        classes = classes.map(c => map[c] ? map[c] : c);
        classes = [...new Set(classes.join(' ').split(' '))];
        return `className=${quote}${classes.join(' ').trim()}${quote}`;
    });

    let regexClassNameTemplate = /className=\{`([^`]*?)`\}/g;
    content = content.replace(regexClassNameTemplate, (match, classString) => {
        let newString = classString;
        Object.keys(map).sort((a,b) => b.length - a.length).forEach(key => {
            const r = new RegExp(`(?<!\\S)${key}(?!\\S)`, 'g');
            newString = newString.replace(r, map[key]);
        });
        newString = newString.replace(/\s+/g, ' ').trim();
        return `className={\`${newString}\`}`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else {
            processFile(fullPath);
        }
    });
}

walkDir(path.join(__dirname, 'src/components'));
walkDir(path.join(__dirname, 'src/pages'));

console.log("Migration script 2 completed.");
