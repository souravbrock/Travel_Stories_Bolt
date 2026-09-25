/*
# Seed Travel Agent Marketplace Data

Populates travel_agents and travel_packages with curated content for
demonstration of the agent marketplace feature.

## Agents
- 4 verified travel agents with ratings and contact info

## Packages
- 10 curated tour packages across Heritage, Beach, Adventure, Honeymoon,
  and Pilgrimage categories, covering Kerala, Rajasthan, Goa, Himachal,
  and Tamil Nadu.
*/

-- ============ AGENTS ============
INSERT INTO travel_agents (name, logo_url, verified, rating, description, contact_email, contact_phone) VALUES
('Wanderlust India Tours', NULL, true, 4.7, 'Award-winning travel agency specializing in curated cultural and heritage tours across India. 15+ years of experience crafting unforgettable journeys.', 'hello@wanderlustindia.com', '+91 98765 43210'),
('Royal Routes Travel', NULL, true, 4.8, 'Premium tour operator focused on luxury desert and palace experiences in Rajasthan. Featured in Conde Nast Traveller.', 'book@royalroutes.in', '+91 99887 76655'),
('Himalayan Adventures Co.', NULL, true, 4.6, 'Adventure travel specialists for trekking, skiing, and mountain expeditions in the Indian Himalayas. Certified mountain guides.', 'info@himalayanadventures.co', '+91 90123 45678'),
('Coastal Dreams Holidays', NULL, true, 4.5, 'Beach and backwater vacation experts covering Goa, Kerala, and Karnataka. All-inclusive packages with stays and activities.', 'contact@coastaldreams.in', '+91 91234 56789')
ON CONFLICT DO NOTHING;

-- ============ PACKAGES ============
INSERT INTO travel_packages (agent_id, title, slug, description, state_name, duration_days, price, inclusions, exclusions, itinerary, image_url, rating, category, max_group_size) VALUES
((SELECT id FROM travel_agents WHERE name='Wanderlust India Tours'),
'Kerala Backwaters & Hills Escape',
'kerala-backwaters-hills-escape',
'Experience the best of God''s Own Country — from serene backwater houseboats to misty tea gardens. This 6-day tour covers Fort Kochi, Munnar''s tea plantations, Alleppey houseboats, and Kovalam beach.',
'Kerala', 6, 32000,
'{"5 nights accommodation (3-star + houseboat)","Daily breakfast & dinner","Private AC vehicle for transfers","Houseboat cruise with all meals","Sightseeing as per itinerary","English-speaking guide","All tolls, parking, fuel"}',
'{"Airfare","Lunch","Personal expenses","Travel insurance","Ayurveda treatments","Entry tickets to monuments"}',
'{"Day 1: Arrive Kochi — Fort Kochi & Marine Drive sightseeing","Day 2: Kochi to Munnar — tea gardens & Eravikulam National Park","Day 3: Munnar local — Mattupetty Dam, Echo Point, Spice Plantation","Day 4: Munnar to Alleppey — board houseboat, backwater cruise","Day 5: Alleppey to Kovalam — beach visit & lighthouse","Day 6: Kovalam to Trivandrum — Padmanabhaswamy Temple, departure"}',
'https://images.pexels.com/photos/36998153/pexels-photo-36998153.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
4.7, 'Heritage', 12),

((SELECT id FROM travel_agents WHERE name='Royal Routes Travel'),
'Royal Rajasthan Heritage Tour',
'royal-rajasthan-heritage-tour',
'A majestic 8-day journey through the Land of Kings. Explore the Pink City of Jaipur, the Blue City of Jodhpur, the Golden Fort of Jaisalmer, and the romantic lakes of Udaipur. Stay in heritage hotels and palaces.',
'Rajasthan', 8, 55000,
'{"7 nights heritage hotel accommodation","Daily breakfast & dinner","Private AC SUV (Innova)","Camel safari in Jaisalmer","Boat ride at Lake Pichola","English-speaking guide","All monument entry tickets","Cultural evening in Jaipur"}',
'{"Airfare or train tickets","Lunch","Personal expenses","Travel insurance","Alcoholic beverages","Tips"}',
'{"Day 1: Arrive Jaipur — Amber Fort, Hawa Mahal, City Palace","Day 2: Jaipur to Jodhpur — Mehrangarh Fort, Umaid Bhawan","Day 3: Jodhpur to Jaisalmer — evening at Sam Sand Dunes","Day 4: Jaisalmer — Jaisalmer Fort, Patwon ki Haveli, camel safari","Day 5: Jaisalmer to Udaipur — en route Ranakpur Jain Temple","Day 6: Udaipur — City Palace, Lake Pichola boat ride","Day 7: Udaipur — Jagdish Temple, Saheliyon ki Bari, local markets","Day 8: Udaipur departure"}',
'https://images.pexels.com/photos/30573733/pexels-photo-30573733.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
4.8, 'Heritage', 10),

