<?php require __DIR__ . '/../_lib.php';
// POST with Bearer token {password} -> update own password.
try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST required', 405);
  $u = requireUser();
  $b = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
  $password = (string)($b['password'] ?? '');
  if (strlen($password) < 6) fail('Password must be at least 6 characters');
  db()->prepare("UPDATE users SET password_hash = ? WHERE id = ?")
    ->execute([password_hash($password, PASSWORD_DEFAULT), $u['id']]);
  ok(['ok' => true]);
} catch (Throwable $e) {
  fail($e->getMessage());
}
