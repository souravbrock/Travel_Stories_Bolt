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
  return array_map(function ($p) {
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
});
