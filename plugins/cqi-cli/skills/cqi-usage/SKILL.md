---
name: cqi-usage
description: Run a CQI queue container with the cqi CLI — listen on a queue such as AWS SQS (or a REPL for testing) and dispatch each message to a handler program via stdin, CGI-style. Use when the user wants to consume a queue with a script, wire an SQS queue to a worker program, or try a message-driven pipeline locally.
license: MIT
compatibility: Requires the `cqi` command on PATH (npm package cqi-cli) — run the cqi-install skill if it is missing. The sqs listener needs AWS credentials in the environment. cqi runs in the foreground until stopped, and consuming a queue removes messages from it.
allowed-tools: Bash(cqi:*) Bash(command:*) Read Write
---

# cqi-usage

`cqi` runs a queue container: a **listener** takes messages from somewhere, and a
**dispatcher** does something with each one. The common shape is "SQS in,
program on stdin out".

## 1. Confirm the tool

```bash
command -v cqi && cqi --version
```

Missing? Run the `cqi-install` skill.

## 2. Read the reference

```bash
cqi llm
cqi llm --format json
```

Embedded in the package, so it matches the installed version. It lists the
component names that actually exist — **do not guess them.**

## 3. Understand what you are about to start

Two properties make this different from an ordinary command:

- **It is a daemon.** `cqi` runs in the foreground until stopped. In an
  automated session, start it in the background or hand the user the command to
  run in their own terminal, and tell them how to stop it. Do not wait for it to
  exit.
- **Consuming is destructive.** A message the `sqs` listener handles is removed
  from the queue. Never point `cqi` at a production queue to inspect its
  contents — use the AWS CLI for that.

## 4. Compose the components

Each component is one quoted string: `<name> <jsonic-options>`, where the
options are relaxed JSON.

```bash
# try it locally first: type lines, watch them echo
cqi

# real shape: SQS in, program on stdin
cqi -l "sqs queueUrl: https://sqs.ap-northeast-1.amazonaws.com/123456789012/my-queue" \
    -d "exec programPath: /path/to/worker"
```

Built-in names: listeners `repl`, `sqs`, `array`; dispatchers `echo`, `exec`,
`stdio`. `--plugins` loads npm modules that register more, and those modules
must already be installed where `cqi` runs.

**`exec` runs a program once per message.** Confirm the `programPath` with the
user before pointing a container at a real queue — every message becomes a
process execution on their machine.

`-c` runs several listener/dispatcher pairs in parallel and multiplies that
load. Leave it at 1 unless asked.

## 5. Verify and report

There is no JSON output; logs are prose, and `-v` makes them verbose. Judge
success by what the handler program did — files written, records inserted — not
by parsing cqi's output.

Tell the user the exact command you started, whether it is still running, and
how to stop it.

## Failure modes

| Symptom | Cause | Fix |
| --- | --- | --- |
| `command not found: cqi` | not installed | run the `cqi-install` skill |
| the session hangs | `cqi` is a foreground daemon | run it in the background, or hand the command to the user |
| unknown component name | guessed a name, or a plugin is not installed | check `cqi llm`; install the plugin module and pass `--plugins` |
| SQS errors about credentials | AWS credentials missing | export them for the process that runs `cqi` |
| messages disappeared from the queue | consuming is destructive | expected — never point cqi at a queue you only wanted to inspect |
