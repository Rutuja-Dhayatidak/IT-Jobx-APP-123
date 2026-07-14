# ITJobX Security Policy and Secrets Management

This document defines security standards, environment configuration procedures, secret rotation plans, and incident response guidelines for the ITJobX project.

## Critical Mobile Security Rule

> [!IMPORTANT]
> **React Native mobile application bundles are public by design.** Any secrets built, compiled, or packaged inside the application bundle (such as database credentials, payment secret keys, API keys, or private certificates) can be easily extracted via reverse engineering.
> - **Only public configurations** (e.g. `API_BASE_URL`, `PUBLIC_RAZORPAY_KEY_ID`) are permitted in the mobile client.
> - **All private API keys and credentials** must reside strictly on the backend, behind authenticated proxy endpoints.

---

## Environment Setup

### Local Development Setup

1. **Backend**:
   - Copy `backend/.env.example` to `backend/.env`
   - Fill in local development credentials.
   - Run `npm install` and start the server with `npm run dev`. Zod will automatically validate the configuration on startup.

2. **Mobile**:
   - Copy `ITJobx/.env.example` to `ITJobx/.env`
   - Adjust `API_BASE_URL` to point to your backend (e.g., `http://10.0.2.2:5001/api` for Android emulator).

---

## Secret Generation

To generate cryptographically secure, random values (e.g. for `JWT_SECRET` or encryption keys), use one of the following commands:

- **Node.js**:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

- **OpenSSL**:
  ```bash
  openssl rand -hex 64
  ```

*Do not share generated keys over public chat rooms, email, or commits.*

---

## Secret Rotation and Revocation Procedure

If a secret is leaked, compromised, or routinely rotated:

1. **Generate a New Secret**: Use the cryptographically secure generation commands above.
2. **Update Environment Configuration**: Configure the new secret on the hosting platform's environment configuration page (e.g. Render, Railway, AWS Secrets Manager).
3. **Trigger Redeployment**: Redeploy the server to propagate changes.
4. **Revoke compromised keys**: Revoke or invalidate the compromised key on the provider console (e.g., Google OAuth console, Razorpay dashboard, Cloudinary API panel).
5. **Session Invalidation**: When rotating JWT signing secrets, active sessions will be invalidated. To minimize downtime, you can implement a transient array of acceptable active secrets in code to verify tokens while migrating users to new tokens.

---

## Git Clean-up for Leaked Secrets

If a secret is accidentally committed to Git:

1. Consider the secret **compromised** immediately and rotate it.
2. Remove the file containing the secret from history using `git-filter-repo` (or BFG Repo-Cleaner):
   ```bash
   git filter-repo --path backend/.env --invert-paths
   ```
3. Coordinate with your team and push the updated branch using force-push:
   ```bash
   git push origin main --force
   ```
   *Warning: Force-pushing rewrites history and requires other team members to re-clone or reset their local branches.*