((SELECT id FROM travel_agents WHERE name='Royal Routes Travel'),
'Pushkar & Ajmer Spiritual Retreat',
'pushkar-ajmar-spiritual-retreat',
'A soul-stirring 3-day pilgrimage to the sacred town of Pushkar. Visit the Brahma Temple, holy Pushkar Lake, and experience the spiritual essence of Rajasthan.',
'Rajasthan', 3, 12000,
'{"2 nights heritage hotel","Daily breakfast","Private AC vehicle","Pushkar Lake aarti experience","Guide for temple visits","All tolls and parking"}',
'{"Airfare or train tickets","Lunch and dinner","Personal expenses","Travel insurance","Shopping"}',
'{"Day 1: Arrive Pushkar — evening aarti at Pushkar Lake","Day 2: Brahma Temple, Savitri Mata Temple (cable car), local markets","Day 3: Ajmer Sharif Dargah visit, departure"}',
'https://images.pexels.com/photos/32261806/pexels-photo-32261806.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
4.5, 'Pilgrimage', 15),

((SELECT id FROM travel_agents WHERE name='Himalayan Adventures Co.'),
'Spiti Valley Expedition',
'spiti-valley-expedition',
'An adrenaline-pumping 7-day expedition to the remote trans-Himalayan valley of Spiti. Visit ancient monasteries, high-altitude lakes, and experience raw mountain beauty. Includes acclimatization days.',
'Himachal Pradesh', 7, 38000,
'{"6 nights homestay & camp accommodation","All meals (vegetarian)","Private 4x4 vehicle","Key Monastery visit","Chandra Taal Lake excursion","Certified mountain guide","First aid & oxygen support","Permits and fees"}',
'{"Airfare or bus to Manali","Personal trekking gear","Travel insurance","Alcoholic beverages","Emergency evacuation","Photography fees"}',
'{"Day 1: Manali to Kaza via Rohtang Pass & Kunzum La","Day 2: Kaza — Key Monastery & Kibber village","Day 3: Kaza to Chandratal Lake — camp overnight","Day 4: Chandratal to Kaza — rest & acclimatization","Day 5: Kaza to Tabo — Tabo Monastery (1,000 years old)","Day 6: Tabo to Nako — Nako Lake & village","Day 7: Nako to Manali via Kinnaur valley"}',
'https://images.pexels.com/photos/37911658/pexels-photo-37911658.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
4.6, 'Adventure', 8),

((SELECT id FROM travel_agents WHERE name='Himalayan Adventures Co.'),
'Shimla & Manali Honeymoon Package',
'shimla-manali-honeymoon',
'A romantic 6-day getaway to the Himalayan hill stations of Shimla and Manali. Enjoy snow-capped peaks, colonial charm, cozy evenings by the bonfire, and breathtaking mountain vistas.',
'Himachal Pradesh', 6, 28000,
'{"5 nights 3-star hotel (deluxe room)","Daily breakfast & dinner","Private AC vehicle","Solang Valley excursion","Hadimba Temple visit","Kalka-Shimla toy train ride","Bonfire evening in Manali","Welcome drink on arrival"}',
'{"Airfare","Lunch","Personal expenses","Travel insurance","Skiing or paragliding charges","Snow clothing rental"}',
'{"Day 1: Arrive Shimla — Mall Road & Ridge","Day 2: Kalka-Shimla toy train, Jakhoo Temple","Day 3: Shimla to Manali — en route Kullu valley","Day 4: Manali — Hadimba Temple, Old Manali, Vashisht hot springs","Day 5: Solang Valley — snow activities & adventure sports","Day 6: Manali departure"}',
'https://images.pexels.com/photos/29494184/pexels-photo-29494184.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
4.5, 'Honeymoon', 6),

((SELECT id FROM travel_agents WHERE name='Coastal Dreams Holidays'),
'Goa Beach Bliss Package',
'goa-beach-bliss-package',
'Unwind on the golden sands of Goa with this 4-day beach vacation. Cover North Goa''s vibrant beaches, historic Portuguese landmarks, and South Goa''s serene shores. Perfect for couples and families.',
'Goa', 4, 18000,
'{"3 nights beachfront resort","Daily breakfast","Private AC vehicle for transfers","Dudhsagar Falls trip","Fort Aguada visit","River cruise with dinner","All tolls and parking"}',
'{"Airfare","Lunch & dinner (except river cruise)","Water sports activities","Personal expenses","Travel insurance","Nightclub entry"}',
'{"Day 1: Arrive Goa — check-in, Baga Beach evening","Day 2: North Goa — Fort Aguada, Anjuna flea market, Calangute","Day 3: South Goa — Palolem Beach, Dudhsagar Falls","Day 4: Old Goa churches, Mandovi river cruise, departure"}',
'https://images.pexels.com/photos/28159570/pexels-photo-28159570.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
4.4, 'Beach', 15),

