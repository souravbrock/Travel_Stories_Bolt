<?php require __DIR__ . '/../_lib.php';
// GET with Bearer token -> returns current user profile.
run(function () {
  return requireUser();
});
