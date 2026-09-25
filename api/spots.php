<?php require __DIR__ . '/_lib.php';
run(function () {
  $pdo = db();
  $did = (int)($_GET['district_id'] ?? 0);
  $sid = (int)($_GET['state_id'] ?? 0);
  if ($did > 0) {
    $st = $pdo->prepare("SELECT * FROM tourist_spots WHERE district_id = ? ORDER BY rating DESC");
    $st->execute([$did]);
  } elseif ($sid > 0) {
    $st = $pdo->prepare(
      "SELECT ts.* FROM tourist_spots ts
        JOIN districts d ON d.id = ts.district_id
       WHERE d.state_id = ? ORDER BY ts.rating DESC"
    );
    $st->execute([$sid]);
  } else {
    fail('district_id or state_id is required');
  }
  return array_map(function ($s) {
    $s['latitude'] = fnum($s['latitude'] ?? null);
    $s['longitude'] = fnum($s['longitude'] ?? null);
    $s['rating'] = fnum($s['rating'] ?? 0) ?? 0.0;
    return $s;
  }, $st->fetchAll());
});
