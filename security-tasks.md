# Security Tasks

## Critical

- [ ] **Authenticate ElevenLabs webhook requests**
  - `app/api/elevenlabs/webhook/route.ts` accepts any JSON body with zero verification
  - An attacker can forge payloads to mark calls as completed, inject fake transcripts/outcomes, or prematurely complete campaigns
  - Verify a signature/HMAC header from ElevenLabs, or at minimum validate that the `conversation_id`/`twilio_call_sid` corresponds to a real in-progress call before mutating

- [ ] **Validate Twilio webhook signatures on TwiML and status callbacks**
  - `app/api/calls/twiml/route.ts` and `app/api/calls/status/route.ts` are public and don't verify the `X-Twilio-Signature` header
  - Use `twilio.validateRequest()` to verify signature against the auth token and full request URL
  - Without this, anyone can send fake status updates or trigger TwiML responses by guessing `callId` values

## High

- [ ] **Replace in-memory rate limiter with Redis-backed solution**
  - `lib/rate-limit.ts` uses an in-memory `Map` that resets on every cold start and isn't shared across instances
  - Replace with `@upstash/ratelimit` since Upstash Redis is already configured in the project

- [ ] **Fix IP spoofing in rate limit `clientIp` helper**
  - `lib/rate-limit.ts` `clientIp()` trusts raw `X-Forwarded-For` which is trivially spoofable by clients
  - Use the platform-provided real IP header (e.g. Vercel sets `x-real-ip` at the edge) and don't blindly trust `x-forwarded-for`

- [ ] **Add security headers (CSP, HSTS, X-Frame-Options, etc.)**
  - `next.config.mjs` is empty — no security headers are set
  - Add `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy` via `headers()` in Next config

## Medium

- [ ] **Use a separate encryption key for at-rest field encryption**
  - `lib/field-crypto.ts` derives the AES-256-GCM key from the JWT session secret
  - If `SESSION_SECRET` leaks, attacker can forge sessions AND decrypt all stored Twilio auth tokens
  - Add a dedicated `ENCRYPTION_KEY` env var independent of session signing material

- [ ] **Switch Call model IDs to non-predictable format**
  - All models use `@default(cuid())` — CUIDs contain timestamp and machine fingerprint, making them partially enumerable
  - `/api/calls/twiml?callId=<id>` is unauthenticated, so predictable IDs are exploitable
  - Switch to `cuid2()` or `uuid()` for the `Call` model at minimum

- [ ] **Validate campaign status transitions**
  - `PATCH /api/campaigns/[id]` accepts any string for `status` with no state machine enforcement
  - An attacker can set status to `"active"`, `"completed"`, or `"draft"` arbitrarily, bypassing launch prerequisites
  - Add an allowlist of valid transitions based on current state

- [ ] **Clean up external resources on account deletion**
  - `DELETE /api/auth/delete-account` cascades through DB but leaves orphaned Twilio calls, ElevenLabs agents, and Redis dial queues
  - Cancel active campaigns, delete ElevenLabs agents, and flush Redis queues before deleting the user

- [ ] **Stop leaking `userId` in login/signup responses**
  - `app/api/auth/login/route.ts` and `signup/route.ts` return `userId` in JSON body
  - The session cookie is sufficient — remove `userId` from response to reduce enumeration surface

## Low

- [ ] **Add CSRF protection for destructive actions**
  - Cookie uses `sameSite: "lax"` which helps but doesn't fully protect against subdomain or GET-based CSRF
  - Consider a CSRF token for destructive operations (delete campaign, delete account, etc.)

- [ ] **Add `issuer` and `audience` claims to JWT**
  - `lib/auth/session.ts` issues JWTs with no `iss` or `aud` claims
  - If multiple services share the same secret, tokens are interchangeable
  - Add `.setIssuer("convaire")` and `.setAudience("convaire-app")` and validate on verify

- [ ] **Implement session invalidation / revocation**
  - No way to revoke a session before its 7-day expiry; password changes don't invalidate existing sessions
  - Store a `tokenVersion` on the User model, increment on password change, and check during verification
  - Alternatively, maintain a token denylist in Redis

- [ ] **Sanitize `console.error` output in production**
  - Multiple routes log full error objects which could leak stack traces, request bodies, or API keys
  - Use structured logging with sensitive field redaction

## Informational

- [ ] **Add breached password checking**
  - Passwords are validated for length (8–128 chars) but not checked against known breach databases
  - Consider integrating HaveIBeenPwned k-anonymity API on signup and password change

- [ ] **Add account lockout or exponential backoff**
  - After rate limit window resets (15 min for login), brute-forcing resumes
  - Consider exponential backoff or account-level lockout after N consecutive failures

- [ ] **Add audit logging for security-sensitive events**
  - No record of logins, password changes, Twilio credential changes, or campaign launches
  - Create an audit log table or emit structured events for incident response

- [ ] **Enforce server-side upper bound on `maxDuration`**
  - Campaign `maxDuration` accepts any number, potentially running up Twilio/ElevenLabs costs
  - Add a reasonable server-side cap (e.g. 30 minutes)
