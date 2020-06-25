+++
banner = ""
content = "# Intro\n\nDo you often find yourself typing `git clone https://github.com/yourusername/repo`? I did.\n\nIn this tutorial, I will show you how I redirect from my custom domain `m4x.uk` to `github.com/maxisme/` using Traefik.\n\nFor example, this allows me to easily access my GitHub repo, `max.me.uk`, located at `github.com/maxisme/max.me.uk` by visiting `m4x.uk/max.me.uk`.\n\n# Setup\n\nIn my Traefiks main config I have a provider for [Files](https://docs.traefik.io/providers/file/):\n\n_traefik.toml_\n\n    [providers]\n        [providers.file]\n            directory = \"/etc/traefik/rules/\"\n            watch = true\n\nUsing a new file provider I created a simple middleware to redirect my custom domain `m4x.uk/`**`repo`** to `github.com/maxisme/`**`repo`** using Traefiks [redirect regex](https://docs.traefik.io/middlewares/redirectregex/).\n\n_/etc/traefik/rules/github.toml_\n\n    [http.routers.github]\n        rule = \"Host(`m4x.uk`)\"\n        middlewares = [\"github-redirect\"]\n        service = \"empty-service\"\n        [http.routers.github.tls]\n            certResolver = \"letsencrypt\"\n    \n    [http.services.empty-service.loadBalancer]\n    \n    [http.middlewares.github-redirect.redirectRegex]\n        regex = \"m4x.uk/(.*)\"\n        replacement = \"github.com/maxisme/${1}\"\n        permanent = true"
date = 2020-06-25T00:00:00Z
meta_description = "Create a custom GitHub URL redirect with Traefik."
tags = ["GitHub", "Traefik"]
title = "Custom GitHub URL"

+++
