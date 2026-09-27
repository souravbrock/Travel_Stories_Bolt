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
  // Set true ONLY for local preview: OTP codes are returned in the API
  // response (dev_code) since PHP mail() has nowhere to deliver locally.
  // ALWAYS false in production.
  'debug' => false,
  'mail' => [
    // Sender for verification emails. Create this address (or a forwarder)
    // in cPanel -> Email Accounts and check Email Deliverability (SPF/DKIM).
    'from' => 'noreply@trvlstory.reddevils.co.in',
  ],
];
