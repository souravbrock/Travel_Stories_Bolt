<?php require __DIR__ . '/../_lib.php';
// POST {email, code} -> verify (and consume) a code. Returns {ok:true}.
try {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST required', 405);
  $b = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
  $email = strtolower(trim((string)($b['email'] ?? '')));
  $code = trim((string)($b['code'] ?? ''));
  if ($email === '' || $code === '') fail('Email and code are required');
  verifyEmailCode(db(), $email, $code);
  ok(['ok' => true]);
} catch (Throwable $e) {
  fail($e->getMessage());
}
