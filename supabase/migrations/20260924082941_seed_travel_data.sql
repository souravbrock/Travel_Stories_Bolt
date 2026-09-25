/*
# Seed Travel Data — States, Districts, Tourist Spots, Accommodations

Populates the database with curated content for five major Indian states:
Kerala, Rajasthan, Goa, Himachal Pradesh, and Tamil Nadu.

Each state includes:
- State metadata (tagline, description, best season, highlights, color)
- Multiple districts with descriptions
- Tourist spots with coordinates, ratings, categories
- Accommodations (hotels, resorts, homestays) across budget/deluxe/luxury tiers

All data is real, curated travel information for demonstration of the
interactive map discovery experience.
*/

-- ============ STATES ============
INSERT INTO states (name, slug, tagline, description, best_season, peak_season, highlights, color) VALUES
('Kerala', 'kerala', 'God''s Own Country', 'A tropical paradise of palm-fringed beaches, serene backwaters, misty hill stations, and vibrant traditions. Kerala offers a unique blend of nature, Ayurveda, and cultural richness.', 'Winter (Oct–Feb)', 'December–January', '{"Backwaters & Houseboats","Munnar Tea Gardens","Ayurvedic Wellness","Kathakali Performances","Spice Plantations"}', '#2f8fff'),
('Rajasthan', 'rajasthan', 'Land of Kings', 'A royal desert state of majestic forts, opulent palaces, and golden sands. Rajasthan is a living museum of Rajput valor, vibrant festivals, and desert adventures.', 'Winter (Oct–Mar)', 'November–February', '{"Amber Fort","Thar Desert Safari","Lake Pichola","Pushkar Camel Fair","Heritage Palaces"}', '#f97316'),
('Goa', 'goa', 'Pearl of the Orient', 'India''s beach capital with golden sands, Portuguese heritage, and a laid-back vibe. Goa blends sun-soaked coastlines with centuries-old churches and a vibrant nightlife.', 'Winter (Nov–Feb)', 'December–January', '{"Beaches & Water Sports","Portuguese Churches","Goan Cuisine","Night Markets","Dudhsagar Falls"}', '#16a34a'),
('Himachal Pradesh', 'himachal-pradesh', 'Land of the Gods', 'A Himalayan wonderland of snow-capped peaks, alpine meadows, and colonial hill stations. Himachal is a haven for trekkers, spiritual seekers, and mountain lovers.', 'Summer (Mar–Jun) & Autumn (Sep–Nov)', 'May–June', '{"Shimla Ridge","Manali Snow Peaks","Spiti Valley Monasteries","Kullu Dussehra","Apple Orchards"}', '#1456e1'),
('Tamil Nadu', 'tamil-nadu', 'Land of Temples', 'A cradle of Dravidian civilization with towering temple gopurams, classical Bharatanatyam, and a coastline along the Bay of Bengal. Tamil Nadu is a cultural and spiritual powerhouse.', 'Winter (Nov–Mar)', 'December–February', '{"Meenakshi Temple","Marina Beach","Mahabalipuram Shore Temple","Chola Bronzes","Carnatic Music"}', '#d97706')
ON CONFLICT (name) DO NOTHING;

-- ============ DISTRICTS ============
-- Kerala districts
INSERT INTO districts (state_id, name, description) VALUES
((SELECT id FROM states WHERE name='Kerala'), 'Ernakulam', 'Kerala''s commercial capital, home to Kochi with its historic Fort Kochi and bustling harbor.'),
((SELECT id FROM states WHERE name='Kerala'), 'Idukki', 'A high-range district of misty hills, tea plantations, and wildlife sanctuaries, home to Munnar.'),
((SELECT id FROM states WHERE name='Kerala'), 'Alappuzha', 'The Venice of the East, famous for backwaters, houseboats, and snake boat races.'),
((SELECT id FROM states WHERE name='Kerala'), 'Thiruvananthapuram', 'The capital district with ancient temples, museums, and the famous Kovalam beach.'),
((SELECT id FROM states WHERE name='Kerala'), 'Wayanad', 'A lush green plateau of wildlife reserves, prehistoric caves, and spice plantations.')
ON CONFLICT (state_id, name) DO NOTHING;

