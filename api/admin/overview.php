<?php require __DIR__ . '/../_lib.php';
// GET with admin Bearer -> vendors + all listings with vendor names.
run(function () {
  $u = requireUser();
  requireRole($u, ['admin']);
  $pdo = db();
  $vendors = array_map('publicUser', $pdo->query(
    "SELECT * FROM users WHERE role = 'vendor' ORDER BY created_at DESC"
  )->fetchAll());
  $withVendor = function (string $table) use ($pdo) {
    return array_map(function ($r) {
      if (isset($r['amenities'])) $r['amenities'] = jarr($r['amenities']);
      foreach (['price', 'price_per_night', 'price_per_day', 'rating'] as $k) {
        if (array_key_exists($k, $r)) $r[$k] = fnum($r[$k]);
      }
      $r['approved'] = (bool)($r['approved'] ?? false);
      return $r;
    }, $pdo->query(
      "SELECT t.*, u.full_name AS vendor_name FROM $table t
        JOIN users u ON u.id = t.vendor_id ORDER BY t.created_at DESC"
    )->fetchAll());
  };
  return [
    'vendors' => $vendors,
    'packages' => $withVendor('vendor_packages'),
    'accommodations' => $withVendor('vendor_accommodations'),
    'vehicles' => $withVendor('vendor_vehicles'),
  ];
});
