# cqi — reference for AI agents

`cqi` runs a **queue container**: it listens for messages from a source, and
dispatches each message to a handler. The name stands for Common Queue
Interface, and the design is deliberately CGI-like — the handler is usually just
a program that reads the message on stdin.

This reference is embedded in the binary — `cqi llm` always describes the exact
version you are running.

```bash
# REPL listener + echo dispatcher (the default: type a line, see it echoed)
cqi

# Listen on an SQS queue, pipe each message into a program's stdin
cqi -l "sqs queueUrl: https://sqs.ap-northeast-1.amazonaws.com/123456789012/my-queue" \
    -d "exec programPath: /path/to/program"
```

`cqi` **runs in the foreground until stopped**. It is a long-running process, not
a one-shot command: do not wait for it to exit, and do not run it without telling
the user how to stop it.

## Component definition syntax

Every component is configured with a single string:

```
<name> <jsonic-options>
```

- `<name>` selects a registered component.
- `<jsonic-options>` is [jsonic](https://github.com/rjrodger/jsonic) — relaxed
  JSON where quotes and braces are mostly optional:
  `queueUrl: https://…, timeout: 30`.
- Omitting the options part is fine: `-l repl`, `-d echo`.

Because the whole thing is one shell argument, **quote it**:
`-d "exec programPath: /usr/local/bin/worker"`.

## Built-in components

Names come from `cqi-core`. Plugins can register more (`--plugins`).

| Role | Name | Purpose |
| --- | --- | --- |
| listener (`-l`) | `repl` | read lines from the terminal (default; for trying things out) |
| listener | `sqs` | consume an AWS SQS queue; options are passed to the AWS SDK and to sqs-consumer, so `queueUrl`, `region` and credentials-related keys apply |
| listener | `array` | replay a fixed list of messages — useful for tests |
| dispatcher (`-d`) | `echo` | print the message (default) |
| dispatcher | `exec` | run a program per message: `programPath`, optional `programArgs`, optional `timeout` |
| dispatcher | `stdio` | write the message to a long-lived child process's stdin |
| container (`--container`) | `default` | the only built-in |
| logger (`--logger`) | `default` | the only built-in |

If a name is not in this table and no plugin provides it, `cqi` cannot use it —
do not guess component names.

## Options

| Option | Meaning |
| --- | --- |
| `-l`, `--listener` | listener definition (default `repl`) |
| `-d`, `--dispatcher` | dispatcher definition (default `echo`) |
| `-c`, `--containers` | how many listener/dispatcher pairs to run in parallel (default 1) |
| `--container` | container definition |
| `--logger` | logger definition |
| `--plugins` | comma-separated npm module names that register extra components |
| `-v`, `--verbose` | debug-level logs |
| `-q`, `--quiet` | quieter logs |
| `--jsonic` | parse incoming **messages** as jsonic as well |
| `--version` | print the version |

`--plugins` modules must already be installed and resolvable from where `cqi`
runs; `cqi` `require`s them by name.

## Rules for agents

1. **This is a daemon.** Start it in the background or in a terminal the user
   controls, and say how to stop it. A foreground `cqi` in an automated session
   will hang until it is killed.
2. **`exec` runs arbitrary programs on the machine, once per message.** Confirm
   the `programPath` with the user before starting a container pointed at a real
   queue.
3. **`sqs` consumes messages destructively.** A message handled by `cqi` is
   removed from the queue. Never point it at a production queue to "see what is
   in there" — use the AWS CLI to peek instead.
4. `-c` multiplies the parallelism, and therefore the load on whatever `exec`
   starts. Leave it at 1 unless the user asks otherwise.
5. There is no JSON output mode; logs are prose. Judge success from the handler
   program's own behaviour, not from parsing `cqi`'s output.
