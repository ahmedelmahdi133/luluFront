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

// Replace Postgres schema with SQLite schema
console.log('🔄 استبدال إعدادات Prisma لتدعم SQLite...');
const sqliteSchemaPath = path.join(bundleBackend, 'prisma', 'schema.sqlite.prisma');
const targetSchemaPath = path.join(bundleBackend, 'prisma', 'schema.prisma');
if (fs.existsSync(sqliteSchemaPath)) {
    fs.copyFileSync(sqliteSchemaPath, targetSchemaPath);
    // Remove the extra sqlite file from bundle
    fs.unlinkSync(sqliteSchemaPath);
}

// Write a specific prisma.config.js for desktop mode
const desktopPrismaConfig = `const { defineConfig } = require('prisma/config');
module.exports = defineConfig({
  engine: 'classic', 
  datasource: {
    url: 'file:./dev.db'
  }
});`;
fs.writeFileSync(path.join(bundleBackend, 'prisma.config.js'), desktopPrismaConfig);

console.log('📥 تثبيت اعتماديات الـ Backend للإنتاج...');
// We need pg for the migration script to read from the remote DB
// And Prisma CLI for db push. Instead of omitting dev, let's install everything and then prune later,
// or just install standard and prisma.
execSync('npm install', { cwd: bundleBackend, stdio: 'inherit', shell: true });
console.log('📥 تثبيت اعتماديات SQLite للنسخة المكتبية...');
execSync('npm install better-sqlite3 @libsql/client @prisma/adapter-libsql', { cwd: bundleBackend, stdio: 'inherit', shell: true });

console.log('🛠️ توليد Prisma Client ودفع الهيكل (SQLite)...');
execSync('npx prisma db push --accept-data-loss', {
    cwd: bundleBackend,
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        DATABASE_URL: 'file:./dev.db'
    }
});
execSync('npx prisma generate', {
    cwd: bundleBackend,
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        DATABASE_URL: 'file:./dev.db'
    }
});

console.log('🚀 تشغيل سكربت حقن المنتجات من PostgreSQL إلى SQLite...');
// copy migration script into bundle temporarily
const migrateScriptSrc = path.join(__dirname, 'migrate-to-sqlite.cjs');
const migrateScriptDest = path.join(bundleBackend, 'migrate-to-sqlite.cjs');
fs.copyFileSync(migrateScriptSrc, migrateScriptDest);

execSync('node migrate-to-sqlite.cjs', {
    cwd: bundleBackend,
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        DATABASE_URL: 'file:./dev.db'
    }
});

// Clean up migration script
fs.unlinkSync(migrateScriptDest);

// Now remove dev dependencies to keep bundle size small
console.log('🧹 تنظيف اعتماديات التطوير...');
execSync('npm prune --omit=dev', { cwd: bundleBackend, stdio: 'inherit', shell: true });


console.log('🌐 نسخ واجهة المستخدم المبنية...');
copyRecursive(path.join(frontendRoot, 'dist'), bundleApp);

console.log('✅ حزمة سطح المكتب جاهزة في desktop-bundle/');