((SELECT id FROM travel_agents WHERE name='Wanderlust India Tours'),
'Tamil Nadu Temple Trail',
'tamil-nadu-temple-trail',
'A spiritual and cultural 5-day journey through Tamil Nadu''s greatest temples. From the Meenakshi Temple in Madurai to the shore temples of Mahabalipuram, discover 1,500 years of Dravidian architecture.',
'Tamil Nadu', 5, 25000,
'{"4 nights 3-star hotel","Daily breakfast & dinner","Private AC vehicle","All temple entry fees","English-speaking guide","Marina Beach walk","Classical dance performance"}',
'{"Airfare or train tickets","Lunch","Personal expenses","Travel insurance","Shopping","Photography fees at temples"}',
'{"Day 1: Arrive Chennai — Marina Beach, Kapaleeshwarar Temple","Day 2: Chennai to Mahabalipuram — Shore Temple, Arjuna''s Penance","Day 3: Mahabalipuram to Kanchipuram — Ekambareswarar & Kailasanathar Temples","Day 4: Kanchipuram to Madurai — Meenakshi Temple, Thirumalai Nayakkar Palace","Day 5: Madurai to Kanniyakumari — Vivekananda Rock, sunset at three seas"}',
'https://images.pexels.com/photos/6667281/pexels-photo-6667281.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
4.7, 'Pilgrimage', 12),

((SELECT id FROM travel_agents WHERE name='Coastal Dreams Holidays'),
'Kerala Houseboat Romance',
'kerala-houseboat-romance',
'A intimate 4-day escape for couples through Kerala''s backwaters. Private houseboat stay, candlelight dinner on the deck, Ayurvedic spa, and sunset at Kovalam beach.',
'Kerala', 4, 22000,
'{"1 night private houseboat with all meals","2 nights beachfront resort","Daily breakfast (except houseboat)","Private AC vehicle","Candlelight dinner on houseboat","Ayurvedic massage session","Sunset at Kovalam Beach"}',
'{"Airfare","Lunch on non-houseboat days","Personal expenses","Travel insurance","Extra Ayurveda treatments","Alcoholic beverages"}',
'{"Day 1: Arrive Kochi — transfer to Alleppey, board houseboat","Day 2: Houseboat cruise — disembark, drive to Kovalam","Day 3: Kovalam — beach, lighthouse, Ayurvedic spa","Day 4: Trivandrum sightseeing, departure"}',
'https://images.pexels.com/photos/32518360/pexels-photo-32518360.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
4.6, 'Honeymoon', 4),

((SELECT id FROM travel_agents WHERE name='Royal Routes Travel'),
'Jaisalmer Desert Adventure',
'jaisalmer-desert-adventure',
'A thrilling 4-day desert adventure in the Golden City. Camel safaris, overnight desert camps under the stars, and exploration of the living Jaisalmer Fort.',
'Rajasthan', 4, 16000,
'{"1 night heritage hotel, 1 night desert camp","Daily breakfast & dinner","Private AC vehicle","Camel safari to Sam Dunes","Overnight desert camp with cultural program","Jaisalmer Fort guided tour","All entry tickets"}',
'{"Airfare or train tickets","Lunch","Personal expenses","Travel insurance","Desert quad biking","Alcoholic beverages"}',
'{"Day 1: Arrive Jaisalmer — Fort, Patwon ki Haveli, Gadisar Lake","Day 2: Jaisalmer to Sam — camel safari, desert camp, folk music","Day 3: Desert sunrise, return to Jaisalmer — local markets, Jain temples","Day 4: Bada Bagh, Vyas Chhatri, departure"}',
'https://images.pexels.com/photos/9497619/pexels-photo-9497619.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
4.5, 'Adventure', 10),

((SELECT id FROM travel_agents WHERE name='Wanderlust India Tours'),
'Goa & Karnataka Coastal Discovery',
'goa-karnataka-coastal-discovery',
'A 7-day coastal journey from Goa''s beaches to Karnataka''s heritage sites. Explore Portuguese churches, Dudhsagar Falls, Hampi ruins, and Gokarna''s pristine beaches.',
'Goa', 7, 35000,
'{"6 nights accommodation (3-star)","Daily breakfast","Private AC vehicle","Dudhsagar Falls trip","Hampi guided tour","All monument entries","River cruise in Goa"}',
'{"Airfare","Lunch & dinner","Personal expenses","Travel insurance","Water sports","Alcoholic beverages"}',
'{"Day 1: Arrive Goa — Baga & Calangute beaches","Day 2: Old Goa churches, Fort Aguada, Anjuna market","Day 3: Dudhsagar Falls, drive to Gokarna","Day 4: Gokarna beaches — Om Beach, Kudle Beach","Day 5: Gokarna to Hampi — Virupaksha Temple","Day 6: Hampi ruins — Vittala Temple, Lotus Mahal, Elephant Stables","Day 7: Hampi to Goa, departure"}',
'https://images.pexels.com/photos/8037061/pexels-photo-8037061.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
4.3, 'Beach', 12)
ON CONFLICT DO NOTHING;
