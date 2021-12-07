+++
banner = ""
content = "    $ git rm -r --cached file/folder\n\nAfter pushing, removes `file/folder` from remote only.\n\n***\n\n## Generate an ssh key\n\n    $ ssh-keygen -t ed25519 -a 100\n\n***\n\n## Test server connection speeds\n\nServer 1:\n\n    $ iperf3 -s -f K \n\nServer 2:\n\n    $ iperf3 -c server1 -f K\n\n***\n\n## Add my SSH keys\n\n    $ curl -o ~/.ssh/authorized_keys https://github.com/maxisme.keys\n\n***\n\n## Secure SSH\n\n    $ echo \"PasswordAuthentication no\" >> /etc/ssh/sshd_config\n\n***\n\n## Test Drive Read Speed\n\n    $ cat /dev/sda | pv -r > /dev/null\n\n## Test Drive Write Speed\n\n    $ dd if=/dev/zero of=test.data bs=1k count=128k && rm test.data"
date = 2020-07-14T00:00:00Z
meta_description = "A set of command line commands that I need to remember."
tags = ["cli", "git", "ssh"]
title = "Useful CLI commands"

+++
