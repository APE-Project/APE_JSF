<?php
$ape_server = 'http://0.ape.efyx.fy.to';
file_get_contents($ape_server.'/?control&testpwd&testchannel&POSTMSG&mailnotif&testmsg&anticache');
echo 'Message sent!';
?>
