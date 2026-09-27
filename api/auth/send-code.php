<?php require __DIR__ . '/../_lib.php';
// POST {email} -> issue a 5-digit code (10 min expiry), email it.
// Returns {ok, dev_code?} — dev_code only when config debug=true (local preview).
try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST required', 405);
  $b = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
  $email = strtolower(trim((string)($b['email'] ?? '')));
  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('A valid email is required');

  $pdo = db();
  // Rate limit: max 5 codes per hour per email (portable datetime math)
  $st = $pdo->prepare(
    "SELECT created_at FROM verification_codes WHERE email = ?"
  );
  $st->execute([$email]);
  $recent = 0;
  foreach ($st->fetchAll() as $r) {
    if (strtotime($r['created_at']) > time() - 3600) $recent++;
  }
  if ($recent >= 5) fail('Too many codes requested. Try again later.');

  // Invalidate previous unused codes
  $pdo->prepare(
    "UPDATE verification_codes SET consumed = 1 WHERE email = ? AND consumed = 0"
  )->execute([$email]);

  $code = (string)random_int(10000, 99999);
  $pdo->prepare(
    "INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)"
  )->execute([$email, $code, date('Y-m-d H:i:s', time() + 600)]);

  sendVerificationMail($email, $code);

  $out = ['ok' => true];
  if (!empty(cfg()['debug'])) $out['dev_code'] = $code;
  ok($out);
} catch (Throwable $e) {
  fail($e->getMessage());
}
