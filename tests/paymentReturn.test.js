// Public Stripe Checkout return pages (/payments/success, /payments/cancel): standalone,
// presentation only, no sign-in, no API calls, query string never read or rendered.
// node --test (no extra dependencies). Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  PAYMENT_RETURN_COPY,
  PAYMENT_RETURN_PATHS,
  paymentReturnOutcome,
} from '../src/paymentReturn/paymentReturn.js';
import { PaymentReturnPage } from '../src/paymentReturn/PaymentReturnPage.js';

const SRC = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
const read = (rel) => fs.readFileSync(path.join(SRC, rel), 'utf8');
const render = (outcome) => renderToStaticMarkup(React.createElement(PaymentReturnPage, { outcome, logoSrc: '/logo.png' }));

test('exactly /payments/success and /payments/cancel are return paths', () => {
  assert.deepEqual(Object.keys(PAYMENT_RETURN_PATHS).sort(), ['/payments/cancel', '/payments/success']);
  assert.equal(paymentReturnOutcome('/payments/success'), 'success');
  assert.equal(paymentReturnOutcome('/payments/success/'), 'success');
  assert.equal(paymentReturnOutcome('/payments/cancel'), 'cancel');
  for (const p of ['/', '/payments', '/payments/', '/payments/credit-card', '/payments/method', '/payments/success/x',
    '/payments/successful', '/Payments/success', '/payments/success//', '/x/payments/success', '', undefined, null, {}]) {
    assert.equal(paymentReturnOutcome(p), null, String(p));
  }
});

test('/payments/success renders standalone with neutral wording (no "successful" claim) and no sign-in', () => {
  const html = render('success');
  assert.match(html, /data-payment-return="success"/);
  assert.ok(html.includes('Your payment has been submitted. We are confirming the payment status. You can close this page.'));
  assert.ok(!/successful|paid|confirmed\b/i.test(html), 'never claims the payment succeeded');
  assert.ok(!/sign.?in|log.?in|tenant/i.test(html), 'no sign-in or tenant step');
  assert.match(html, /<a href="\/"/);
});

test('/payments/cancel renders standalone with neutral wording', () => {
  const html = render('cancel');
  assert.match(html, /data-payment-return="cancel"/);
  assert.ok(html.includes('The payment was not completed. You can return to the payment link and try again if it is still valid.'));
  assert.ok(!/sign.?in|log.?in|tenant/i.test(html));
});

test('rendering makes no network call', () => {
  const calls = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = (...a) => { calls.push(a); return Promise.reject(new Error('no network')); };
  try {
    render('success');
    render('cancel');
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.equal(calls.length, 0);
});

test('the pages take no input from the URL: output is fixed per outcome, nothing from the query is rendered', () => {
  // The component has no query/props channel beyond outcome + logo, so a Stripe session id,
  // amount, application/member id or tenant in the query cannot reach the page.
  assert.equal(render('success'), render('success'));
  const html = render('success') + render('cancel');
  for (const s of ['cs_test_', 'pi_', 'session_id', 'amount', 'applicationId', 'tenantId', 'eur', '€']) {
    assert.ok(!html.includes(s), s);
  }
  for (const f of ['paymentReturn/paymentReturn.js', 'paymentReturn/PaymentReturnPage.js', 'paymentReturn/boot.js']) {
    const code = read(f).replace(/\/\/.*$/gm, '');
    assert.ok(!/URLSearchParams|searchParams|\.get\(|session_id|useLocation|useSearchParams/.test(code), `${f} reads the query`);
    assert.ok(!/fetch\(|axios|XMLHttpRequest|\/api\/|services\/|store\/|auth/i.test(code), `${f} calls or imports an API, store or auth`);
  }
  // boot.js touches the query only to drop it from the address bar
  assert.match(read('paymentReturn/boot.js'), /window\.history\.replaceState\(null, '', window\.location\.pathname\)/);
});

test('entry point: return paths are decided BEFORE the portal app is loaded; the app is never imported statically', () => {
  const entry = read('index.jsx');
  assert.match(entry, /paymentReturnOutcome\(window\.location\.pathname\)/);
  assert.match(entry, /import\('\.\/paymentReturn\/boot\.js'\)/);
  assert.match(entry, /import\('\.\/app\.jsx'\)/);
  assert.ok(!/^import .*app\.jsx/m.test(entry), 'app.jsx must not be a static import');
  assert.ok(entry.indexOf("import('./paymentReturn/boot.js')") < entry.indexOf("import('./app.jsx')"));
});

test('existing behaviour unchanged: unknown paths -> ErrorPage; authenticated payment routes untouched', () => {
  const app = read('app.jsx');
  assert.match(app, /<Route path="\*" element={<ErrorPage \/>} \/>/);
  assert.match(app, /auth\.isSignedIn \? privateRoutes : publicRoutes/);
  const routes = read('config/routes.jsx');
  for (const p of ['payments', 'payments/method', 'payments/credit-card', 'payments/standing-order', 'payments/direct-debit', 'payments/salary-deduction']) {
    assert.match(routes, new RegExp(`path: '${p.replace('/', '\\/')}'`), p);
  }
  assert.ok(!/payments\/(success|cancel)/.test(routes), 'return pages are not app routes');
  assert.deepEqual(Object.keys(PAYMENT_RETURN_COPY).sort(), ['cancel', 'success']);
});
