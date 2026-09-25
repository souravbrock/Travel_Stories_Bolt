import json
import pathlib
import sqlite3

root = pathlib.Path(__file__).resolve().parent.parent
c = sqlite3.connect(":memory:")
c.executescript((root / "database" / "schema.sqlite.sql").read_text(encoding="utf-8"))
c.executescript((root / "database" / "seed.sql").read_text(encoding="utf-8"))
for tbl in ["states", "districts", "tourist_spots", "accommodations",
            "travel_agents", "travel_packages", "inquiries"]:
    print(tbl, c.execute(f"select count(*) from {tbl}").fetchone()[0])
print("ajmer fix:", c.execute("select name from districts where name='Ajmer'").fetchall())
print("kanyakumari fix:", c.execute("select name from districts where name like 'Kany%'").fetchall())
row = c.execute("select highlights from states where name='Kerala'").fetchone()[0]
print("kerala highlights parsed:", json.loads(row))
row = c.execute("select itinerary from travel_packages limit 1").fetchone()[0]
print("itinerary items:", len(json.loads(row)))
bad = c.execute("select count(*) from tourist_spots where district_id not in (select id from districts)").fetchone()[0]
print("orphan spots:", bad)
