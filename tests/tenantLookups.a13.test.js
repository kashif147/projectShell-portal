// Phase A / A13 - tenant-keyed portal lookup cache, stable-code resolution, source guard.
// node --test (no extra dependencies). Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  TENANT_LOOKUP_KEYS,
  clearTenantLookupStorage,
  lookupStorageKey,
  purgeForeignLookupStorage,
  readLookupItem,
  sessionTenantId,
  writeLookupItem,
} from '../src/helpers/tenantStorage.js';
import {
  isRetiredAssociateProduct,
  isUndergraduateStudentMembership,
} from '../src/helpers/subscriptionPricing.helper.js';

const A = '68cbf7806080b4621d469d34'; // MULTIAUTH
const B = '6acd6119b28a863c61361ae0'; // DEVTENANTB
const D = '6ad4e0c941376f7df605fd57'; // DEVDIRB
const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const fakeStorage = () => {
  const m = new Map();
  return {
    get length() { return m.size; },
    key: i => [...m.keys()][i] ?? null,
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
    keys: () => [...m.keys()].sort(),
  };
};
const b64url = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const signIn = (s, tenantId) => s.setItem('token', `${b64url({ alg: 'HS256' })}.${b64url({ tenantId })}.sig`);

test('one key list of 14 lookup caches drives writes and clears (incl. youthForumLookups)', () => {
  assert.equal(TENANT_LOOKUP_KEYS.length, 14);
  assert.ok(TENANT_LOOKUP_KEYS.includes('youthForumLookups'));
  assert.ok(TENANT_LOOKUP_KEYS.includes('workLocationLookups'));
  assert.ok(TENANT_LOOKUP_KEYS.includes('categories'));
});

test('stored as lk:v2:<tenantId>:<key> for the session token tenant', () => {
  const s = fakeStorage();
  signIn(s, A);
  assert.equal(sessionTenantId(s), A);
  assert.equal(writeLookupItem('workLocationLookups', '[1]', s), true);
  assert.deepEqual(s.keys(), [`lk:v2:${A}:workLocationLookups`, 'token']);
  assert.equal(readLookupItem('workLocationLookups', s), '[1]');
  assert.equal(lookupStorageKey('notALookupKey', A), null);
});

test('placeholder / missing tenant fails closed: nothing read or written', () => {
  for (const t of [undefined, '', 'default', 'unknown', 'system', 'abc']) {
    const s = fakeStorage();
    signIn(s, t);
    assert.equal(sessionTenantId(s), null);
    assert.equal(writeLookupItem('categories', '[1]', s), false);
    assert.equal(readLookupItem('categories', s), null);
    assert.deepEqual(s.keys(), ['token']);
  }
});

test('tenant change cannot read the prior tenant cache; legacy global keys are never read', () => {
  const s = fakeStorage();
  s.setItem('categories', '["legacy-global"]');
  signIn(s, A);
  writeLookupItem('categories', '["A"]', s);
  for (const t of [B, D]) {
    signIn(s, t);
    assert.equal(readLookupItem('categories', s), null);
  }
});

test('boot / sign-in purge: legacy unversioned keys and other tenants are removed; own + unrelated kept', () => {
  const s = fakeStorage();
  for (const k of TENANT_LOOKUP_KEYS) s.setItem(k, '[]');
  s.setItem(`lk:v2:${A}:countries`, '[]');
  s.setItem(`lk:v2:${D}:countries`, '[]');
  s.setItem('fcmDeviceId', 'dev-1');
  signIn(s, D);
  purgeForeignLookupStorage(sessionTenantId(s), s);
  assert.deepEqual(s.keys(), ['fcmDeviceId', `lk:v2:${D}:countries`, 'token']);
});

test('sign-out / token-expiry cleanup removes every tenant lookup cache, keeps auth-unrelated keys', () => {
  const s = fakeStorage();
  signIn(s, A);
  for (const k of TENANT_LOOKUP_KEYS) writeLookupItem(k, '[]', s);
  s.setItem('youthForumLookups', '[]');
  s.setItem('fcmDeviceId', 'dev-1');
  clearTenantLookupStorage(s);
  assert.deepEqual(s.keys(), ['fcmDeviceId', 'token']);
});

test('4080 / 4090 behaviour keys off the product code, not the label', () => {
  assert.equal(isRetiredAssociateProduct({ code: '4080', name: 'Renamed' }), true);
  assert.equal(isRetiredAssociateProduct({ code: '4000', name: 'Retired Associate' }), false);
  assert.equal(isRetiredAssociateProduct(null), false);
  assert.equal(isUndergraduateStudentMembership('x', { code: '4090', name: 'Renamed' }), true);
  assert.equal(isUndergraduateStudentMembership('Undergraduate Student', { code: '4000', name: 'Undergraduate Student' }), false);
});

const runtimeFiles = () => {
  const out = [];
  const walk = dir => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(js|jsx)$/.test(e.name)) out.push(p);
    }
  };
  walk(SRC);
  return out;
};

test('source guard: the retired hardcoded ids and any ObjectId literal are gone from portal src', () => {
  const RETIRED = ['68d036e2662428d1c504b3ad', '68dae613c5b15073d66b891f', '68dae699c5b15073d66b892c', '68dae699c5b15073d66b892d', '68cbf7806080b4621d469d34'];
  const hits = [];
  for (const f of runtimeFiles()) {
    const text = fs.readFileSync(f, 'utf8');
    for (const id of RETIRED) if (text.includes(id)) hits.push(`${path.relative(SRC, f)} ${id}`);
    text.split('\n').forEach((line, i) => {
      if (/^\s*(\/\/|\*)/.test(line)) return;
      if (/['"`][0-9a-f]{24}['"`]/.test(line)) hits.push(`${path.relative(SRC, f)}:${i + 1}`);
    });
  }
  assert.deepEqual(hits, []);
});

test('WORKLOC and MEM are requested by stable code; no tenantId is sent by the client', () => {
  const lookupApi = fs.readFileSync(path.join(SRC, 'api/lookup.api.jsx'), 'utf8');
  const categoryApi = fs.readFileSync(path.join(SRC, 'api/category.api.jsx'), 'utf8');
  const ctx = fs.readFileSync(path.join(SRC, 'contexts/lookupContext.jsx'), 'utf8');
  assert.match(lookupApi, /\/api\/lookup\/by-type-code\/\$\{encodeURIComponent\(typeCode\)\}\/hierarchy/);
  assert.match(categoryApi, /\/api\/products\/by-type-code\/\$\{encodeURIComponent\(typeCode\)\}/);
  assert.match(ctx, /WORK_LOCATION_TYPE_CODE = 'WORKLOC'/);
  assert.match(ctx, /MEMBERSHIP_PRODUCT_TYPE_CODE = 'MEM'/);
  assert.doesNotMatch(ctx, /window\.localStorage\.(get|set)Item\(key/);
  assert.doesNotMatch(lookupApi + categoryApi, /tenantId/);
});
