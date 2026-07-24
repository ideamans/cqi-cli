# Publishing the cqi-cli plugin

## Before every release

1. `yarn build` — regenerates `src/llmdocs.generated.ts` and compiles.
2. `yarn validate-plugin-skills` — enforces that `plugin.json.version` equals
   `package.json.version` and that the SKILL.md frontmatter stays within the
   Agent Skills standard.
3. `claude plugin validate plugins/cqi-cli`.
4. Bump `package.json.version` and `plugin.json.version` together.

## Registering in the marketplace (first release only)

Add to `.claude-plugin/marketplace.json` in `ideamans/claude-public-plugins`:

```json
{
  "name": "cqi-cli",
  "source": {
    "source": "git-subdir",
    "url": "https://github.com/ideamans/cqi-cli.git",
    "path": "plugins/cqi-cli"
  }
}
```

## Verifying the published result

```
/plugin marketplace add ideamans/claude-public-plugins
/plugin install cqi-cli@ideamans-plugins
/cqi-usage
```

```bash
gh skill install ideamans/cqi-cli/plugins/cqi-cli/skills/cqi-usage --agent copilot
```
