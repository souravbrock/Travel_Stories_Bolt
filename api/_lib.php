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
