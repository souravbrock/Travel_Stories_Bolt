<?php
// Copy to config.php and fill in. config.php is git-ignored and on the
// server lives OUTSIDE the docroot at /home/reddevil/trvlstory-config/config.php
return [
  'db' => [
    'driver' => 'mysql',          // 'mysql' on cPanel, 'sqlite' for local preview
    'host'   => 'localhost',
    'name'   => 'reddevil_trvlstory',
    'user'   => 'reddevil_trvluser',
    'pass'   => 'CHANGE-ME',
    // sqlite only:
    // 'path' => __DIR__ . '/trvlstory.db',
  ],
];
