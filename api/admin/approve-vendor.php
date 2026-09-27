<?php require __DIR__ . '/../_lib.php';
// POST with admin Bearer {id} -> approve a vendor account.
try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST required', 405);
  requireRole(requireUser(), ['admin']);
  $b = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
  $id = (int)($b['id'] ?? 0);
  if ($id <= 0) fail('id is required');
  db()->prepare("UPDATE users SET vendor_approved = 1 WHERE id = ? AND role = 'vendor'")
    ->execute([$id]);
  ok(['ok' => true]);
} catch (Throwable $e) {
  fail($e->getMessage());
}
