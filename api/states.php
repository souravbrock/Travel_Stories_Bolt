<?php require __DIR__ . '/_lib.php';
run(fn() => array_map(function ($s) {
  $s['highlights'] = jarr($s['highlights'] ?? null);
  return $s;
}, db()->query("SELECT * FROM states ORDER BY name")->fetchAll()));
