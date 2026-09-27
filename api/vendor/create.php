<?php require __DIR__ . '/../_lib.php';
// POST with vendor Bearer {type: packages|accommodations|vehicles, data:{...}}
try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST required', 405);
  $u = requireUser();
  requireRole($u, ['vendor', 'admin']);
  $b = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
  $type = (string)($b['type'] ?? '');
  $d = $b['data'] ?? [];
  if (!is_array($d)) fail('data must be an object');
  $pdo = db();
  $num = function ($v) { return ($v === '' || $v === null) ? null : $v + 0; };

  if ($type === 'packages') {
    if (trim((string)($d['title'] ?? '')) === '') fail('Title is required');
    $pdo->prepare(
      "INSERT INTO vendor_packages (vendor_id, title, description, state_name, duration_days, price, category, max_group_size, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )->execute([$u['id'], $d['title'], $d['description'] ?? null, $d['state_name'] ?? null,
      $num($d['duration_days'] ?? null), $num($d['price'] ?? null), $d['category'] ?? null,
      $num($d['max_group_size'] ?? null), $d['image_url'] ?? null]);
  } elseif ($type === 'accommodations') {
    if (trim((string)($d['name'] ?? '')) === '') fail('Name is required');
    $amen = $d['amenities'] ?? [];
    if (is_string($amen)) $amen = array_map('trim', explode(',', $amen));
    $pdo->prepare(
      "INSERT INTO vendor_accommodations (vendor_id, name, type, tier, price_per_night, address, amenities, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )->execute([$u['id'], $d['name'], $d['type'] ?? null, $d['tier'] ?? null,
      $num($d['price_per_night'] ?? null), $d['address'] ?? null,
      json_encode(array_values($amen)), $d['image_url'] ?? null]);
  } elseif ($type === 'vehicles') {
    if (trim((string)($d['vehicle_name'] ?? '')) === '') fail('Vehicle name is required');
    $pdo->prepare(
      "INSERT INTO vendor_vehicles (vendor_id, vehicle_name, vehicle_type, seats, price_per_day, image_url)
       VALUES (?, ?, ?, ?, ?, ?)"
    )->execute([$u['id'], $d['vehicle_name'], $d['vehicle_type'] ?? null,
      ($d['seats'] ?? null) !== null && ($d['seats'] ?? '') !== '' ? (string)$d['seats'] : null,
      $num($d['price_per_day'] ?? null), $d['image_url'] ?? null]);
  } else {
    fail('Unknown listing type');
  }
  ok(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
} catch (Throwable $e) {
  fail($e->getMessage());
}