-- Rajasthan districts
INSERT INTO districts (state_id, name, description) VALUES
((SELECT id FROM states WHERE name='Rajasthan'), 'Jaipur', 'The Pink City, capital of Rajasthan, known for its hilltop forts and grand palaces.'),
((SELECT id FROM states WHERE name='Rajasthan'), 'Udaipur', 'The City of Lakes, a romantic destination of marble palaces and shimmering waters.'),
((SELECT id FROM states WHERE name='Rajasthan'), 'Jaisalmer', 'The Golden City, a living fort in the Thar Desert with golden sandstone architecture.'),
((SELECT id FROM states WHERE name='Rajasthan'), 'Jodhpur', 'The Blue City, dominated by the mighty Mehrangarh Fort.'),
((SELECT id FROM states WHERE name='Rajasthan'), 'Pushkar', 'A sacred pilgrimage town around a holy lake, home to the famous camel fair.')
ON CONFLICT (state_id, name) DO NOTHING;

-- Goa districts
INSERT INTO districts (state_id, name, description) VALUES
((SELECT id FROM states WHERE name='Goa'), 'North Goa', 'The lively northern district with popular beaches, flea markets, and nightlife.'),
((SELECT id FROM states WHERE name='Goa'), 'South Goa', 'The tranquil southern district with pristine beaches and luxury resorts.')
ON CONFLICT (state_id, name) DO NOTHING;

-- Himachal Pradesh districts
INSERT INTO districts (state_id, name, description) VALUES
((SELECT id FROM states WHERE name='Himachal Pradesh'), 'Shimla', 'The former British summer capital with colonial architecture and mountain vistas.'),
((SELECT id FROM states WHERE name='Himachal Pradesh'), 'Kullu', 'The valley of gods, famous for trekking, rafting, and the Dussehra festival.'),
((SELECT id FROM states WHERE name='Himachal Pradesh'), 'Lahaul and Spiti', 'A remote trans-Himalayan valley of ancient monasteries and stark landscapes.'),
((SELECT id FROM states WHERE name='Himachal Pradesh'), 'Solan', 'A gateway district known for its mushroom farming and pleasant climate.')
ON CONFLICT (state_id, name) DO NOTHING;

-- Tamil Nadu districts
INSERT INTO districts (state_id, name, description) VALUES
((SELECT id FROM states WHERE name='Tamil Nadu'), 'Madurai', 'The temple city, home to the magnificent Meenakshi Amman Temple.'),
((SELECT id FROM states WHERE name='Tamil Nadu'), 'Chennai', 'The coastal capital, blending colonial heritage with modern culture and Marina Beach.'),
((SELECT id FROM states WHERE name='Tamil Nadu'), 'Kancheepuram', 'The city of a thousand temples, renowned for silk weaving and ancient shrines.'),
((SELECT id FROM states WHERE name='Tamil Nadu'), 'Kanniyakumari', 'India''s southernmost tip where three seas meet, famous for sunrises and sunsets.')
ON CONFLICT (state_id, name) DO NOTHING;

