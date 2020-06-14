<?php
include "../templates/header.php";
?>
<style>
    /* overide */
    header{
        opacity: 0.7;
    }
</style>
<div align="center">
    <h1>
    DIY IoT Lock
    </h1>
</div>

<div align="center" class="date">
    17<sup>th</sup> March 2017
</div>
    I thought it would be an interesting project to experiment with building a Do It Yourself, Internet Of Things door lock on a budget. The current ways to have an IOT door lock are quite complicated and expensive. This was my extremely insecure  and potentially very frustrating technique to locking and unlocking my door with two Amazon Dash Buttons and my iPhone (<a target="_blank" href="https://www.apple.com/ios/home/">Home</a>) I have had mine running for over a year and yet to be locked out.
<h2>
    The tools?
</h2>
<p>
    As I am a student I did not want to spend a lot of money on this project and managed to do this for about £10 (excluding a pi that I am using for other projects).
    <li>£9 - <a target="_blank" href="https://shop.pimoroni.com/products/raspberry-pi-zero">Raspberry Pi</a> (not including power source and SD card)</li>
    <li>£8 - <a target="_blank" href="https://4tronix.co.uk/store/index.php?rt=product/product&product_id=554">PiStep2 Dual Stepper Motor</a></li>
    <li>£1.25 - <a target="_blank" href="https://www.ebay.co.uk/itm/CHOOSE-SMALL-LARGE-SLIDE-BOLT-Bathroom-Toilet-Shed-Door-Lock-Catch-Latch-/232611808315?var=&hash=item3628be843b">Slide Bolt</a> - I have found cheaper if you get off your ass and walk to a DIY shop.</li>
    <br>
    The DIY stuff. (Pre Warning: My DIY is shabby at best)
    <li>Screw Driver</li>
    <li>Zip Ties</li>
    <li>Metal Wire </li>
</p>

<h2>
    The Technique?
</h2>
<h3>Pi and The Motor</h3>
    <p>
        I am expecting that you have setup the raspberry pi already. If you haven't here is a tutorial <a target="_blank" href="https://www.raspberrypi.org/documentation/setup/">for setting up the pi</a> and here is a tutorial for <a target="_blank" href="https://www.raspberrypi.org/documentation/configuration/wireless/wireless-cli.md">setting up wifi</a>.
    </p>
<p>
    The PiStep2 hat is plug and play. I simply stuck it onto the header of the pi and plugged the power cable into it. If you are using the pi zero you have the arguably difficult job of soldering the GPIO pins onto the board as well.
    <img src="t.jpg"/>
</p>

<h3>Lock</h3>
<p>
    First of all I had to slightly dismantle the Slide Bolt due to it being quite difficult to open and close. - The point of this high friction, I believe, is so that someone shake open the lock, which is not possible in our case because the lock will be held in place by our motor... more on that later.<br>
    To remove this friction I bent open one of the main bolt supports so that I could get access to this tiny metal ball and remove it.
    <img src="t.jpg"/>
    It is now the hard engineering part. You need to create a sort of hinge from the flat edges of the motor to the bolt on the lock, so that when the motor rotates the bolt slides horizontally.
</p>
<h3>Positioning</h3>
<p>
    I made two important checks:<br><br>
    1. That my pi had wifi signal from the door. (potentially how close it is to an ethernet cable)<br>
    2. That the pi was close enough to a power source. In which I purchased an extra long micro-usb cable.<br><br>

    After that I got two nails and hammered in the raspberry pi to the door and two screws to
</p>
<h3>The Code</h3>
<p>
    So firstly - how are we going to control the lock? I decided to setup two <a href="/blog/amazon-bash">Amazon Dash</a> buttons. One for opening and one for closing the lock.
</p>
<p>
    The main code for the lock is a python script which controls the motor and runs it either clockwise or anti-clockwise for a set amount of time.
</p>
<?php
include "../templates/footer.php";
?>