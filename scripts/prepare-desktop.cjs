const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const frontendRoot = path.join(__dirname, '..');
const backendRoot = path.join(frontendRoot, '..', 'backend');
const bundleRoot = path.join(frontendRoot, 'desktop-bundle');
const bundleBackend = path.join(bundleRoot, 'backend');
const bundleApp = path.join(bundleRoot, 'app');

const copyRecursive = (src, dest) => {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
};

const removeDir = (dir) => {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
};

console.log('🧹 تنظيف حزمة سطح المكتب...');
removeDir(bundleRoot);
fs.mkdirSync(bundleBackend, { recursive: true });
fs.mkdirSync(bundleApp, { recursive: true });

console.log('📦 نسخ ملفات الـ Backend...');
const backendItems = ['src', 'prisma', 'uploads', 'package.json', 'package-lock.json', 'prisma.config.js'];
for (const item of backendItems) {
    const src = path.join(backendRoot, item);
    const dest = path.join(bundleBackend, item);
    if (!fs.existsSync(src)) continue;
    if (fs.statSync(src).isDirectory()) {
        copyRecursive(src, dest);
    } else {
        fs.copyFileSync(src, dest);
    }
}

console.log('📥 تثبيت اعتماديات الـ Backend للإنتاج...');
execSync('npm install', { cwd: bundleBackend, stdio: 'inherit', shell: true });

console.log('🛠️ توليد Prisma Client (PostgreSQL)...');
execSync('npx prisma generate', {
    cwd: bundleBackend,
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        DATABASE_URL: 'postgres://dummy:dummy@localhost:5432/dummy'
    }
});

console.log('🧹 تنظيف اعتماديات التطوير...');
execSync('npm prune --omit=dev', { cwd: bundleBackend, stdio: 'inherit', shell: true });


console.log('🌐 نسخ واجهة المستخدم المبنية...');
copyRecursive(path.join(frontendRoot, 'dist'), bundleApp);

console.log('✅ حزمة سطح المكتب جاهزة في desktop-bundle/');