-- ============ TOURIST SPOTS ============
-- Kerala spots
INSERT INTO tourist_spots (district_id, name, description, category, latitude, longitude, rating, entry_fee, visit_duration) VALUES
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Ernakulam' AND s.name='Kerala'), 'Fort Kochi', 'A historic neighborhood blending Portuguese, Dutch, and British colonial architecture with Chinese fishing nets along the waterfront.', 'Heritage', 9.966100, 76.242300, 4.4, 'Free', '3–4 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Ernakulam' AND s.name='Kerala'), 'Marine Drive Kochi', 'A scenic promenade along the backwaters, perfect for evening strolls and sunset views.', 'Waterfront', 9.979700, 76.283000, 4.2, 'Free', '1–2 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Idukki' AND s.name='Kerala'), 'Munnar Tea Gardens', 'Rolling hills blanketed in emerald tea plantations, offering misty vistas and plantation tours.', 'Hill Station', 10.088900, 77.059500, 4.7, 'Free', '4–5 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Idukki' AND s.name='Kerala'), 'Eravikulam National Park', 'A sanctuary for the endangered Nilgiri Tahr, set among shola grasslands and rolling hills.', 'Wildlife', 10.292200, 77.067500, 4.5, '₹125', '2–3 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Alappuzha' AND s.name='Kerala'), 'Alappuzha Backwaters', 'A serene network of canals, lagoons, and lakes best explored on traditional houseboats.', 'Backwaters', 9.494500, 76.337700, 4.8, '₹500', 'Full day'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Alappuzha' AND s.name='Kerala'), 'Marari Beach', 'A pristine stretch of golden sand with swaying palms, ideal for relaxation and swimming.', 'Beach', 9.618900, 76.385000, 4.3, 'Free', '2–3 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Thiruvananthapuram' AND s.name='Kerala'), 'Kovalam Beach', 'A crescent-shaped beach with a historic lighthouse, known for surfing and Ayurvedic resorts.', 'Beach', 8.382000, 76.972000, 4.4, 'Free', '3–4 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Thiruvananthapuram' AND s.name='Kerala'), 'Padmanabhaswamy Temple', 'An ancient Dravidian-style temple, one of the richest religious institutions in the world.', 'Temple', 8.937400, 76.944700, 4.6, 'Free', '1–2 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Wayanad' AND s.name='Kerala'), 'Edakkal Caves', 'Prehistoric rock engravings dating back over 3,000 years, set atop a mountain peak.', 'Heritage', 11.619400, 76.232200, 4.3, '₹20', '2–3 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Wayanad' AND s.name='Kerala'), 'Banasura Sagar Dam', 'India''s largest earth dam, surrounded by lush hills and offering boating and trekking.', 'Nature', 11.678300, 75.991100, 4.4, '₹40', '2–3 hours')
ON CONFLICT DO NOTHING;

-- Rajasthan spots
INSERT INTO tourist_spots (district_id, name, description, category, latitude, longitude, rating, entry_fee, visit_duration) VALUES
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Jaipur' AND s.name='Rajasthan'), 'Amber Fort', 'A majestic hilltop fort of red sandstone and marble, featuring mirror palace halls and elephant rides.', 'Heritage', 26.985500, 75.851300, 4.7, '₹200', '3–4 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Jaipur' AND s.name='Rajasthan'), 'Hawa Mahal', 'The Palace of Winds, a five-story pink sandstone facade with 953 tiny windows.', 'Heritage', 26.923900, 75.826700, 4.5, '₹50', '1 hour'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Jaipur' AND s.name='Rajasthan'), 'City Palace Jaipur', 'A grand royal complex blending Rajput and Mughal architecture, still home to the royal family.', 'Heritage', 26.925800, 75.826100, 4.5, '₹300', '2–3 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Udaipur' AND s.name='Rajasthan'), 'Lake Pichola', 'A shimmering artificial lake dotted with island palaces, best explored by boat at sunset.', 'Lake', 24.553100, 73.679000, 4.8, '₹400', '2 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Udaipur' AND s.name='Rajasthan'), 'City Palace Udaipur', 'A sprawling marble palace complex overlooking Lake Pichola, showcasing royal Rajput heritage.', 'Heritage', 24.571200, 73.680000, 4.6, '₹300', '2–3 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Jaisalmer' AND s.name='Rajasthan'), 'Jaisalmer Fort', 'A living golden sandstone fort, one of the few inhabited forts in the world, with temples and havelis.', 'Heritage', 26.915700, 70.915700, 4.7, '₹250', '3–4 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Jaisalmer' AND s.name='Rajasthan'), 'Sam Sand Dunes', 'Golden dunes of the Thar Desert, offering camel safaris and cultural performances under the stars.', 'Desert', 26.806700, 70.521000, 4.5, '₹100', 'Half day'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Jodhpur' AND s.name='Rajasthan'), 'Mehrangarh Fort', 'A colossal hilltop fort towering over the Blue City, with museum galleries and panoramic views.', 'Heritage', 26.588500, 73.071000, 4.8, '₹200', '3–4 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Jodhpur' AND s.name='Rajasthan'), 'Umaid Bhawan Palace', 'One of the world''s largest royal residences, part palace, part museum, part luxury hotel.', 'Heritage', 26.632000, 73.062000, 4.7, '₹300', '2 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Pushkar' AND s.name='Rajasthan'), 'Pushkar Lake', 'A sacred lake surrounded by 52 bathing ghats and 500 temples, a major pilgrimage site.', 'Spiritual', 26.489900, 74.551100, 4.4, 'Free', '2–3 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Pushkar' AND s.name='Rajasthan'), 'Brahma Temple Pushkar', 'One of the very few temples dedicated to Lord Brahma, drawing pilgrims from across India.', 'Temple', 26.487500, 74.551100, 4.5, 'Free', '1 hour')
ON CONFLICT DO NOTHING;

