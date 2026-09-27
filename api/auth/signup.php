<?php require __DIR__ . '/../_lib.php';
// POST {email, full_name, phone, role, vendor_type, password, code}
// Verifies the OTP, creates the account, returns {token, user}.
$ROLES = ['customer', 'vendor', 'admin'];
$VENDOR_TYPES = ['travel_agent', 'hotel', 'homestay', 'transport', 'ticket_booking'];
try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST required', 405);
  $b = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
  $email = strtolower(trim((string)($b['email'] ?? '')));
  $name = trim((string)($b['full_name'] ?? ''));
  $phone = trim((string)($b['phone'] ?? ''));
  $role = (string)($b['role'] ?? 'customer');
  $vendorType = ($b['vendor_type'] ?? null) !== null ? (string)$b['vendor_type'] : null;
  $password = (string)($b['password'] ?? '');
  $code = trim((string)($b['code'] ?? ''));

  if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail('A valid email is required');
  if ($name === '') fail('Full name is required');
  if (!in_array($role, $ROLES, true)) fail('Invalid role');
  if ($role === 'admin') fail('Admin accounts are created by an existing admin');
  if ($role === 'vendor' && !in_array($vendorType, $VENDOR_TYPES, true)) {
    fail('A valid vendor type is required');
  }
  if (strlen($password) < 6) fail('Password must be at least 6 characters');
  if ($code === '') fail('Verification code is required');

  $pdo = db();
  verifyEmailCode($pdo, $email, $code);

  $st = $pdo->prepare("SELECT id FROM users WHERE email = ?");
  $st->execute([$email]);
  if ($st->fetch()) fail('An account with this email already exists');

  $pdo->prepare(
    "INSERT INTO users (email, password_hash, full_name, phone, role, email_verified, vendor_type, vendor_approved)
     VALUES (?, ?, ?, ?, ?, 1, ?, 0)"
  )->execute([$email, password_hash($password, PASSWORD_DEFAULT), $name, $phone ?: null, $role, $role === 'vendor' ? $vendorType : null]);
  $uid = (int)$pdo->lastInsertId();
  $tok = issueToken($uid);

  $st = $pdo->prepare("SELECT * FROM users WHERE id = ?");
  $st->execute([$uid]);
  ok(['token' => $tok, 'user' => publicUser($st->fetch())]);
} catch (Throwable $e) {
  fail($e->getMessage());
}
