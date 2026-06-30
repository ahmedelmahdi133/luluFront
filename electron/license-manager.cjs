const crypto = require('crypto');
const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

// ============================================
// المفتاح السري — يجب أن يبقى سرياً عند المطور فقط
// ============================================
const SECRET_KEY = 'INDEX_PHARMA_2024_SECRET_LICENSE_KEY_X9K2M5';

// ============================================
// جمع بصمة الجهاز (Hardware Fingerprint)
// ============================================

/**
 * تنفيذ أمر PowerShell والحصول على النتيجة
 */
const runCommand = (cmd) => {
    try {
        return execSync(cmd, {
            encoding: 'utf8',
            windowsHide: true,
            timeout: 10000,
            stdio: ['pipe', 'pipe', 'pipe']
        }).trim();
    } catch {
        return '';
    }
};

/**
 * الحصول على معرف المعالج
 */
const getCpuId = () => {
    const result = runCommand('powershell -NoProfile -Command "Get-CimInstance Win32_Processor | Select-Object -ExpandProperty ProcessorId"');
    return result || 'UNKNOWN_CPU';
};

/**
 * الحصول على الرقم التسلسلي للوحة الأم
 */
const getMotherboardSerial = () => {
    const result = runCommand('powershell -NoProfile -Command "Get-CimInstance Win32_BaseBoard | Select-Object -ExpandProperty SerialNumber"');
    return result || 'UNKNOWN_MB';
};

/**
 * الحصول على الرقم التسلسلي للقرص الصلب
 */
const getDiskSerial = () => {
    const result = runCommand('powershell -NoProfile -Command "Get-CimInstance Win32_DiskDrive | Select-Object -First 1 -ExpandProperty SerialNumber"');
    return (result || 'UNKNOWN_DISK').trim();
};

/**
 * الحصول على عنوان MAC الأول المتاح
 */
const getMacAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
                return iface.mac;
            }
        }
    }
    return 'UNKNOWN_MAC';
};

/**
 * إنشاء بصمة فريدة للجهاز (Hardware ID)
 * يتم دمج جميع المعرفات وتحويلها إلى Hash قصير
 */
const getHardwareFingerprint = () => {
    const cpuId = getCpuId();
    const mbSerial = getMotherboardSerial();
    const diskSerial = getDiskSerial();
    const macAddress = getMacAddress();
    const computerName = os.hostname();

    const rawFingerprint = [cpuId, mbSerial, diskSerial, macAddress, computerName].join('|');

    // إنشاء Hash وأخذ أول 16 حرف بشكل كبير
    const hash = crypto.createHash('sha256').update(rawFingerprint).digest('hex');
    const shortId = hash.substring(0, 16).toUpperCase();

    // تنسيق: XXXX-XXXX-XXXX-XXXX
    return shortId.match(/.{1,4}/g).join('-');
};

// ============================================
// توليد والتحقق من كود التفعيل
// ============================================

/**
 * توليد كود التفعيل بناءً على الـ Hardware ID
 * يستخدم HMAC-SHA256 مع المفتاح السري
 */
const generateLicenseKey = (hardwareId) => {
    const cleanId = hardwareId.replace(/-/g, '');
    const hmac = crypto.createHmac('sha256', SECRET_KEY).update(cleanId).digest('hex');
    // أخذ 20 حرف وتنسيقهم
    const key = hmac.substring(0, 20).toUpperCase();
    return key.match(/.{1,5}/g).join('-');
};

/**
 * التحقق من صحة كود التفعيل
 */
const validateLicenseKey = (hardwareId, licenseKey) => {
    const expectedKey = generateLicenseKey(hardwareId);
    return licenseKey.toUpperCase().replace(/\s/g, '') === expectedKey;
};

// ============================================
// إدارة ملف الترخيص
// ============================================

/**
 * الحصول على مسار ملف الترخيص
 */
const getLicensePath = (userDataPath) => {
    return path.join(userDataPath, '.license');
};

/**
 * تشفير بيانات الترخيص
 */
const encryptLicenseData = (data) => {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

/**
 * فك تشفير بيانات الترخيص
 */
const decryptLicenseData = (encryptedStr) => {
    try {
        const [ivHex, encrypted] = encryptedStr.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    } catch {
        return null;
    }
};

/**
 * حفظ ملف الترخيص
 */
const saveLicense = (userDataPath, hardwareId, licenseKey) => {
    const licensePath = getLicensePath(userDataPath);
    const data = {
        hardwareId,
        licenseKey,
        activatedAt: new Date().toISOString(),
        version: '1.0'
    };
    const encrypted = encryptLicenseData(data);
    fs.writeFileSync(licensePath, encrypted, 'utf8');
};

/**
 * تحميل والتحقق من ملف الترخيص
 * يتحقق من:
 * 1. وجود الملف
 * 2. صحة التشفير
 * 3. تطابق بصمة الجهاز
 * 4. صحة كود التفعيل
 */
const loadAndVerifyLicense = (userDataPath) => {
    const licensePath = getLicensePath(userDataPath);

    if (!fs.existsSync(licensePath)) {
        return { valid: false, reason: 'no_license_file' };
    }

    try {
        const encryptedStr = fs.readFileSync(licensePath, 'utf8');
        const data = decryptLicenseData(encryptedStr);

        if (!data) {
            return { valid: false, reason: 'corrupt_license' };
        }

        // التحقق من تطابق بصمة الجهاز
        const currentHardwareId = getHardwareFingerprint();
        if (data.hardwareId !== currentHardwareId) {
            return { valid: false, reason: 'hardware_mismatch' };
        }

        // التحقق من صحة كود التفعيل
        if (!validateLicenseKey(data.hardwareId, data.licenseKey)) {
            return { valid: false, reason: 'invalid_key' };
        }

        return { valid: true, data };
    } catch {
        return { valid: false, reason: 'read_error' };
    }
};

/**
 * فحص سريع: هل التطبيق مفعل؟
 */
const isActivated = (userDataPath) => {
    const result = loadAndVerifyLicense(userDataPath);
    return result.valid;
};

module.exports = {
    getHardwareFingerprint,
    generateLicenseKey,
    validateLicenseKey,
    saveLicense,
    loadAndVerifyLicense,
    isActivated,
    SECRET_KEY
};
