<html>
<head>
    <!-- custom meta -->
    <meta name="keywords" content="max mitchell, max, mitchell, maximilian, mitchell, york, brighton, sussex, maximilian mitchell">
    <meta name="description" content="Studying Computer Science with Artificial Intelligence at Sussex University, Brighton. Passionate about developing technology, traveling and my bike.">
    <title><?php echo $title?></title>

    <!-- mobile meta -->
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"/>

    <!-- favicon -->
    <link rel="shortcut icon" href="images/favicon.ico">
    <link rel="stylesheet" href="/css/materialize.min.css">
    <link rel="stylesheet" href="/css/style.min.css">

</head>

<body>
<div class="full-image">
    <div id='newim' class='full-image'></div>
</div>
<div class="row" style="margin-bottom: 0">
    <div class="col s12 m5 l4 content">
        <div align="center">
            <h1>Maximilian<br>Mitchell</h1>
        </div>
        <p class="info">Studying Computer Science with Artificial Intelligence at Sussex University, Brighton. Passionate about developing technology, traveling and my bike.</p>
        <div align="center" class="row">
            <!-- using https://maxwellito.github.io/vivus-instant/ -->
            <a class="col s3" href="mailto:max@max.me.uk"><img class="ico" src="/images/mail_animated.svg"></a>
            <a class="col s3" target="_blank" href="https://github.com/maxisme"><img class="ico" src="/images/github_animated.svg"></a>
            <a class="col s3" target="_blank" href="https://stackoverflow.com/story/maxisme"><img class="ico" src="/images/stackoverflow_animated.svg"></a>
            <a class="col s3" target="_blank" href="https://www.linkedin.com/in/maxisme"><img class="ico" src="/images/linkedin_animated.svg"></a>
        </div>

        <?php
//        $dir = "blog/";
//        $pages = glob("${dir}*{.php,.html}",GLOB_BRACE);
//        if(count($pages) > 0) echo "<h2>Posts</h2>";
//        foreach ($pages as $page){
//            $p = str_replace($dir,"",$page);
//            $p = str_replace(".php","",$p);
//            $p = str_replace("-"," ",$p);
//            $p = ucwords($p);
//            echo "<div><a href='/$page'>$p</a></div>";
//        }
        ?>
        <ul class="collapsible">
            <li>
                <div class="collapsible-header">
                    <h2>Selected Projects</h2>
                </div>
                <div class="collapsible-body">
                    <!--- projects -->
                    <?php
                    $p = array(
                        "Transfer Me It" => "https://transferme.it",
                        "notifi" => "https://notifi.it",
                        "iPee" => "https://ipee.it",
                        "Pass For It" => "https://passfor.it",
                    );

                    foreach ($p as $n => $url){  ?>
                        <div class="row valign-wrapper">
                            <div class="col s2 valign">
                                <a target="_blank" href="<?php echo $url?>"><img class="ico" src="<?php echo $url?>/images/icon.ico"></a>
                            </div>
                            <div class="col s10 valign">
                                <a class="valign" target="_blank" href="<?php echo $url?>"><?php echo $n?></a>
                            </div>
                        </div>
                    <?php }  ?>
                </div>
            </li>
            <li>
                <div class="collapsible-header">
                    <h2>My areas of expertise</h2>
                </div>
                <div class="collapsible-body">
                    <p>
                        App Development, Web Development, Networks, Computer Vision and Machine Learning.
                    </p>
                    <h2>My extra areas of interest</h2>
                    <p>
                        Security, Hardware, AI, UI and UX.
                    </p>
                </div>

            </li>
            <li>
                <div class="collapsible-header">
                    <h2>Tools I'm really good with</h2>
                </div>
                <div class="collapsible-body">
                    <div class="good">
                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-php-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                PHP
                            </div>
                        </div>

                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-c-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                Objective-C
                            </div>
                        </div>

                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-python-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                Python
                            </div>
                        </div>

                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-java-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                Java
                            </div>
                        </div>

                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-linux-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                Bash/Shell - /.*n[u,i]x/g
                            </div>
                        </div>

                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-mysql-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                SQL
                            </div>
                        </div>

                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-html5-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                Javascript
                            </div>
                        </div>

                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-jquery-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                jQuery
                            </div>
                        </div>

                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-nginx-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                NGINX
                            </div>
                        </div>

                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-html5-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                HTML
                            </div>
                        </div>

                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-css3-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                CSS
                            </div>
                        </div>

                        <hr>

                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-git-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                Git
                            </div>
                        </div>
                    </div>
                </div>
            </li>

            <li>
                <div class="collapsible-header">
                    <h2>Tools I know</h2>
                </div>
                <div class="collapsible-body">
                    <div class="average">

                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-c-line-wordmark"></i>
                            </div>
                            <div class="col s10 valign">
                                C
                            </div>
                        </div>

                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-cplusplus-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                C++
                            </div>
                        </div
                    </div>
                </div>
            </li>

            <li>
                <div class="collapsible-header">
                    <h2>Tools I'm really not good with</h2>
                </div>
                <div class="collapsible-body">
                    <div class="row">
                        <div class="row valign-wrapper">
                            <div class="col s2">
                                <i class="ico devicon-windows8-plain"></i>
                            </div>
                            <div class="col s10 valign">
                                Windows 😉
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        </ul>

        <hr>
        <p class="subinfo">
            I have experience with 100s of frameworks and tools from <a target="_blank" href="https://materializecss.com/">Materialize CSS</a> to <a href="https://sass-lang.com/" target="_blank">Sass</a> and <a target="_blank" href="https://www.tensorflow.org/">Tensorflow</a> to <a target="_blank" href="http://socketo.me/">Ratchet</a>.
        </p>
        <p class="subinfo">My Development Dock: PhpStorm, PyCharm, Sequel Pro, Xcode, Terminal, SourceTree, Photoshop and Sketch.</p>
        <p class="subinfo" style="font-size: 0.5em">Image taken on the way to Machu Picchu</p>
    </div> <!-- .content -->

    <!--- blog post -->
    <div id="post" class="col s12 m7 l8">