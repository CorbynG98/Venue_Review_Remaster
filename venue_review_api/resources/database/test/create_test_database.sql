-- MySQL scripts for dropping existing tables and recreating the database table structure
use venue_review_remaster_test;

### DROP EVERYTHING ###
# Tables/views must be dropped in reverse order due to referential constraints (foreign keys).
DROP 
  VIEW IF EXISTS ModeCostRating;
DROP 
  VIEW IF EXISTS VenueCostRatingMaxOccurs;
DROP 
  VIEW IF EXISTS VenueCostRatingOccurs;
DROP 
  TABLE IF EXISTS Review;
DROP 
  TABLE IF EXISTS VenuePhoto;
DROP 
  TABLE IF EXISTS Venue;
DROP 
  TABLE IF EXISTS VenueCategory;
DROP 
  TABLE IF EXISTS Session;
DROP 
  TABLE IF EXISTS User;

### TABLES ###
# Tables must be created in a particular order due to referential constraints i.e. foreign keys.
CREATE TABLE User (
  user_id VARCHAR(128) NOT NULL, 
  username VARCHAR (64) NOT NULL, 
  email VARCHAR (128) NOT NULL, 
  given_name VARCHAR (128) NOT NULL, 
  family_name VARCHAR (128) NOT NULL, 
  password VARCHAR (256) NOT NULL COMMENT 'Only store the hash here, not actual password!', 
  profile_photo_filename VARCHAR (512), 
  PRIMARY KEY (user_id), 
  UNIQUE (username), 
  UNIQUE (email)
) ENGINE = InnoDB;

CREATE TABLE Session (
  session_id VARCHAR(128) NOT NULL, 
  user_id VARCHAR(128) NOT NULL, 
  token VARCHAR(128) NOT NULL, 
  created_at DATETIME NOT NULL,
  expiry DATETIME,
  PRIMARY KEY (session_id), 
  FOREIGN KEY (user_id) REFERENCES User(user_id)
) ENGINE = InnoDB;

CREATE TABLE VenueCategory (
  category_id VARCHAR(128) NOT NULL, 
  category_name VARCHAR (64) NOT NULL, 
  category_description VARCHAR (128) NOT NULL, 
  PRIMARY KEY (category_id)
) ENGINE = InnoDB;

CREATE TABLE Venue (
  venue_id VARCHAR(128) NOT NULL, 
  admin_id VARCHAR(128) NOT NULL, 
  category_id VARCHAR(128) NOT NULL, 
  venue_name VARCHAR (64) NOT NULL, 
  city VARCHAR (128) NOT NULL, 
  short_description VARCHAR (128) NOT NULL, 
  long_description VARCHAR (2048) NOT NULL, 
  date_added DATE NOT NULL, 
  address VARCHAR (256) NOT NULL, 
  latitude DOUBLE NOT NULL, 
  longitude DOUBLE NOT NULL, 
  PRIMARY KEY (venue_id), 
  FOREIGN KEY (admin_id) REFERENCES User (user_id), 
  FOREIGN KEY (category_id) REFERENCES VenueCategory (category_id)
) ENGINE = InnoDB;

CREATE TABLE VenuePhoto (
  venue_id VARCHAR(128) NOT NULL, 
  photo_filename VARCHAR(128) NOT NULL, 
  photo_description VARCHAR(128), 
  is_primary BOOLEAN NOT NULL DEFAULT false, 
  PRIMARY KEY (venue_id, photo_filename), 
  FOREIGN KEY (venue_id) REFERENCES Venue (venue_id)
) ENGINE = InnoDB;

CREATE TABLE Review (
  review_id VARCHAR(128) NOT NULL, 
  reviewed_venue_id VARCHAR(128) NOT NULL, 
  review_author_id VARCHAR(128) NOT NULL, 
  review_body VARCHAR (1024) NOT NULL, 
  star_rating TINYINT NOT NULL, 
  cost_rating TINYINT NOT NULL, 
  time_posted DATETIME NOT NULL, 
  PRIMARY KEY (review_id), 
  FOREIGN KEY (reviewed_venue_id) REFERENCES Venue (venue_id), 
  FOREIGN KEY (review_author_id) REFERENCES User (user_id)
) ENGINE = InnoDB;

### VIEWS ###
CREATE VIEW VenueCostRatingOccurs AS (
  SELECT 
    venue_id, 
    cost_rating, 
    count(1) AS occurs 
  FROM 
    Venue 
    JOIN Review ON reviewed_venue_id = venue_id 
  GROUP BY 
    venue_id, 
    cost_rating
);

CREATE VIEW VenueCostRatingMaxOccurs AS (
  SELECT 
    venue_id, 
    MAX(occurs) occurs 
  FROM 
    VenueCostRatingOccurs 
  GROUP BY 
    venue_id
);

CREATE VIEW ModeCostRating AS (
  SELECT 
    A.venue_id, 
    A.cost_rating AS mode_cost_rating, 
    A.occurs AS occurrences 
  FROM 
    VenueCostRatingOccurs A 
    INNER JOIN VenueCostRatingMaxOccurs B ON A.venue_id = B.venue_id 
    AND A.occurs = B.occurs
);

### INDEXES ###
CREATE INDEX `Session_user_id` ON `Session`(user_id);

CREATE INDEX `Review_user_id` ON `Review`(review_author_id);
CREATE INDEX `Review_venue_id` ON `Review`(reviewed_venue_id);

CREATE INDEX `VenuePhoto_venue_id` ON `VenuePhoto`(venue_id);
