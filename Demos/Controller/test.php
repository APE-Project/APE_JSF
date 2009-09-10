<?php

$messages = array(
	'Test Message',
	'<span style="color: #800">I\'m awesome!</span>',
	'<span style="color: #080">Hey, how are you doing?</span>',
);

$APEserver = 'http://push2.ape-project.dev.weelya.net';
$APEPassword = 'testpwd';
$s = $APEserver.'/?'.rawurlencode('[{"cmd":"control","params":{"password":"'.$APEPassword.'","channel":"testchannel","raw":"POSTMSG","value":"'.rawurlencode($messages[array_rand($messages)]).'"}}]');
$res = file_get_contents($s);
var_dump($res);

echo 'Message sent!';
