---
sidebar_position: 2
---
# Running as a service

Every operating system has different ways of running services. immudb provides a facility called `immudb service` to hide this complexity.

To install the service run as root:

```bash
$ ./immudb service install
```

This will for example, on Linux, install `/etc/systemd/system/immudb.service` and create the appropriate user to run the service. On other operating systems, the native method would be used.

The `immudb service` command also allows to control the lifecycle of the service:

```bash
$ ./immudb service start
$ ./immudb service stop
$ ./immudb service status
```

On Linux, `immudb service status` is equivalent to `systemctl status immudb.service`, and is what it does under the hoods.

### macOS specific

In case you want to run immudb as a service, please check the following [guideline](https://medium.com/swlh/how-to-use-launchd-to-run-services-in-macos-b972ed1e352).
