// node --test (no extra dependencies). Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEV_API_DOMAIN, resolveApiDomain } from '../src/constants/apiDomain.js';

const UAT = 'projectshell-vm.northeurope.cloudapp.azure.com';

test('DEV build (VITE_API_DOMAIN unset/empty) resolves to the existing DEV :8443 endpoint', () => {
  assert.equal(DEV_API_DOMAIN, 'projectshell-vm.northeurope.cloudapp.azure.com:8443');
  for (const v of [undefined, null, '', '   ']) assert.equal(resolveApiDomain(v), DEV_API_DOMAIN);
});

test('UAT build resolves to the UAT :443 endpoint, never the DEV :8443 one', () => {
  assert.equal(resolveApiDomain(UAT), UAT);
  assert.equal(resolveApiDomain(`  ${UAT.toUpperCase()}  `), UAT);
  assert.notEqual(resolveApiDomain(UAT), DEV_API_DOMAIN);
  assert.ok(!resolveApiDomain(UAT).includes(':8443'));
});

test('an explicit port is kept', () => {
  assert.equal(resolveApiDomain('localhost:4000'), 'localhost:4000');
});

test('anything but a bare host[:port] fails the build', () => {
  for (const bad of [
    `https://${UAT}`,
    `${UAT}/user-service`,
    `${UAT}?x=1`,
    `user:pass@${UAT}`,
    `${UAT}:0`,
    `${UAT}:99999`,
    'bad host',
    '-leading.example.com',
  ]) {
    assert.throws(() => resolveApiDomain(bad), /VITE_API_DOMAIN/, bad);
  }
});
