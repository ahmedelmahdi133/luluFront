#!/usr/bin/env node
/**
 * =============================================
 *  Index Pharma — License Key Generator
 * =============================================
 * 
 *  سكريبت للمطور فقط — لتوليد أكواد التفعيل
 * 
 *  الاستخدام:
 *    node generate-license.js <HARDWARE_ID>
 * 
 *  مثال:
 *    node generate-license.js A1B2-C3D4-E5F6-G7H8
 * 
 * =============================================
 */

const { generateLicenseKey } = require('./license-manager.cjs');

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║    Index Pharma — مولّد أكواد التفعيل       ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
    console.log('  الاستخدام:');
    console.log('    node generate-license.js <HARDWARE_ID>');
    console.log('');
    console.log('  مثال:');
    console.log('    node generate-license.js A1B2-C3D4-E5F6-G7H8');
    console.log('');
    process.exit(1);
}

const hardwareId = args.join(' ').trim().toUpperCase();

console.log('');
console.log('╔══════════════════════════════════════════════╗');
console.log('║    Index Pharma — License Key Generator      ║');
console.log('╚══════════════════════════════════════════════╝');
console.log('');
console.log(`  🖥️  Hardware ID:   ${hardwareId}`);
console.log('');

const licenseKey = generateLicenseKey(hardwareId);

console.log(`  🔑  License Key:   ${licenseKey}`);
console.log('');
console.log('  ✅ أرسل هذا الكود للعميل لتفعيل النظام');
console.log('');
