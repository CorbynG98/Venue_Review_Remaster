use venue_review_remaster_test;

INSERT INTO Review
    (review_id, reviewed_venue_id, review_author_id, review_body, star_rating, cost_rating, time_posted)
VALUES
    ('a73311bd51cd4995b5a82d57a800c729', '8b5db9ca7d6f41e398bf551230d7fc23', 'f91204513a4b4a7d8d2f3d39c3698157', 'No more $2 rice, its all a lie.', 3, 4, '2019-02-20 22:05:24'),
    ('22915436a98441789c457f263810537f', '8b5db9ca7d6f41e398bf551230d7fc23', 'f91204513a4b4a7d8d2f3d39c3698157', 'Good rice for a good price.', 4, 2, '2019-02-12 18:42:01'),
    ('b96fe749330d465ba60a35664fe9804f', '708001fc65af4df19fcba9235c09f439', 'c48a5cfd48b94ac68787a3776d6ae78d', 'Had to provide our own beanbags to sleep on.', 1, 0, '2018-09-28 07:42:11'),
    ('a6faedf5dfd1473887d0a242b26f45a2', '708001fc65af4df19fcba9235c09f439', '0a918e9dcc9648c48eab1d4230afc149', 'Good air conditioning.', 5, 0, '2018-06-01 10:31:45'),
    ('d316bcd3a9e34c6aa2a973273231168e', '708001fc65af4df19fcba9235c09f439', '27f5b4207ed24eb69ba5c4f33744c139', 'My favourite place on earth.', 4, 3, '2019-01-19 12:34:59');