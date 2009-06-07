<?php

$messages = array(
	'Test Message',
	'<span style="color: #800">I\'m awesome!</span>',
	'<span style="color: #080">Hey, how are you doing?</span>',
);

$APEserver = 'http://0.ape.local';
$APEPassword = 'testpwd';

file_get_contents($APEserver.'/?control&'.$APEPassword.'&testchannel&POSTMSG&action&'.rawurlencode($messages[array_rand($messages)]).'&anticache');

echo 'Message sent!';