-- Goa spots
INSERT INTO tourist_spots (district_id, name, description, category, latitude, longitude, rating, entry_fee, visit_duration) VALUES
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='North Goa' AND s.name='Goa'), 'Baga Beach', 'A vibrant beach known for water sports, beach shacks, and energetic nightlife.', 'Beach', 15.548000, 73.751000, 4.3, 'Free', 'Full day'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='North Goa' AND s.name='Goa'), 'Fort Aguada', 'A 17th-century Portuguese fort with a lighthouse overlooking the Arabian Sea.', 'Heritage', 15.747000, 73.749000, 4.4, 'Free', '1–2 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='North Goa' AND s.name='Goa'), 'Anjuna Flea Market', 'A famous Wednesday flea market offering handicrafts, jewelry, and Goan souvenirs.', 'Shopping', 15.575000, 73.741000, 4.1, 'Free', '2–3 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='South Goa' AND s.name='Goa'), 'Palolem Beach', 'A stunning crescent-shaped beach with calm waters, ideal for swimming and kayaking.', 'Beach', 15.009900, 74.023500, 4.7, 'Free', 'Full day'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='South Goa' AND s.name='Goa'), 'Dudhsagar Falls', 'A spectacular four-tiered waterfall on the Mandovi River, cascading 310 meters.', 'Nature', 15.382000, 74.317000, 4.6, '₹400', 'Half day')
ON CONFLICT DO NOTHING;

-- Himachal Pradesh spots
INSERT INTO tourist_spots (district_id, name, description, category, latitude, longitude, rating, entry_fee, visit_duration) VALUES
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Shimla' AND s.name='Himachal Pradesh'), 'The Ridge Shimla', 'A wide open space in the heart of Shimla, offering panoramic Himalayan views and colonial landmarks.', 'Hill Station', 31.104500, 77.173400, 4.5, 'Free', '2 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Shimla' AND s.name='Himachal Pradesh'), 'Kalka-Shimla Railway', 'A UNESCO World Heritage narrow-gauge toy train winding through 102 tunnels and mountain vistas.', 'Heritage', 31.103000, 77.170000, 4.6, '₹150', '5–6 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Kullu' AND s.name='Himachal Pradesh'), 'Solang Valley', 'A snow-capped valley offering skiing, paragliding, and breathtaking mountain scenery.', 'Adventure', 32.319000, 77.156000, 4.5, 'Free', 'Full day'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Kullu' AND s.name='Himachal Pradesh'), 'Hadimba Temple', 'An ancient cedar wood temple surrounded by tall deodar forests, a serene spiritual site.', 'Temple', 32.262000, 77.193000, 4.4, 'Free', '1 hour'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Lahaul and Spiti' AND s.name='Himachal Pradesh'), 'Key Monastery', 'A thousand-year-old Tibetan Buddhist monastery perched at 4,166m, overlooking the Spiti Valley.', 'Spiritual', 32.297000, 78.001000, 4.7, 'Free', '2–3 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Lahaul and Spiti' AND s.name='Himachal Pradesh'), 'Chandra Taal Lake', 'A crescent-shaped high-altitude lake at 4,300m, surrounded by snow-capped peaks and meadows.', 'Nature', 32.487000, 77.614000, 4.8, 'Free', 'Full day')
ON CONFLICT DO NOTHING;

