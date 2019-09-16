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
