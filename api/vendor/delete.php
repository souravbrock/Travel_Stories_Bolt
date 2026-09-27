<?php require __DIR__ . '/../_lib.php';
// POST with vendor Bearer {type, id} -> delete own listing.
$TABLES = ['packages' => 'vendor_packages', 'accommodations' => 'vendor_accommodations', 'vehicles' => 'vendor_vehicles'];
try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST required', 405);
  $u = requireUser();
  requireRole($u, ['vendor', 'admin']);
  $b = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
  $table = $TABLES[(string)($b['type'] ?? '')] ?? null;
  $id = (int)($b['id'] ?? 0);
  if (!$table || $id <= 0) fail('type and id are required');
  if ($u['role'] === 'admin') {
    db()->prepare("DELETE FROM $table WHERE id = ?")->execute([$id]);
  } else {
    db()->prepare("DELETE FROM $table WHERE id = ? AND vendor_id = ?")->execute([$id, $u['id']]);
  }
  ok(['ok' => true]);
} catch (Throwable $e) {
  fail($e->getMessage());
}