-- Tamil Nadu spots
INSERT INTO tourist_spots (district_id, name, description, category, latitude, longitude, rating, entry_fee, visit_duration) VALUES
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Madurai' AND s.name='Tamil Nadu'), 'Meenakshi Amman Temple', 'A towering Dravidian temple complex with 14 gopurams, dedicated to Goddess Meenakshi and Lord Shiva.', 'Temple', 9.919500, 78.119700, 4.8, 'Free', '3–4 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Madurai' AND s.name='Tamil Nadu'), 'Thirumalai Nayakkar Palace', 'A 17th-century palace blending Dravidian and Islamic architecture, with a stunning sound-and-light show.', 'Heritage', 9.919000, 78.121000, 4.3, '₹50', '1–2 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Chennai' AND s.name='Tamil Nadu'), 'Marina Beach', 'India''s longest urban beach, stretching 13 km along the Bay of Bengal, perfect for morning walks.', 'Beach', 13.050000, 80.282400, 4.3, 'Free', '2–3 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Chennai' AND s.name='Tamil Nadu'), 'Kapaleeshwarar Temple', 'A vibrant 7th-century Shiva temple with a colorful gopuram, a masterpiece of Dravidian architecture.', 'Temple', 13.037800, 80.267600, 4.5, 'Free', '1–2 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Kancheepuram' AND s.name='Tamil Nadu'), 'Kailasanathar Temple', 'The oldest structure in Kanchipuram, an 8th-century sandstone temple with intricate carvings.', 'Temple', 12.838000, 79.695000, 4.5, 'Free', '1–2 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Kancheepuram' AND s.name='Tamil Nadu'), 'Ekambareswarar Temple', 'One of the five Pancha Bhoota Stalas, representing earth, with a 3,500-year-old mango tree.', 'Temple', 12.847000, 79.699000, 4.6, 'Free', '1–2 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Kanniyakumari' AND s.name='Tamil Nadu'), 'Vivekananda Rock Memorial', 'A memorial on a rocky island where Swami Vivekananda meditated, with views of three seas meeting.', 'Spiritual', 8.078000, 77.553000, 4.6, '₹50', '2–3 hours'),
((SELECT d.id FROM districts d JOIN states s ON d.state_id=s.id WHERE d.name='Kanniyakumari' AND s.name='Tamil Nadu'), 'Kanniyakumari Beach', 'The southernmost tip of India, where the Arabian Sea, Bay of Bengal, and Indian Ocean converge.', 'Beach', 8.083000, 77.533000, 4.4, 'Free', '2 hours')
ON CONFLICT DO NOTHING;

-- ============ ACCOMMODATIONS ============
-- Kerala accommodations
INSERT INTO accommodations (tourist_spot_id, name, type, tier, price_per_night, rating, amenities, address) VALUES
((SELECT id FROM tourist_spots WHERE name='Fort Kochi'), 'Brunton Boatyard Hotel', 'Hotel', 'Luxury', 8500, 4.6, '{"Sea View","Pool","Spa","Restaurant","Bar","WiFi"}', 'Calvetty Road, Fort Kochi'),
((SELECT id FROM tourist_spots WHERE name='Fort Kochi'), 'Fort Kochi Homestay', 'Homestay', 'Budget', 1800, 4.3, '{"WiFi","Breakfast","AC","Bike Rental"}', 'Princess Street, Fort Kochi'),
((SELECT id FROM tourist_spots WHERE name='Munnar Tea Gardens'), 'The Leaf Munnar Resort', 'Resort', 'Luxury', 12000, 4.7, '{"Mountain View","Pool","Spa","Restaurant","WiFi","Bonfire"}', 'Chinnakanal, Munnar'),
((SELECT id FROM tourist_spots WHERE name='Munnar Tea Gardens'), 'Munnar Tea County Homestay', 'Homestay', 'Budget', 2200, 4.4, '{"Tea Garden View","Breakfast","WiFi","Home Cooked Meals"}', 'Kannan Devan Hills, Munnar'),
((SELECT id FROM tourist_spots WHERE name='Munnar Tea Gardens'), 'Blanket Hotel & Spa', 'Hotel', 'Deluxe', 6500, 4.5, '{"Mountain View","Spa","Restaurant","Bar","WiFi","Gym"}', 'Surianalle, Munnar'),
((SELECT id FROM tourist_spots WHERE name='Alappuzha Backwaters'), 'Lake Palace Resort', 'Resort', 'Luxury', 15000, 4.8, '{"Houseboat","Pool","Ayurveda","Restaurant","WiFi"}', 'Punnamada, Alappuzha'),
((SELECT id FROM tourist_spots WHERE name='Alappuzha Backwaters'), 'Backwater Homestay Alleppey', 'Homestay', 'Budget', 2500, 4.5, '{"Canoe Rides","Breakfast","WiFi","Local Cuisine"}', 'Punnamada, Alappuzha'),
((SELECT id FROM tourist_spots WHERE name='Alappuzha Backwaters'), 'Punnamada Resort', 'Resort', 'Deluxe', 7000, 4.4, '{"Pool","Backwater View","Restaurant","WiFi","Ayurveda"}', 'Punnamada, Alappuzha'),
((SELECT id FROM tourist_spots WHERE name='Kovalam Beach'), 'The Leela Kovalam', 'Resort', 'Luxury', 18000, 4.7, '{"Beachfront","Pool","Spa","Restaurant","Bar","WiFi","Gym"}', 'Kovalam Beach'),
((SELECT id FROM tourist_spots WHERE name='Kovalam Beach'), 'Kovalam Beach Homestay', 'Homestay', 'Budget', 1500, 4.2, '{"Sea View","Breakfast","WiFi","AC"}', 'Lighthouse Road, Kovalam'),
((SELECT id FROM tourist_spots WHERE name='Padmanabhaswamy Temple'), 'Puthoor Hotel', 'Hotel', 'Deluxe', 4500, 4.3, '{"Temple Vicinity","Restaurant","WiFi","AC","Parking"}', 'East Fort, Thiruvananthapuram')
ON CONFLICT DO NOTHING;

