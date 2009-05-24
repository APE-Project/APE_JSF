<?php
$ape_server = 'http://0.acheron.local';
file_get_contents($ape_server.'/?control&testpwd&testchannel&POSTMSG&mailnotif&testmsg&anticache');
echo 'Message sent!';
?>
