---
name: cqi-install
description: Make the cqi command available, installing the cqi-cli npm package only if it is missing. Use when another skill reports that `cqi` is not on PATH, or when the user asks to install, update or upgrade the CQI queue container CLI. Prefers an already-installed binary, then a global npm install, then npx without installing anything.
license: MIT
compatibility: Requires Node.js and npm (or yarn). Standalone — does not need cqi to be present already. Installs the public npm package cqi-cli, so no GitHub authentication is needed.
allowed-tools: Bash(npm:*) Bash(npx:*) Bash(yarn:*) Bash(node:*) Bash(command:*) Bash(which:*) Bash(echo:*) Bash(test:*) Read
---

# cqi-install

Make the `cqi` command usable, doing the least work that achieves it.

## Route 1 — an existing installation on PATH

```bash
command -v cqi && cqi --version
```

If that resolves, **use it and stop here.** Do not check npm for a newer
version — the user did not ask for an upgrade.

Two checks before trusting the hit:

- **It is the right tool.** `cqi` is a short, generic name. `cqi llm | head -1`
  must read `# cqi — reference for AI agents`. If something else owns the name,
  tell the user and call this one by an explicit path.
- **It is recent enough.** If `cqi llm` is not a known command, the installed
  version predates the embedded reference (added in 0.3.0). Say so and continue
  to route 2 to upgrade it.

Continue past this section only when the command is missing, is the wrong tool,
is too old, or the user explicitly asked to update.

## Route 2 — install globally from npm

```bash
node --version      # Node.js is required
npm install -g cqi-cli
```

A global install writes outside the project, so **say what you are about to do
before running it**. If the user prefers not to install globally, or npm's
global prefix is not writable, use route 3 instead — do not reach for `sudo`.

Project-local installs work too, and are the better choice inside a repository
that will depend on cqi:

```bash
npm install --save-dev cqi-cli   # then invoke it as npx cqi
```

## Route 3 — run without installing

```bash
npx cqi-cli llm | head -5
npx cqi-cli -l repl -d echo
```

`npx` fetches the package on demand. It is the right answer for a one-off, and
the safe answer when you should not modify the user's machine. The trade-off is
a download on first use and a slower start each time.

## Verify

```bash
cqi --version      # or: npx cqi-cli --version
cqi llm | head -5
```

Report which route was taken, the version, and whether anything was installed
globally.

Then say what is still needed for real use: the `sqs` listener needs AWS
credentials in the environment of whatever process runs `cqi`, and `--plugins`
modules must be installed separately before they can be loaded.
