# Tris Local Surface Hosting Note - 2026-07-02

The Trismegistus command page is currently a local operator surface, not a public hosted backend.

- Local URL: `http://127.0.0.1:8898/`
- Local app path: `/Users/renaissancefieldlite1.0/Documents/Playground/trismegistus`
- Runtime command: `python -m trismegistus.app`
- Boundary: a public website link to `127.0.0.1` opens the visitor's own machine, not the operator machine.

Public hosting gate:

1. Deploy the Tris backend to a public host or protected tunnel.
2. Add auth/redaction before exposing source tools, memory receipts, Stripe state, or mail/Telegram lanes.
3. Replace this runbook link with the hosted Tris URL after a verified public smoke test.

Current public-safe statement: Tris is live as a local operator surface and ready for a hosted deployment gate.
