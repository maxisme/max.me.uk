+++
banner = ""
content = "## Intro\n\nOften find yourself typing `https://github.com/yourusername/repo`? I did. \n\nIn this tutorial, I will show you how I redirect from my custom domain `https://m4x.uk` to `https://github.com/maxisme/` allowing me to quickly access my GitHub repo at `https://m4x.uk/max.me.uk` instead of `https://github.com/maxisme/max.me.uk`. \n\n## Setup\n\nIn my Traefiks `traefik.toml` I have a [provider for docker](https://docs.traefik.io/providers/docker/) and a [provider for files](https://docs.traefik.io/providers/file/):\n\n    [providers]\n        [providers.docker]\n            watch = true\n            network = \"traefik\"\n            swarmMode = true\n            exposedByDefault = false\n        [providers.file]\n            directory = \"/etc/traefik/rules/\"\n            watch = true\n\nUsing the file provider I created a simple middleware to redirect my custom domain `https://m4x.uk` => `https://github.com/maxisme/`\n\n    [http.routers]\n        [http.routers.github]\n            rule = \"Host(`m4x.uk`)\"\n            middlewares = [\"github-redirect\"]\n            service = \"dummy-svc@docker\"\n            [http.routers.github.tls]\n                certResolver = \"letsencrypt\"\n    \n    [http.middlewares]\n      [http.middlewares.github-redirect.redirectRegex]\n        regex = \"m4x.uk/(.*)\"\n        replacement = \"github.com/maxisme/${1}\"\n        permanent = true"
date = 2020-06-25T00:00:00Z
draft = true
meta_description = "Create a custom GitHub URL with Traefik."
tags = ["GitHub", "Traefik"]
title = "Custom GitHub URL"

+++
