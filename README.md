CQI CLI command.

CQI stands for Common Queue Interface inspired by CGI.

https://github.com/ideamans/cqi-core

```bash
# REPL listener and echo dispatcher
cqi

# Listen SQS queue and pass the message to STDIN of /path/to/program
cqi -l "sqs queueUrl: https://queue-url" \
  -d "exec programPath: /path/to/program"
```

# Component definition

`name jsonic-options`

## Use from an AI agent

`cqi llm` prints the full reference for AI agents: the component definition
syntax, the built-in listener and dispatcher names, every option, and the two
properties that catch agents out — cqi is a foreground daemon, and consuming a
queue removes its messages.

```bash
cqi llm                  # Markdown
cqi llm --format json    # chapters as a JSON array
cqi --llm                # deprecated alias, still accepted
```

Claude Code users can install the plugin, which adds `/cqi-usage` and
`/cqi-install`:

```
/plugin marketplace add ideamans/claude-public-plugins
/plugin install cqi-cli@ideamans-plugins
```

The same skills work in Copilot, Cursor and other Agent Skills hosts:

```bash
gh skill install ideamans/cqi-cli/plugins/cqi-cli/skills/cqi-usage --agent copilot
```

See [`plugins/cqi-cli/`](plugins/cqi-cli) for the skills, and
[ideamans/go-llm-cli-kit](https://github.com/ideamans/go-llm-cli-kit) for the
standard they follow.
