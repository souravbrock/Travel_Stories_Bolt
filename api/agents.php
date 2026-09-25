<?php require __DIR__ . '/_lib.php';
run(function () {
  return array_map(function ($a) {
    $a['verified'] = (bool)$a['verified'];
    $a['rating'] = fnum($a['rating'] ?? 0) ?? 0.0;
    return $a;
  }, db()->query("SELECT * FROM travel_agents ORDER BY rating DESC")->fetchAll());
});
