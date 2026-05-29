# NexusCore Digital Monetization Platform

NexusCore is a scalable, multi-tenant digital monetization and product distribution platform. Designed with enterprise-grade architecture, it supports multiple business roles (Platform Admin, Whitelabel Agency, Reseller, Public Buyer), realtime ledger reconciliations, advanced routing, and secure API-driven provisioning.

## 🚀 Features

- **Multi-Tenant Architecture**: Supports Platform Admins, Agencies, Resellers, and Public Consumers.
- **Dynamic Ledger System**: Double-entry bookkeeping system to handle wallet balances securely with realtime fraud detection and reconciliation.
- **Provider & Supplier Routing**: Smart order routing to external APIs for digital goods provision, with failover logic.
- **White-Label Branding**: Resellers and Agencies can configure custom branding matrices, logos, and color schemas for their public storefronts.
- **Real-Time Data**: Uses WebSockets/SSE for live dashboard activity feeds and instant transaction status updates.
- **Indonesian Localization (i18next)**: Full support for English and Indonesian languages across internal dashboards and public stores.

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion (for animations), React Router.
- **Backend**: Express.js (integrated via custom Vite middleware), Node.js.
- **State Management**: Zustand.
- **Routing & Networking**: Axios, `react-i18next` for localization.
- **UI Components**: Radix UI primitives, Lucide React (Icons).
- **Deployment**: Dockerized, Google Cloud Run ready, standard Kubernetes manifests available.

## 📦 Project Structure

```text
├── src/
│   ├── components/      # Shared reusable UI components (Buttons, Modals, etc.)
│   ├── contexts/        # React Context providers (Auth, Theme, Tenant setup)
│   ├── hooks/           # Custom React Hooks (useAuth, useOrders, useLedger)
│   ├── locales/         # i18n translation files (en.json, id.json)
│   ├── modules/         # Domain-driven feature modules (billing, products, orders, auth)
│   ├── pages/           # Route-level Page Components
│   ├── services/        # API clients and external integration points
│   ├── store/           # Zustand global state stores
│   ├── types/           # TypeScript Interfaces & Types
│   └── utils/           # Helper functions (cn for Tailwind, formatting, etc.)
├── server.ts            # Express server entry point (API routes + Vite Middleware)
├── Dockerfile           # Production container configuration
├── package.json         # Dependency configuration
└── PRD.md               # Product Requirements Document
```

## 🔐 Security & Architecture Integrity

- **Environment Variables**: Managed strictly via `.env` files. Secrets are *never* exposed to the client bundle. Use `.env.example` as a template.
- **RBAC**: Strict Role-Based Access Control enforcing boundaries between `PLATFORM_ADMIN`, `AGENCY`, and `RESELLER`.
- **Stateless Validation**: Backend uses secure session validations.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Please fill the .env file with appropriate keys.
   ```
3. Start the Development Server (Frontend + Express API):
   ```bash
   npm run dev
   ```
4. Build for Production:
   ```bash
   npm run build
   ```
5. Start Production Server:
   ```bash
   npm start
   ```

## 🤖 Continuing with AI Assistants (Claude, Gemini, etc.)

If you are continuing the development of this repository using an AI assistant like Claude:

1. **Provide Context**: Reference this `README.md` and `PRD.md` as the core contextual anchor.
2. **Modular Edits**: When asking for features, specify the module (e.g., `src/modules/billing`). 
3. **TypeScript**: Ask the AI to strictly adhere to the types defined in `src/types/index.ts`.
4. **Translations**: Remember to update both `src/locales/en.json` and `src/locales/id.json` when adding new UI copy.

## 🤝 Contribution & Integration

Before pushing to GitHub, ensure all TypeScript validations pass:
```bash
npm run lint
npm run build
```
The repository is fully ready for modern CI/CD pipelines (e.g., GitHub Actions, Vercel, Railway, or Google Cloud Build).

---

*This repository is primed for multi-tenant, high-throughput digital transactions. Ensure all database migrations and payment gateways are thoroughly tested in staging environments prior to production rollout.*
