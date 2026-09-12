# Focused reviewer evaluation cases

Synthetic code only. Each case has one independent review packet. Expected labels and grounding
anchors below are scorer inputs and must not be included in model prompts. GOOD means no confirmed
finding; BAD means the planted issue; UNKNOWN means insufficient context, without a confirmed bug.

## acceptance-missing-assertion
Agent: ap-acceptance
Expected: BAD
Anchor: checkout.test.js
### Packet
Criterion R1: WHEN quantity is zero THEN checkout throws "invalid quantity".
Named test: checkout.test.js :: "rejects zero".
Manifest: checkout.js, checkout.test.js. Exclusions: all other files. Prior decisions: none.
Diff: adds these two files. Review the criterion and actual assertions.
checkout.js:
```js
export function checkout(quantity) {
  if (quantity <= 0) throw new Error('invalid quantity');
  return quantity * 10;
}
```
checkout.test.js:
```js
import { checkout } from './checkout.js';
test('rejects zero', () => { expect(checkout(1)).toBe(10); });
```

## acceptance-covered
Agent: ap-acceptance
Expected: GOOD
Anchor: checkout.test.js
### Packet
Criterion R1: WHEN quantity is zero THEN checkout throws "invalid quantity".
Named test: checkout.test.js :: "rejects zero".
Manifest: checkout.js, checkout.test.js. Exclusions: all other files. Prior decisions: none.
Diff: adds these files. Only R1 is in scope; positive quantities are not a requested criterion.
checkout.js:
```js
export function checkout(quantity) {
  if (quantity === 0) throw new Error('invalid quantity');
  return quantity * 10;
}
```
checkout.test.js:
```js
import { checkout } from './checkout.js';
test('rejects zero', () => { expect(() => checkout(0)).toThrow('invalid quantity'); });
```

## acceptance-missing-test-context
Agent: ap-acceptance
Expected: UNKNOWN
Anchor: checkout.test.js
### Packet
Criterion R1: WHEN quantity is zero THEN checkout throws "invalid quantity".
Named test: checkout.test.js :: "rejects zero". The test file's contents are unavailable.
Manifest: checkout.js only. Exclusions: everything else. Prior decisions: none.
Diff adds checkout.js:
```js
export function checkout(quantity) {
  if (quantity === 0) throw new Error('invalid quantity');
  return quantity * 10;
}
```
You cannot infer missing assertions from an unavailable file.

## regression-return-shape
Agent: ap-regression
Expected: BAD
Anchor: caller.js
### Packet
Manifest: api.js, caller.js. Exclusions: all other files. Prior decisions: no breaking change approved.
Changed contract: getUser used to return { name: 'Ada' }. Diff replaces its return shape:
api.js:
```js
export function getUser() { return { profile: { name: 'Ada' } }; }
```
Unchanged consumer caller.js:
```js
import { getUser } from './api.js';
export const heading = getUser().name.toUpperCase();
```

## regression-compatible
Agent: ap-regression
Expected: GOOD
Anchor: caller.js
### Packet
Manifest: api.js, caller.js. Exclusions: all other files. Prior decisions: additive fields are allowed.
Changed contract: getUser used to return { name: 'Ada' }; diff adds profile while preserving name.
These are all consumers; no external consumers. No tests supplied; runtime verification is not claimed.
api.js:
```js
export function getUser() { return { name: 'Ada', profile: { name: 'Ada' } }; }
```
caller.js:
```js
import { getUser } from './api.js';
export const heading = getUser().name.toUpperCase();
```

## regression-unknown-consumer
Agent: ap-regression
Expected: UNKNOWN
Anchor: api.js
### Packet
Manifest: api.js only. Exclusions: everything else. Prior decisions: none.
Changed contract: getUser used to return { name: 'Ada' }; now returns a nested profile.
Consumers are external plugins and their sources are unavailable. No affected caller is demonstrated.
api.js:
```js
export function getUser() { return { profile: { name: 'Ada' } }; }
```

## security-tenant-bypass
Agent: ap-security
Expected: BAD
Anchor: handler.js
### Packet
Manifest: handler.js. Exclusions: all other files. Prior decisions: none.
Rule: authenticated users may read invoices only in their session tenant. invoice IDs are guessable.
Entry point: GET /invoice/:id. Middleware supplies trusted session.user and session.tenantId;
it performs authentication only, no invoice authorization. This is the whole new handler.
DB findUnique performs exactly the provided id lookup; there are no row-level policies.
handler.js:
```js
export async function invoice(req, res, db) {
  const record = await db.invoice.findUnique({ where: { id: req.params.id } });
  return res.json(record);
}
```

## security-tenant-enforced
Agent: ap-security
Expected: GOOD
Anchor: handler.js
### Packet
Manifest: handler.js. Exclusions: all other files. Prior decisions: users can see every invoice in
their own tenant. Rule: invoices must be scoped to trusted session.tenantId. Middleware ensures
an authenticated session with a trusted, nonempty tenantId. The ORM parameterizes both inputs;
findFirst filters on ALL where fields. Missing invoices return 404. Entire new handler below.
handler.js:
```js
export async function invoice(req, res, db) {
  const record = await db.invoice.findFirst({ where: { id: req.params.id, tenantId: req.session.tenantId } });
  if (!record) return res.sendStatus(404);
  return res.json(record);
}
```

## security-missing-enforcement-context
Agent: ap-security
Expected: UNKNOWN
Anchor: handler.js
### Packet
Manifest: handler.js only. Exclusions: all other files. Prior decisions: none.
Rule: invoice reads must be tenant-scoped. The handler calls an existing invoice service whose
implementation and authorization policy are unavailable. No bypass has been demonstrated.
Diff adds handler.js:
```js
export async function invoice(req, res, service) {
  return res.json(await service.readInvoice(req.session, req.params.id));
}
```

## cleanup-obsolete-local
Agent: ap-cleanup
Expected: BAD
Anchor: total.js
### Packet
Manifest: total.js. Exclusions: everything else. Prior decisions: none.
Diff replaced the prior discount formula with a fixed ten-percent discount but kept oldDiscount.
This is the entire function; oldDiscount is a pure local constant and is never referenced.
total.js:
```js
export function total(price) {
  const oldDiscount = 0.2;
  return price * 0.9;
}
```

## cleanup-intentional-log
Agent: ap-cleanup
Expected: GOOD
Anchor: handler.js
### Packet
Manifest: handler.js. Exclusions: everything else.
Prior decision: audit logging of successful invoice reads is deliberate and must remain.
Diff adds the following handler; service checks permissions and returns the authorized invoice.
No replaced or obsolete code. Logger call is required audit logging, not debug scaffolding.
handler.js:
```js
export async function invoice(req, res, service, audit) {
  const record = await service.readInvoice(req.session, req.params.id);
  audit.info({ event: 'invoice-read', invoiceId: record.id });
  return res.json(record);
}
```

## cleanup-external-export
Agent: ap-cleanup
Expected: UNKNOWN
Anchor: api.js
### Packet
Manifest: api.js only. Exclusions: all other files. Prior decisions: none.
Diff removes the only internal import of legacyTotal, but the module is a public package entrypoint.
Repo text-search found no remaining internal references. External consumers are unknown.
api.js:
```js
export function legacyTotal(price) { return price * 0.8; }
```
Is this safely removable? Missing external-consumer evidence must not become a confirmed deletion.
