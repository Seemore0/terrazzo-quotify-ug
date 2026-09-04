import fs from 'node:fs';
import path from 'node:path';

const ANDROID_DIR = path.resolve('android');
const MANIFEST = path.join(ANDROID_DIR, 'app', 'src', 'main', 'AndroidManifest.xml');
const STRINGS = path.join(ANDROID_DIR, 'app', 'src', 'main', 'res', 'values', 'strings.xml');
const APP_SCHEME = 'ug.co.terrazzo.quotation';

if (!fs.existsSync(MANIFEST) || !fs.existsSync(STRINGS)) {
  throw new Error('Generated Android project is missing AndroidManifest.xml or strings.xml');
}

let manifest = fs.readFileSync(MANIFEST, 'utf8');
let strings = fs.readFileSync(STRINGS, 'utf8');

if (/name="custom_url_scheme"/.test(strings)) {
  strings = strings.replace(/<string\s+name="custom_url_scheme">[^<]*<\/string>/, `<string name="custom_url_scheme">${APP_SCHEME}</string>`);
} else {
  strings = strings.replace('</resources>', `  <string name="custom_url_scheme">${APP_SCHEME}</string>\n</resources>`);
}

const deepLinkFilter = `
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="${APP_SCHEME}" />
            </intent-filter>`;

if (!manifest.includes(`android:scheme="${APP_SCHEME}"`)) {
  const mainActivity = manifest.match(/(<activity\b[^>]*android:name="[^"]*MainActivity[^"]*"[^>]*>)([\s\S]*?)(<\/activity>)/);
  if (!mainActivity) throw new Error('Could not locate Capacitor MainActivity in AndroidManifest.xml');
  manifest = manifest.replace(mainActivity[0], `${mainActivity[1]}${mainActivity[2]}${deepLinkFilter}\n        ${mainActivity[3]}`);
}

const whatsappQueries = `
    <queries>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="whatsapp" />
        </intent>
    </queries>`;

if (!manifest.includes('android:scheme="whatsapp"')) {
  manifest = manifest.replace('<application', `${whatsappQueries}\n    <application`);
}

fs.writeFileSync(MANIFEST, manifest);
fs.writeFileSync(STRINGS, strings);
console.log('Configured Android custom auth scheme and WhatsApp app query.');
