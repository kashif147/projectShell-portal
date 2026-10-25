// API gateway host (and optional port) the portal talks to. Chosen at BUILD time from
// VITE_API_DOMAIN, so each Vercel project builds against its own environment:
//   DEV  (project-shell-portal-dev): unset -> DEV_API_DOMAIN (the :8443 DEV gateway)
//   UAT  (project-shell-portal):     VITE_API_DOMAIN=projectshell-vm.northeurope.cloudapp.azure.com (:443)
// Only a bare host[:port] is accepted - no scheme, path, query or credentials - and anything else
// fails the build instead of silently pointing the app somewhere unexpected.
export const DEV_API_DOMAIN = 'projectshell-vm.northeurope.cloudapp.azure.com:8443';

const HOST_PORT = /^(?=.{1,253}(?::\d{1,5})?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*(?::\d{1,5})?$/i;

export function resolveApiDomain(value) {
  const domain = (value ?? '').trim();
  if (!domain) return DEV_API_DOMAIN;
  if (!HOST_PORT.test(domain)) {
    throw new Error(`VITE_API_DOMAIN must be a bare host[:port], got "${domain}"`);
  }
  const port = domain.includes(':') ? Number(domain.split(':')[1]) : null;
  if (port !== null && (port < 1 || port > 65535)) {
    throw new Error(`VITE_API_DOMAIN has an invalid port, got "${domain}"`);
  }
  return domain.toLowerCase();
}
