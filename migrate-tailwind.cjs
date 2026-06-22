const fs = require('fs');
const path = require('path');

const map = {
    // Buttons
    'btn': 'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-md border-none cursor-pointer transition-all leading-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-primary': 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-[0_4px_12px_rgba(79,70,229,0.3)] disabled:hover:bg-indigo-600',
    'btn-success': 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:hover:bg-emerald-600',
    'btn-danger': 'bg-red-600 text-white hover:bg-red-700 disabled:hover:bg-red-600',
    'btn-warning': 'bg-amber-600 text-white hover:bg-amber-700 disabled:hover:bg-amber-600',
    'btn-ghost': 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:hover:bg-transparent',
    'btn-outline': 'bg-transparent text-indigo-600 border-[1.5px] border-slate-200 hover:bg-indigo-50 hover:border-indigo-600 disabled:hover:bg-transparent',
    'btn-sm': 'px-3 py-1.5 text-xs rounded-md',
    'btn-lg': 'px-6 py-3 text-base rounded-lg',
    'btn-icon': 'p-2 rounded-md',
    'btn-icon-sm': 'p-1.5 rounded-sm',

    // Cards
    'card': 'bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md',
    'card-body': 'p-6',
    'card-header': 'px-6 py-5 border-b border-slate-100 flex items-center justify-between',
    'card-footer': 'px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl',
    'card-interactive': 'hover:shadow-lg hover:-translate-y-[1px]',
    'card-glass': 'bg-white/70 backdrop-blur-md border border-white/40 shadow-xl',

    // Forms
    'form-group': 'flex flex-col gap-1',
    'form-label': 'text-sm font-semibold text-slate-600 tracking-[0.01em]',
    'form-input': 'w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border-[1.5px] border-slate-200 rounded-md outline-none transition-all hover:border-slate-300 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/15',
    'form-select': 'w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border-[1.5px] border-slate-200 rounded-md outline-none transition-all hover:border-slate-300 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/15',
    'form-textarea': 'w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border-[1.5px] border-slate-200 rounded-md outline-none transition-all hover:border-slate-300 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/15',
    'form-input-error': 'border-red-600 focus:ring-red-600/15',
    'form-hint': 'text-xs text-slate-400',

    // Badges
    'badge': 'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full leading-[1.4]',
    'badge-primary': 'bg-indigo-100 text-indigo-800',
    'badge-success': 'bg-emerald-100 text-emerald-800',
    'badge-warning': 'bg-amber-100 text-amber-900',
    'badge-danger': 'bg-red-100 text-red-800',
    'badge-info': 'bg-cyan-100 text-cyan-800',
    'badge-neutral': 'bg-slate-200 text-slate-600',

    // Tables
    'data-table-wrapper': 'bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden',
    'data-table': 'w-full border-collapse text-sm',
    'table-toolbar': 'flex items-center justify-between px-6 py-4 border-b border-slate-100 gap-3 flex-wrap',
    'table-toolbar-left': 'flex items-center gap-3 flex-1 min-w-0',
    'table-toolbar-right': 'flex items-center gap-2',
    'table-pagination': 'flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl text-sm text-slate-500',
    'table-pagination-controls': 'flex items-center gap-1',
    'table-pagination-btn': 'flex items-center justify-center min-w-[32px] px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-slate-500 text-sm cursor-pointer transition-all hover:bg-indigo-50 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed',

    // Layout
    'page-header': 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6',
    'page-header-info': 'flex flex-col',
    'page-header-actions': 'flex items-center gap-3 shrink-0',
    'app-main-content': 'flex-1 overflow-y-auto p-6 bg-slate-50',
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

console.log("Migration script completed.");