-- Rajasthan accommodations
INSERT INTO accommodations (tourist_spot_id, name, type, tier, price_per_night, rating, amenities, address) VALUES
((SELECT id FROM tourist_spots WHERE name='Amber Fort'), 'Rambagh Palace', 'Hotel', 'Luxury', 35000, 4.9, '{"Heritage Palace","Pool","Spa","Restaurant","Bar","WiFi","Golf"}', 'Bhawani Singh Road, Jaipur'),
((SELECT id FROM tourist_spots WHERE name='Amber Fort'), 'Umaid Mahal Heritage Hotel', 'Hotel', 'Deluxe', 5500, 4.5, '{"Heritage","Restaurant","WiFi","AC","Rooftop Cafe"}', 'C-Scheme, Jaipur'),
((SELECT id FROM tourist_spots WHERE name='Amber Fort'), 'Jaipur Homestay Bagru', 'Homestay', 'Budget', 2000, 4.3, '{"Breakfast","WiFi","AC","Block Printing Workshop"}', 'Amer Road, Jaipur'),
((SELECT id FROM tourist_spots WHERE name='Lake Pichola'), 'Taj Lake Palace', 'Hotel', 'Luxury', 42000, 4.9, '{"Island Palace","Pool","Spa","Restaurant","Bar","WiFi","Boat Ride"}', 'Lake Pichola, Udaipur'),
((SELECT id FROM tourist_spots WHERE name='Lake Pichola'), 'Udaipur Lakeside Homestay', 'Homestay', 'Budget', 2500, 4.4, '{"Lake View","Breakfast","WiFi","Rooftop Terrace"}', 'Hanuman Ghat, Udaipur'),
((SELECT id FROM tourist_spots WHERE name='Lake Pichola'), 'Jagat Niwas Palace', 'Hotel', 'Deluxe', 8000, 4.6, '{"Lake View","Restaurant","Bar","WiFi","AC"}', 'Lal Ghat, Udaipur'),
((SELECT id FROM tourist_spots WHERE name='Jaisalmer Fort'), 'Suryagarh Palace', 'Hotel', 'Luxury', 28000, 4.8, '{"Desert Heritage","Pool","Spa","Restaurant","Bar","WiFi","Desert Safari"}', 'Sam Road, Jaisalmer'),
((SELECT id FROM tourist_spots WHERE name='Jaisalmer Fort'), 'Jaisalmer Fort Homestay', 'Homestay', 'Budget', 1800, 4.2, '{"Inside Fort","Breakfast","WiFi","Rooftop View"}', 'Fort Road, Jaisalmer'),
((SELECT id FROM tourist_spots WHERE name='Jaisalmer Fort'), 'Gorbandh Palace', 'Hotel', 'Deluxe', 6000, 4.4, '{"Pool","Restaurant","Bar","WiFi","Desert Tours"}', 'Jodhpur Road, Jaisalmer'),
((SELECT id FROM tourist_spots WHERE name='Mehrangarh Fort'), 'Umaid Bhawan Palace Jodhpur', 'Hotel', 'Luxury', 30000, 4.8, '{"Royal Palace","Pool","Spa","Restaurant","Bar","WiFi","Museum"}', 'Circuit House Road, Jodhpur'),
((SELECT id FROM tourist_spots WHERE name='Mehrangarh Fort'), 'Jodhpur Heritage Haveli', 'Hotel', 'Deluxe', 5000, 4.5, '{"Heritage","Blue City View","Restaurant","WiFi","AC"}', 'Navchokiya, Jodhpur'),
((SELECT id FROM tourist_spots WHERE name='Pushkar Lake'), 'Pushkar Palace Heritage', 'Hotel', 'Deluxe', 4500, 4.4, '{"Lake View","Heritage","Restaurant","WiFi","Garden"}', 'Pushkar Lake Road'),
((SELECT id FROM tourist_spots WHERE name='Pushkar Lake'), 'Pushkar Homestay', 'Homestay', 'Budget', 1500, 4.1, '{"Breakfast","WiFi","Rooftop","Temple Walk"}', 'Brahma Temple Road, Pushkar')
ON CONFLICT DO NOTHING;

