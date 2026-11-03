// P5 b8: application payment intents carry the explicit purpose "applicationFee" (account-service
// treats applicationFee + applicationId as an application payment without the subscriptionFee
// compatibility binding). Member subscription payments (memberId) stay "subscriptionFee".
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (rel) => fs.readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");

test("application intent call sites send purpose applicationFee", () => {
  const wrapper = read("src/components/modals/SubscriptionWrapper.jsx");
  assert.match(wrapper, /purpose: 'applicationFee',\s*\n\s*amount: amountInCents/);
  assert.doesNotMatch(wrapper, /purpose: 'subscriptionFee'/);
  const modal = read("src/components/modals/SubscriptionModal.jsx");
  assert.match(modal, /purpose="applicationFee"\s*\n\s*applicationId=\{applicationId\}/);
  assert.doesNotMatch(modal, /purpose="subscriptionFee"/);
});

test("member subscription payments (memberId, no applicationId) keep purpose subscriptionFee", () => {
  for (const f of ["src/components/modals/DashboardPaymentModal.jsx", "src/pages/payments/CreditCardPayment.jsx"]) {
    const src = read(f);
    assert.match(src, /purpose: 'subscriptionFee'/, f);
    assert.match(src, /memberId/, f);
  }
});
