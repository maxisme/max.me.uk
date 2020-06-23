+++
banner = ""
content = "To profile a test simply run:\n\n    $ go test -memprofile mem.prof -cpuprofile cpu.prof\n\nTo get the output of the memory profile into a png:\n\n    $ go tool pprof -png mem.prof\n\nTo get the output of the CPU profile into a png:\n\n    $ go tool pprof -png cpu.prof\n\n_Example of the memory profile:_\n\n![](/uploads/profile001.png)\n\n_Example of the CPU profile:  \n![](/uploads/profile002.png)_"
date = 2020-06-23T00:00:00Z
draft = true
meta_description = "How to profile tests in Golang"
tags = ["Go", "tests", "profiling"]
title = "Profiling tests in Golang"

+++
