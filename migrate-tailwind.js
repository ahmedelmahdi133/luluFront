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

    // Misc Typography
    'text-primary': 'text-slate-900',
    'text-secondary': 'text-slate-600',
    'text-muted': 'text-slate-400',
    'font-normal': 'font-normal',
    'font-medium': 'font-medium',
    'font-semibold': 'font-semibold',
    'font-bold': 'font-bold',
    'font-extrabold': 'font-extrabold',
    'text-xs': 'text-xs',
    'text-sm': 'text-sm',
    'text-base': 'text-base',
    'text-md': 'text-[14px]',
    'text-lg': 'text-lg',
    'text-xl': 'text-xl',
    'text-2xl': 'text-2xl',
    'text-3xl': 'text-3xl',

    // Animations
    'animate-in': 'animate-fade-in-up', // Requires tailwind.config addition or standard translate-y
};

const tailwindOverrides = {
    // We will inject these dynamically if needed, but since we're replacing them directly...
}

function processFile(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Simple replacer for className="..." or className={`...`}
    // This is naive but works for a lot of basic React code.
    // It's safer to just replace word boundaries if we know they exist inside className.
    
    // Replace exact word matches for our keys inside strings
    Object.keys(map).forEach(key => {
        // We only want to replace words when they are used as classes.
        // A complex regex to find className="...key..."
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        
        // Only replace inside className="" or className={``}
        // This is tricky with simple regex. Let's just do global replace for very specific keys
        // Since words like 'card' could be variables, we MUST only replace inside className.
    });

    // Better approach: find className="[...]" or className={`[...]`} and replace inside it
    let regexClassName = /className=(["'])(.*?)\1/g;
    content = content.replace(regexClassName, (match, quote, classString) => {
        let classes = classString.split(' ');
        classes = classes.map(c => map[c] ? map[c] : c);
        // Deduplicate classes
        classes = [...new Set(classes.join(' ').split(' '))];
        return `className=${quote}${classes.join(' ')}${quote}`;
    });

    let regexClassNameTemplate = /className=\{`([^`]*?)`\}/g;
    content = content.replace(regexClassNameTemplate, (match, classString) => {
        // We have to be careful with ${} inside templates.
        // We only split by space if we are outside ${}
        // A simpler way is to replace word boundaries.
        let newString = classString;
        Object.keys(map).sort((a,b) => b.length - a.length).forEach(key => {
            const r = new RegExp(`(?<!\\S)${key}(?!\\S)`, 'g');
            newString = newString.replace(r, map[key]);
        });
        // cleanup multiple spaces
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
