/**
 * Phase A / A13 - tenant-keyed portal lookup cache.
 *
 * The 14 lookup caches the portal keeps in localStorage are tenant-owned metadata. They are stored
 * as `lk:v2:<tenantId>:<key>`, where the tenant is the signed-in session token's own `tenantId`
 * claim (never a caller-supplied value). With no usable tenant nothing is read or written.
 * The old unversioned keys (`genderLookups`, `workLocationLookups`, ...) are never read and are
 * removed by purgeForeignLookupStorage (boot / sign-in) and clearTenantLookupStorage (sign-out,
 * token-expiry cleanup). Auth material and other preferences are not touched.
 */

/** Single list that drives both writes and clears. */
export const TENANT_LOOKUP_KEYS = [
  'allLookups',
  'cityLookups',
  'genderLookups',
  'titleLookups',
  'primarySection',
  'secondarySection',
  'workLocationLookups',
  'countries',
  'categories',
  'gradeLookups',
  'paymentLookups',
  'studyLocationLookups',
  'disciplineLookups',
  'youthForumLookups',
];

const PREFIX = 'lk:v2:';
const PLACEHOLDER_TENANTS = new Set(['default', 'unknown', 'system', 'null', 'undefined']);
const OBJECT_ID = /^[0-9a-f]{24}$/i;

const defaultStorage = () => {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
};

export const cleanTenantId = tenantId => {
  const t = tenantId == null ? '' : String(tenantId).trim();
  if (!t || PLACEHOLDER_TENANTS.has(t.toLowerCase()) || !OBJECT_ID.test(t)) return null;
  return t;
};

/** tenantId claim of a JWT (no verification - used only to key the local cache). */
export const tokenTenantId = token => {
  try {
    const part = String(token || '').split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return cleanTenantId(JSON.parse(json)?.tenantId);
  } catch {
    return null;
  }
};

export const sessionTenantId = (storage = defaultStorage()) =>
  storage ? tokenTenantId(storage.getItem('token')) : null;

export const lookupStorageKey = (key, tenantId) => {
  const t = cleanTenantId(tenantId);
  return t && TENANT_LOOKUP_KEYS.includes(key) ? `${PREFIX}${t}:${key}` : null;
};

/** Raw stored JSON for the current session tenant, or null. */
export const readLookupItem = (key, storage = defaultStorage()) => {
  const k = storage && lookupStorageKey(key, sessionTenantId(storage));
  return k ? storage.getItem(k) : null;
};

/** Stores under the current session tenant; false (nothing written) without a tenant. */
export const writeLookupItem = (key, json, storage = defaultStorage()) => {
  const k = storage && lookupStorageKey(key, sessionTenantId(storage));
  if (!k) return false;
  storage.setItem(k, json);
  return true;
};

const allKeys = storage => {
  const keys = [];
  for (let i = 0; i < storage.length; i += 1) keys.push(storage.key(i));
  return keys.filter(Boolean);
};

/** Removes the legacy unversioned keys and every lk:v2 entry not belonging to keepTenantId. */
export const purgeForeignLookupStorage = (
  keepTenantId = sessionTenantId(),
  storage = defaultStorage(),
) => {
  if (!storage) return [];
  const keep = cleanTenantId(keepTenantId);
  const removed = [];
  for (const key of allKeys(storage)) {
    const legacy = TENANT_LOOKUP_KEYS.includes(key);
    const foreign = key.startsWith(PREFIX) && (!keep || !key.startsWith(`${PREFIX}${keep}:`));
    if (legacy || foreign) {
      storage.removeItem(key);
      removed.push(key);
    }
  }
  return removed;
};

/** Sign-out / token-expiry cleanup: no tenant lookup cache survives. */
export const clearTenantLookupStorage = (storage = defaultStorage()) =>
  purgeForeignLookupStorage(null, storage);
