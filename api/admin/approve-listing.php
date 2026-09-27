<?php require __DIR__ . '/../_lib.php';
// POST with admin Bearer {type: packages|accommodations|vehicles, id} -> approve.
$TABLES = ['packages' => 'vendor_packages', 'accommodations' => 'vendor_accommodations', 'vehicles' => 'vendor_vehicles'];
try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST required', 405);
  requireRole(requireUser(), ['admin']);
  $b = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
  $table = $TABLES[(string)($b['type'] ?? '')] ?? null;
  $id = (int)($b['id'] ?? 0);
  if (!$table || $id <= 0) fail('type and id are required');
  db()->prepare("UPDATE $table SET approved = 1 WHERE id = ?")->execute([$id]);
  ok(['ok' => true]);
} catch (Throwable $e) {
  fail($e->getMessage());
}
