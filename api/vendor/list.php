<?php require __DIR__ . '/../_lib.php';
// GET with vendor Bearer token -> own packages/accommodations/vehicles.
run(function () {
  $u = requireUser();
  requireRole($u, ['vendor', 'admin']);
  $pdo = db();
  $id = $u['id'];
  $q = function (string $sql) use ($pdo, $id) {
    $st = $pdo->prepare($sql);
    $st->execute([$id]);
    return array_map(function ($r) {
      if (isset($r['amenities'])) $r['amenities'] = jarr($r['amenities']);
      foreach (['price', 'price_per_night', 'price_per_day', 'rating'] as $k) {
        if (array_key_exists($k, $r)) $r[$k] = fnum($r[$k]);
      }
      foreach (['duration_days', 'max_group_size'] as $k) {
        if (array_key_exists($k, $r)) $r[$k] = fint($r[$k]);
      }
      $r['approved'] = (bool)($r['approved'] ?? false);
      return $r;
    }, $st->fetchAll());
  };
  return [
    'packages' => $q("SELECT * FROM vendor_packages WHERE vendor_id = ? ORDER BY created_at DESC"),
    'accommodations' => $q("SELECT * FROM vendor_accommodations WHERE vendor_id = ? ORDER BY created_at DESC"),
    'vehicles' => $q("SELECT * FROM vendor_vehicles WHERE vendor_id = ? ORDER BY created_at DESC"),
  ];
});
