# Changelog

All notable changes to the PrivPass project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-09-15

### Added
- **Zero-Knowledge Circuits**: Added `BatchVerification.compact` for multi-credential zk-SNARK proof aggregation.
- **Backend Architecture**:
  - Implemented RFC 7807 problem details error handling middleware.
  - Added request correlation ID tracing with `x-request-id`.
  - Added health, readiness, and memory metrics monitoring endpoints.
  - Added schema validation middleware with field sanitization rules.
  - Added mock ZK circuit engine for offline development and testing.
  - Added webhook retry worker with exponential backoff and HMAC-SHA256 signatures.
  - Added audit log CSV/NDJSON export utilities with cryptographic integrity manifest.
- **Frontend / UX**:
  - Added `ThemeContext` with dark/light mode detection and persistence.
  - Added animated `ToastContainer` notification system.
  - Added `NetworkStatusBanner` for real-time offline detection.
  - Added `CopyButton` with clipboard feedback animations.
  - Added `AttributeSelector` with fine-grained ZK predicate controls.
  - Added `QrCodeModal` for out-of-band mobile verification scanning.
  - Added `AuditFilters` for verification history search and compliance export.
- **Infrastructure & Quality**:
  - Added GitHub Actions code quality and multi-node test matrix workflow.
  - Added multi-stage production Dockerfiles and docker-compose healthchecks.
  - Added environment variable validation and assertion utility.
  - Added full test suites for backend, frontend, and smart contract circuits.
- **Documentation**:
  - Added `SECURITY.md` and vulnerability disclosure policy.
  - Added `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`.
  - Added Architectural Decision Records (ADRs 0001, 0002, 0003).
  - Added Zero-Knowledge Circuit Specification and Verifier SDK Integration Guide.

## [1.1.0] - 2026-08-25
### Added
- Preprod user registry and verification export.
- Neon cloud database integration and migration workflows.
- Selective disclosure manifest UI component.

## [1.0.0] - 2026-08-20
### Initial Release
- Initial Midnight Compact smart contract suite: `CredentialRegistry`, `IdentityVerification`, `RevocationRegistry`, and `VerificationRequest`.
- Full-stack React and Express implementation with Prisma and encrypted storage.