-- Goa accommodations
INSERT INTO accommodations (tourist_spot_id, name, type, tier, price_per_night, rating, amenities, address) VALUES
((SELECT id FROM tourist_spots WHERE name='Baga Beach'), 'W Goa', 'Resort', 'Luxury', 22000, 4.7, '{"Beachfront","Pool","Spa","Restaurant","Bar","WiFi","Gym","Nightclub"}', 'Vagator, North Goa'),
((SELECT id FROM tourist_spots WHERE name='Baga Beach'), 'Baga Beach Shack Stay', 'Homestay', 'Budget', 1500, 4.0, '{"Beach View","Breakfast","WiFi","Beach Access"}', 'Baga Beach Road'),
((SELECT id FROM tourist_spots WHERE name='Baga Beach'), 'Acron Waterfront Resort', 'Hotel', 'Deluxe', 7500, 4.4, '{"Riverside","Pool","Restaurant","Bar","WiFi","Water Sports"}', 'Baga River, North Goa'),
((SELECT id FROM tourist_spots WHERE name='Palolem Beach'), 'The Lalit Golf & Spa Resort', 'Resort', 'Luxury', 25000, 4.8, '{"Beachfront","Golf","Spa","Pool","Restaurant","Bar","WiFi"}', 'Raj Bagan, Canacona'),
((SELECT id FROM tourist_spots WHERE name='Palolem Beach'), 'Palolem Beach Huts', 'Homestay', 'Budget', 1200, 4.2, '{"Beachfront","Breakfast","WiFi","Kayaking"}', 'Palolem Beach'),
((SELECT id FROM tourist_spots WHERE name='Palolem Beach'), 'Coco Goa Eco Resort', 'Resort', 'Deluxe', 6500, 4.5, '{"Eco Huts","Pool","Restaurant","WiFi","Yoga","Spa"}', 'Palolem, Canacona'),
((SELECT id FROM tourist_spots WHERE name='Dudhsagar Falls'), 'Dudhsagar Spa Resort', 'Resort', 'Deluxe', 5500, 4.3, '{"Jungle View","Pool","Spa","Restaurant","WiFi","Trekking"}', 'Mollem, South Goa')
ON CONFLICT DO NOTHING;

