# Identity providers

`backend/src/services/identityProviders.ts` defines a single
`IdentityProvider` interface with three implementations:

## `SyntheticIdentityProvider` (active in this build)

Returns a fixed, clearly-fake record:

```
Name:     Demo User
PAN:      TESTPAN1234
Aadhaar:  000000000000  (12-digit placeholder)
DOB:      19 Oct 2007
Address:  Demo Address, Pune, Maharashtra — DEMO CREDENTIAL, NOT A REAL GOVERNMENT ID
```

Every credential issued via this provider is tagged
`demoNotice: "DEMO CREDENTIAL — NOT A REAL GOVERNMENT ID"` in the API
response, and the frontend renders it as a visible watermark
(`.demo-watermark` in `frontend/src/styles/global.css`).

## `AadhaarProvider` / `PANProvider` (stubs)

Both implement the same interface and both **throw immediately** if
called — they are not connected to any real government or licensed KYC
API. This is deliberate: a stub that silently returned synthetic data
under a "real" provider's name would be indistinguishable from a genuine
integration to anyone reading logs or API responses later. Making them
fail loudly means nobody can accidentally treat demo data as a real
verification.

## Wiring a real provider in production

A production deployment would implement `IdentityProvider` against a
**licensed** integration — e.g. a UIDAI-authorized AUA/KUA for Aadhaar
e-KYC, or an NSDL/Protean-authorized PAN verification API — and select it
via `getConfiguredProvider()` based on environment/organization
configuration, subject to whatever regulatory agreements and consent
flows that integration requires (which are substantially more involved
than this app's own consent screen — see `docs/threat-model.md` for a note
on this).

PrivPass's contract with any provider implementation is narrow on purpose:
`fetchAttributes()` returns raw values that are immediately turned into
commitments and never persisted in raw form (see `docs/privacy.md`) —
so swapping in a real provider doesn't change anything about how the rest
of the system stores or transmits data.
