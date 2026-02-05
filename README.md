# VaultSync AppSec Demo (BOLA + Integration Abuse)

VaultSync is a deliberately vulnerable SaaS-style demo app for controlled security education. Theme: cartoon businesses + secret recipes. The primary teaching point is Broken Object Level Authorization (BOLA) combined with an integration trust boundary failure amplified by GitHub sync.

## Quick Start (Docker)

1. Build and run:

```bash
docker-compose up --build
```

2. Open the app:

`http://localhost:3000`

3. Teardown:

```bash
docker-compose down -v
```

Note: The SQLite DB is reset and re-seeded on every container start.

## Demo Credentials

- `plankton` / `plankton123` -> `ACC-100`
- `mrkrabs` / `mrkrabs123` -> `ACC-101`
- `ronald` / `ronald123` -> `ACC-102`
- `colonel` / `colonel123` -> `ACC-103`
- `gino` / `gino123` -> `ACC-104`

## Demo Script (BOLA + Integration Abuse)

1. Login as Plankton (`plankton` / `plankton123`).
1. Go to Documents and view Plankton's docs.
1. Go to Integrations, create a GitHub connector (owner/repo + PAT).
1. Click Sync. Verify the files land in GitHub under:
   `/<basePath>/<connectorId>/run_001/`
1. Intercept the sync request in Burp.
1. Change only the `customerId` in the URL path to `ACC-101`.
1. Resend.
1. Observe Krusty Krab documents appear in Plankton's GitHub destination.

## Vulnerability Explanation

The backend **trusts `customerId` from the URL path** and does not enforce any binding between:

- authenticated user
- JWT claims
- `:customerId` in the request path
- resources accessed

This is classic Broken Object Level Authorization (BOLA). The GitHub sync endpoint makes it worse by pulling documents by `customerId` from the URL and pushing them to a connector owned by a different user.

### Correct Fix (Not Enabled)

On every tenant-scoped endpoint, enforce the JWT's tenant:

```js
if (req.user.customerId !== req.params.customerId) {
  return res.status(403).json({ status: "failed", message: "Forbidden" });
}
```

And for integrations:

```js
if (connector.owner_user_id !== req.user.sub) {
  return res.status(403).json({ status: "failed", message: "Forbidden" });
}
```

## Notes

- JWTs are validated for signature + claims, but **claims are not used for authorization** (intentional).
- Passwords and PATs are stored in plaintext (intentional, insecure).
- GitHub sync uses the REST API "Create or update file contents" endpoint.
