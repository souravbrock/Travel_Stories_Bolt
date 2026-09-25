/*
# Fix district/map name mismatches

Corrects two seeded district names that never match the TopoJSON
`district` properties, so those districts highlight on the state map:

- Rajasthan `Pushkar` -> `Ajmer` (Pushkar is a town inside Ajmer district;
  its tourist spots geographically belong to Ajmer).
- Tamil Nadu `Kanniyakumari` -> `Kanyakumari` (matches the map data spelling).

Idempotent: plain UPDATEs guarded by WHERE clauses.
*/

UPDATE districts
SET name = 'Ajmer',
    description = 'Home to the sacred town of Pushkar with its holy lake and the famous camel fair, plus Ajmer Sharif Dargah.'
WHERE name = 'Pushkar'
  AND state_id = (SELECT id FROM states WHERE name = 'Rajasthan');

UPDATE districts
SET name = 'Kanyakumari'
WHERE name = 'Kanniyakumari'
  AND state_id = (SELECT id FROM states WHERE name = 'Tamil Nadu');
