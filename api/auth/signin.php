<?php require __DIR__ . '/../_lib.php';
// POST {email, password} -> returns {token, user}.
try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST required', 405);
  $b = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
  $email = strtolower(trim((string)($b['email'] ?? '')));
  $password = (string)($b['password'] ?? '');
  if ($email === '' || $password === '') fail('Email and password are required');

  $st = db()->prepare("SELECT * FROM users WHERE email = ?");
  $st->execute([$email]);
  $u = $st->fetch();
  if (!$u || !password_verify($password, $u['password_hash'])) {
    fail('Invalid email or password', 401);
  }
  $tok = issueToken((int)$u['id']);
  ok(['token' => $tok, 'user' => publicUser($u)]);
} catch (Throwable $e) {
  fail($e->getMessage());
}
