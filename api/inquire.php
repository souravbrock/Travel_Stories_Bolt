<?php require __DIR__ . '/_lib.php';
// Stores a package inquiry (replaces the previous UI-only fake submit).
try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST required', 405);
  $raw = file_get_contents('php://input');
  $b = json_decode($raw ?: '{}', true);
  if (!is_array($b)) $b = [];
  $name = trim((string)($b['name'] ?? ''));
  $email = trim((string)($b['email'] ?? ''));
  if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('A valid name and email are required');
  }
  $st = db()->prepare(
    "INSERT INTO inquiries (package_id, name, email, phone, travelers, message)
     VALUES (?, ?, ?, ?, ?, ?)"
  );
  $st->execute([
    ($b['package_id'] ?? null) !== null ? (int)$b['package_id'] : null,
    $name, $email,
    trim((string)($b['phone'] ?? '')),
    trim((string)($b['travelers'] ?? '')),
    trim((string)($b['message'] ?? '')),
  ]);
  ok(['ok' => true, 'id' => (int)db()->lastInsertId()]);
} catch (Throwable $e) {
  fail($e->getMessage());
}
