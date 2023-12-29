use venue_review_remaster_test;

INSERT INTO VenuePhoto
    (venue_id, photo_filename, photo_description, is_primary)
VALUES
    ('b043f010284448e382d69571fae06808', 'testing1.png', 'This is a test photo, not real', true),
    ('b043f010284448e382d69571fae06808', 'testing2.png', 'This is a test photo, not real 2', false),
    ('708001fc65af4df19fcba9235c09f439', 'testing3.png', 'This is a test photo, not real 3', true);