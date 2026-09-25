<?php require __DIR__ . '/_lib.php';
run(function () {
  $sid = (int)($_GET['state_id'] ?? 0);
  if ($sid <= 0) fail('state_id is required');
  $st = db()->prepare("SELECT * FROM districts WHERE state_id = ? ORDER BY name");
  $st->execute([$sid]);
  return $st->fetchAll();
});
