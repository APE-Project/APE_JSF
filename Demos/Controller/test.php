<?php
$APEserver = 'http://local.ape-project.org:6969/?';
$APEPassword = 'testpasswd';

$messages = array(
	'Test Message',
	'<span style="color: #800">I\'m awesome!</span>',
	'<span style="color: #080">Hey, how are you doing?</span>',
);

$cmd = array(array( 
  'cmd' => 'inlinepush', 
  'params' =>  array( 
	  'password'  => $APEPassword, 
	  'raw'       => 'postmsg', 
	  'channel'   => 'testchannel', 
	  'data'      => array( //Note: data can't be a string 
	      'message' => $messages[array_rand($messages)] 
	  ) 
   ) 
)); 

var_dump($APEserver.rawurlencode(json_encode($cmd)));
$data = file_get_contents($APEserver.rawurlencode(json_encode($cmd))); 

if ($data == 'OK') {
	echo 'Message sent!';
} else {
	echo 'Error sending message, server response is : <pre>'.$data.'</pre>';
}
