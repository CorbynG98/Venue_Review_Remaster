use venue_review_remaster_test;

INSERT INTO Venue
    (venue_id, admin_id, category_id, venue_name, city, short_description, long_description, date_added, address,
    latitude, longitude)
VALUES
    ('8b5db9ca7d6f41e398bf551230d7fc23', 'c48a5cfd48b94ac68787a3776d6ae78d', 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1', 'The Wok', 'Christchurch', 'Home of the world-famous $2 rice', '', '2018-12-25',
        'Ground Floor, The Undercroft, University of Canterbury, University Dr, Ilam, Christchurch 8041',
        -43.523617, 172.582885),
    ('b043f010284448e382d69571fae06808', '9f0c0ea5674e485dabe8d805b16126b4', '2a239543024042259c93a25208acefa3', 'Ilam Gardens', 'Christchurch', 'Kinda pretty', '', '2019-01-01',
        '87 Ilam Rd, Ilam, Christchurch 8041, New Zealand',
        -43.524219, 172.576032),
    ('708001fc65af4df19fcba9235c09f439', 'd2758881001b4e8389baec5fa8205fa0', 'bab967cf41d04f64b05b81c2c5c7637f', 'Erskine Building', 'Christchurch', 'Many a late night has been spent here', '', '2019-01-01',
        'Erskine Science Rd, Ilam, Christchurch 8041, New Zealand',
        -43.522535, 172.581086);