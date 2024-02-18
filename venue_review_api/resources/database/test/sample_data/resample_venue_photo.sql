use venue_review_remaster_test;

INSERT INTO VenuePhoto
    (venue_photo_id, venue_id, photo_filename, photo_description, is_primary)
VALUES
    ('65d27cee92e3add14bdf4833', 'b043f010284448e382d69571fae06808', 'testing1.png', 'This is a test photo, not real', true),
    ('65d27cf48c727f1128557ad7', 'b043f010284448e382d69571fae06808', 'testing2.png', 'This is a test photo, not real 2', false),
    ('65d27cfa6ed9c2d4839c8b10', '708001fc65af4df19fcba9235c09f439', 'testing3.png', 'This is a test photo, not real 3', true);