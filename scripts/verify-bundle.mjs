// Post-build bundle check. Usage: node scripts/verify-bundle.mjs <distDir> <expectedApiDomain>
// Fails (exit 1) if the built client bundle
//   - does not contain the expected API domain,
//   - contains the DEV :8443 gateway when a different domain was expected (UAT build),
//   - contains any JWT secret variable name or a value passed in BUNDLE_FORBIDDEN_FILE (one per line,
//     never printed - only a count is reported), or a JWT signing / decryption library.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [dist, expected] = process.argv.slice(2);
if (!dist || !expected) {
  console.error('usage: node scripts/verify-bundle.mjs <distDir> <expectedApiDomain>');
  process.exit(2);
}
const DEV = 'projectshell-vm.northeurope.cloudapp.azure.com:8443';

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(js|mjs|css|html|json|map|txt)$/.test(name)) files.push(p);
  }
})(dist);
const text = files.map((f) => readFileSync(f, 'utf8')).join('\n');

const forbidden = process.env.BUNDLE_FORBIDDEN_FILE
  ? readFileSync(process.env.BUNDLE_FORBIDDEN_FILE, 'utf8').split('\n').map((s) => s.trim()).filter((s) => s.length >= 12)
  : [];

const problems = [];
if (!text.includes(expected)) problems.push(`expected API domain not found in bundle`);
if (expected !== DEV && text.includes(DEV)) problems.push('DEV :8443 gateway found in a non-DEV bundle');
for (const name of ['VITE_JWT_SECRET', 'REACT_APP_JWT_SECRET', 'JWT_SECRET']) {
  if (text.includes(name)) problems.push(`secret variable name ${name} present`);
}
for (const lib of ['jsonwebtoken', 'jwt.sign(', 'crypto-js', 'CryptoJS.AES']) {
  if (text.includes(lib)) problems.push(`client-side JWT signing/decryption code present (${lib})`);
}
const hits = forbidden.filter((v) => text.includes(v)).length;
if (hits) problems.push(`${hits} forbidden secret value(s) present`);

console.log(`[verify-bundle] files=${files.length} expectedDomain=${text.includes(expected)} dev8443=${text.includes(DEV)} forbiddenValuesChecked=${forbidden.length} hits=${hits}`);
if (problems.length) {
  for (const p of problems) console.error(`[verify-bundle] FAIL: ${p}`);
  process.exit(1);
}
console.log('[verify-bundle] PASS');
