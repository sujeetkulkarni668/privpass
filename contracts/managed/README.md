# Compiled contract artifacts

This directory is where `yarn compact:compile` writes the real `compactc`
output (ZKIR, verifier keys, TypeScript bindings) for each contract in
`../src`.

**No artifacts are checked in here yet.** The native `compactc` compiler
binary is distributed via Midnight's Compact developer tools and is not
reachable from the sandboxed environment this repository was scaffolded in
(see `docs/submission-checklist.md` for exactly what that environment could
and couldn't reach). Run:

```bash
yarn workspace @privpass/contracts compile
```

on a machine with `compactc` installed, commit the resulting artifacts here,
and the placeholder note in the root README's "Live Demo" section can be
replaced with real values.
