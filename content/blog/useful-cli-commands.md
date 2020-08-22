+++
banner = ""
content = "I have decided to put some commands that I often need to lookup thanks to my poor memory here:\n\n***\n\n    $ git rm -r --cached file/folder\n\nAfter pushing, removes `file/folder` from remote only.\n\n***\n\n## Generate an ssh key\n\n    $ ssh-keygen -t ed25519 -a 100\n\n***\n\n## Test server connection speeds\n\nServer 1:\n\n    $ iperf3 -s -f K \n\nServer 2:\n\n    $ iperf3 -c server1 -f K\n\n***\n\n## Add ssh keys\n\n    $ curl -o ~/.ssh/authorized_keys https://github.com/maxisme.keys\n\n***\n\n## Secure ssh\n\n    echo \"PasswordAuthentication no\" >> /etc/ssh/sshd_config"
date = 2020-07-14T00:00:00Z
draft = true
meta_description = "A set of command line commands that I need to remember."
tags = ["cli", "git", "ssh"]
title = "Useful CLI commands"

+++
