<?php
// Shared bootstrap for all trvlstory /api/*.php endpoints.
// Read-only catalogue API + inquiry writer. No auth: all travel content is public.
declare(strict_types=1);
date_default_timezone_set('UTC');
ini_set('display_errors', '0'); // never leak warnings into JSON responses
header('Content-Type: application/json; charset=utf-8');

function config_path(): string {
  $env = getenv('TRVL_CONFIG');
  if ($env && file_exists($env)) return $env;
  $server = '/home/reddevil/trvlstory-config/config.php';
  if (file_exists($server)) return $server;
  $local = __DIR__ . '/../config/config.php';
  if (file_exists($local)) return $local;
  http_response_code(500);
  echo json_encode(['error' => 'config.php missing. Copy config/config.sample.php to config/config.php']);
  exit;
}

function cfg(): array {
  static $c = null;
  if ($c) return $c;
  $c = require config_path();
  return $c;
}

function db(): PDO {
  static $p = null;
  if ($p) return $p;
  $c = cfg()['db'];
  if (($c['driver'] ?? 'mysql') === 'sqlite') {
    $p = new PDO('sqlite:' . $c['path']);
  } else {
    $p = new PDO(
      "mysql:host={$c['host']};dbname={$c['name']};charset=utf8mb4",
      $c['user'], $c['pass'],
      [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
       PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
       PDO::ATTR_EMULATE_PREPARES => false]
    );
  }
  $p->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $p->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  return $p;
}

/** DB JSON/TEXT column -> PHP array (frontend always receives real arrays). */
function jarr($v): array {
  if ($v === null || $v === '') return [];
  if (is_array($v)) return array_values($v);
  $d = json_decode((string)$v, true);
  return is_array($d) ? array_values($d) : [];
}

function fnum($v) { return $v === null ? null : (float)$v; }
function fint($v) { return $v === null ? null : (int)$v; }

function ok($data): void {
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

function fail(string $msg, int $code = 400): void {
  http_response_code($code);
  echo json_encode(['error' => $msg]);
  exit;
}

function run(callable $fn): void {
  try { ok($fn()); }
  catch (Throwable $e) { fail($e->getMessage()); }
}

// ===== Auth (Bearer tokens) =====

function bearerToken(): ?string {
  $h = $_SERVER['HTTP_AUTHORIZATION']
    ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
    ?? '';
  if (!$h && function_exists('apache_request_headers')) {
    foreach (apache_request_headers() as $k => $v) {
      if (strtolower($k) === 'authorization') { $h = $v; break; }
    }
  }
  if (stripos($h, 'bearer ') === 0) return substr($h, 7);
  return null;
}

function publicUser(array $u): array {
  unset($u['password_hash']);
  $u['id'] = (int)$u['id'];
  $u['email_verified'] = (bool)($u['email_verified'] ?? false);
  $u['vendor_approved'] = (bool)($u['vendor_approved'] ?? false);
  // Passwords are always set at signup in this implementation.
  $u['password_set'] = true;
  return $u;
}

function currentUser(): ?array {
  $t = bearerToken();
  if (!$t) return null;
  $st = db()->prepare(
    "SELECT u.*, t.expires_at AS token_expires FROM auth_tokens t
      JOIN users u ON u.id = t.user_id WHERE t.token = ?"
  );
  $st->execute([$t]);
  $row = $st->fetch();
  if (!$row || strtotime($row['token_expires']) < time()) return null;
  unset($row['token_expires']);
  return publicUser($row);
}

function requireUser(): array {
  $u = currentUser();
  if (!$u) fail('login required', 401);
  return $u;
}

function requireRole(array $u, array $roles): void {
  if (!in_array($u['role'], $roles, true)) fail('forbidden', 403);
}

function issueToken(int $userId, int $days = 30): string {
  $tok = bin2hex(random_bytes(32));
  $exp = date('Y-m-d H:i:s', time() + $days * 86400);
  db()->prepare(
    "INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)"
  )->execute([$userId, $tok, $exp]);
  return $tok;
}

// ===== Email verification codes (shared by verify-code.php and signup.php) =====

function verifyEmailCode(PDO $pdo, string $email, string $code): void {
  $st = $pdo->prepare(
    "SELECT id, code, expires_at FROM verification_codes
      WHERE email = ? AND consumed = 0
      ORDER BY created_at DESC LIMIT 1"
  );
  $st->execute([$email]);
  $row = $st->fetch();
  if (!$row) fail('No valid verification code found. Please request a new code.');
  if (strtotime($row['expires_at']) < time()) {
    fail('Verification code has expired. Please request a new code.');
  }
  if (!hash_equals((string)$row['code'], (string)$code)) {
    fail('Invalid verification code. Please try again.');
  }
  $pdo->prepare("UPDATE verification_codes SET consumed = 1 WHERE id = ?")
    ->execute([$row['id']]);
}

// ===== Outgoing mail (OTP codes) =====

function sendVerificationMail(string $to, string $code): void {
  $c = cfg()['mail'] ?? [];
  $from = $c['from'] ?? 'noreply@trvlstory.reddevils.co.in';
  $subject = "Your Travel Stories verification code: $code";
  $body = "Namaste from Travel Stories!\n\n"
    . "Your 5-digit verification code is: $code\n"
    . "It expires in 10 minutes.\n\n"
    . "If you did not request this, please ignore this email.";
  $headers = "From: Travel Stories <$from>\r\n"
    . "Reply-To: $from\r\n"
    . "Content-Type: text/plain; charset=utf-8";
  @mail($to, $subject, $body, $headers);
}