-- Himachal Pradesh accommodations
INSERT INTO accommodations (tourist_spot_id, name, type, tier, price_per_night, rating, amenities, address) VALUES
((SELECT id FROM tourist_spots WHERE name='The Ridge Shimla'), 'The Oberoi Wildflower Hall', 'Hotel', 'Luxury', 28000, 4.8, '{"Mountain View","Spa","Pool","Restaurant","Bar","WiFi","Gym"}', 'Chharabra, Shimla'),
((SELECT id FROM tourist_spots WHERE name='The Ridge Shimla'), 'Shimla British Home', 'Homestay', 'Budget', 2500, 4.4, '{"Heritage","Breakfast","WiFi","Fireplace","Mountain View"}', 'Mall Road, Shimla'),
((SELECT id FROM tourist_spots WHERE name='The Ridge Shimla'), 'Clarkes Hotel', 'Hotel', 'Deluxe', 7000, 4.5, '{"Heritage","Restaurant","Bar","WiFi","AC","Garden"}', 'The Mall, Shimla'),
((SELECT id FROM tourist_spots WHERE name='Solang Valley'), 'Manu Allaya Resort', 'Resort', 'Deluxe', 8000, 4.5, '{"Mountain View","Pool","Spa","Restaurant","WiFi","Bonfire"}', 'Log Huts, Manali'),
((SELECT id FROM tourist_spots WHERE name='Solang Valley'), 'Solang Valley Homestay', 'Homestay', 'Budget', 1800, 4.2, '{"Valley View","Breakfast","WiFi","Ski Rental","Home Meals"}', 'Solang Village, Manali'),
((SELECT id FROM tourist_spots WHERE name='Solang Valley'), 'The Himalayan', 'Hotel', 'Luxury', 15000, 4.7, '{"Castle Heritage","Pool","Spa","Restaurant","Bar","WiFi","Garden"}', 'Naggar Road, Manali'),
((SELECT id FROM tourist_spots WHERE name='Key Monastery'), 'Spiti Valley Homestay', 'Homestay', 'Budget', 1200, 4.5, '{"Monastery View","Breakfast","WiFi","Local Meals","Cultural Tours"}', 'Kaza, Spiti'),
((SELECT id FROM tourist_spots WHERE name='Chandra Taal Lake'), 'Chandra Taal Camp', 'Homestay', 'Budget', 2000, 4.3, '{"Lake View","Tented Stay","Meals","Bonfire","Stargazing"}', 'Chandra Taal, Spiti')
ON CONFLICT DO NOTHING;

-- Tamil Nadu accommodations
INSERT INTO accommodations (tourist_spot_id, name, type, tier, price_per_night, rating, amenities, address) VALUES
((SELECT id FROM tourist_spots WHERE name='Meenakshi Amman Temple'), 'Heritage Madurai', 'Hotel', 'Luxury', 12000, 4.7, '{"Heritage","Pool","Spa","Restaurant","Bar","WiFi","Garden"}', 'Melakkal, Madurai'),
((SELECT id FROM tourist_spots WHERE name='Meenakshi Amman Temple'), 'Madurai Temple View Homestay', 'Homestay', 'Budget', 1800, 4.3, '{"Temple View","Breakfast","WiFi","AC","Local Guide"}', 'West Chitrai Street, Madurai'),
((SELECT id FROM tourist_spots WHERE name='Meenakshi Amman Temple'), 'Taj Madurai', 'Hotel', 'Deluxe', 6500, 4.5, '{"Pool","Restaurant","Bar","WiFi","Gym","Spa"}', '94 Alagarkoil Road, Madurai'),
((SELECT id FROM tourist_spots WHERE name='Marina Beach'), 'Taj Coromandel Chennai', 'Hotel', 'Luxury', 18000, 4.8, '{"Pool","Spa","Restaurant","Bar","WiFi","Gym","Business Center"}', 'MRC Nagar, Chennai'),
((SELECT id FROM tourist_spots WHERE name='Marina Beach'), 'Marina Beach Homestay', 'Homestay', 'Budget', 1500, 4.1, '{"Beach Walk","Breakfast","WiFi","AC"}', 'Santhome, Chennai'),
((SELECT id FROM tourist_spots WHERE name='Marina Beach'), 'The Park Chennai', 'Hotel', 'Deluxe', 7000, 4.4, '{"Pool","Restaurant","Bar","WiFi","Gym","Spa"}', 'Anna Salai, Chennai'),
((SELECT id FROM tourist_spots WHERE name='Vivekananda Rock Memorial'), 'Sparsa Resort Kanniyakumari', 'Resort', 'Deluxe', 5500, 4.4, '{"Sea View","Pool","Restaurant","WiFi","AC","Garden"}', 'Kanniyakumari Beach Road'),
((SELECT id FROM tourist_spots WHERE name='Vivekananda Rock Memorial'), 'Kanniyakumari Homestay', 'Homestay', 'Budget', 1200, 4.0, '{"Sunrise View","Breakfast","WiFi","AC"}', 'Beach Road, Kanniyakumari')
ON CONFLICT DO NOTHING;
