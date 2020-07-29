+++
banner = ""
content = "# Intro\n\nTracing is a fantastic way to monitor your application that uses different services - so basically every production application 😄.\n\nIn tracing there are two fundamental concepts; traces and spans. You can think of a trace as a specific request so every HTTP call will have a unique trace ID. A trace then has many spans which monitor the bits of work within the request for example a DB call.\n\n\\[PUT IMAGE HERE\\]\n\nWith tracing it makes it very easy to debug any errors as well as monitoring the perfomance of your application.\n\n# Jaeger\n\nJaeger is a tool to visualise your traces, along with Elasticsearch for it's storage.\n\n# OpenTelemetry\n\nOpenTelemetry is still in Beta so things can still change a lot but I wanted to use it in my personal projects as it is simplifies the workload and is the future of tacing: \n\n> A single set of APIs, libraries, agents, and collector services to capture distributed traces and metrics from your application."
date = 2020-07-29T00:00:00Z
draft = true
meta_description = "How to trace a Django application."
tags = ["Django", "OpenTelemetry", "Traefik", "Tracing", "Jaeger"]
title = "Tracing Django applications with OpenTelemetry"

+++
