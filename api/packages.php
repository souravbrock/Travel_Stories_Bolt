<?php require __DIR__ . '/_lib.php';
run(function () {
  $rows = db()->query(
    "SELECT p.*,
            a.id AS a_id, a.name AS a_name, a.logo_url AS a_logo, a.verified AS a_verified,
            a.rating AS a_rating, a.description AS a_desc,
            a.contact_email AS a_email, a.contact_phone AS a_phone
       FROM travel_packages p
       JOIN travel_agents a ON a.id = p.agent_id
      ORDER BY p.rating DESC"
  )->fetchAll();
  $mapped = array_map(function ($p) {
    $agent = [
      'id' => (int)$p['a_id'],
      'name' => $p['a_name'],
      'logo_url' => $p['a_logo'],
      'verified' => (bool)$p['a_verified'],
      'rating' => fnum($p['a_rating']) ?? 0.0,
      'description' => $p['a_desc'],
      'contact_email' => $p['a_email'],
      'contact_phone' => $p['a_phone'],
    ];
    foreach (['a_id','a_name','a_logo','a_verified','a_rating','a_desc','a_email','a_phone'] as $k) unset($p[$k]);
    $p['inclusions'] = jarr($p['inclusions'] ?? null);
    $p['exclusions'] = jarr($p['exclusions'] ?? null);
    $p['itinerary'] = jarr($p['itinerary'] ?? null);
    $p['price'] = fnum($p['price'] ?? null);
    $p['rating'] = fnum($p['rating'] ?? 0) ?? 0.0;
    $p['duration_days'] = fint($p['duration_days'] ?? null);
    $p['max_group_size'] = fint($p['max_group_size'] ?? null);
    $p['agent'] = $agent;
    return $p;
  }, $rows);

  // Approved vendor packages appear alongside curated ones (offset ids so
  // React keys and inquiry routing never collide with curated ids).
  $vp = db()->query(
    "SELECT p.*, u.full_name AS vendor_name, u.vendor_approved AS vendor_ok
       FROM vendor_packages p JOIN users u ON u.id = p.vendor_id
      WHERE p.approved = 1 ORDER BY p.created_at DESC"
  )->fetchAll();
  foreach ($vp as $v) {
    $mapped[] = [
      'id' => 1000000 + (int)$v['id'],
      'agent_id' => 0,
      'title' => $v['title'],
      'slug' => 'vendor-' . (int)$v['id'],
      'description' => $v['description'],
      'state_name' => $v['state_name'],
      'duration_days' => fint($v['duration_days'] ?? null),
      'price' => fnum($v['price'] ?? null),
      'inclusions' => [],
      'exclusions' => [],
      'itinerary' => [],
      'image_url' => $v['image_url'],
      'rating' => 0.0,
      'category' => $v['category'],
      'max_group_size' => fint($v['max_group_size'] ?? null),
      'agent' => [
        'id' => 0,
        'name' => $v['vendor_name'],
        'logo_url' => null,
        'verified' => (bool)$v['vendor_ok'],
        'rating' => 0.0,
        'description' => null,
        'contact_email' => null,
        'contact_phone' => null,
      ],
    ];
  }

  return $mapped;
});
