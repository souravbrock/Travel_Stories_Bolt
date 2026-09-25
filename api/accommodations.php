<?php require __DIR__ . '/_lib.php';
run(function () {
  $spot = (int)($_GET['spot_id'] ?? 0);
  if ($spot <= 0) fail('spot_id is required');
  $st = db()->prepare("SELECT * FROM accommodations WHERE tourist_spot_id = ? ORDER BY price_per_night ASC");
  $st->execute([$spot]);
  return array_map(function ($a) {
    $a['amenities'] = jarr($a['amenities'] ?? null);
    $a['price_per_night'] = fnum($a['price_per_night'] ?? null);
    $a['rating'] = fnum($a['rating'] ?? 0) ?? 0.0;
    return $a;
  }, $st->fetchAll());
});
