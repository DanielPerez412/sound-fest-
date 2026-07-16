DROP DATABASE IF EXISTS soundfest_db;
CREATE DATABASE soundfest_db;
USE soundfest_db;

CREATE TABLE Artist (
    artist_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    biography TEXT,
    image_url VARCHAR(255)
);

CREATE TABLE Song (
    song_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    genre VARCHAR(50),
    duration_seconds INT NOT NULL,
    cover_image VARCHAR(255),
    audio_url VARCHAR(255),
    play_count INT DEFAULT 0,
    release_date DATE,
    artist_id INT NOT NULL,
    FOREIGN KEY (artist_id)
        REFERENCES Artist(artist_id)
        ON DELETE CASCADE
);

CREATE TABLE `User` (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255),
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE Playlist (
    playlist_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cover_image VARCHAR(255),
    is_public BOOLEAN DEFAULT TRUE,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id)
        REFERENCES `User`(user_id)
        ON DELETE CASCADE
);

CREATE TABLE PlaylistSong (
    playlist_id INT NOT NULL,
    song_id INT NOT NULL,
    PRIMARY KEY (playlist_id, song_id),
    FOREIGN KEY (playlist_id)
        REFERENCES Playlist(playlist_id)
        ON DELETE CASCADE,
    FOREIGN KEY (song_id)
        REFERENCES Song(song_id)
        ON DELETE CASCADE
);

CREATE TABLE SubscriptionPlan (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    audio_quality VARCHAR(30) NOT NULL,
    ads_enabled BOOLEAN NOT NULL,
    offline_downloads BOOLEAN NOT NULL
);

CREATE TABLE UserSubscription (
    user_subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status ENUM('Active','Expired','Cancelled') DEFAULT 'Active',
    FOREIGN KEY (user_id)
        REFERENCES `User`(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (plan_id)
        REFERENCES SubscriptionPlan(plan_id)
        ON DELETE CASCADE
);

CREATE TABLE FavoriteSong (
    favorite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    song_id INT NOT NULL,
    added_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES `User`(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (song_id)
        REFERENCES Song(song_id)
        ON DELETE CASCADE
);

CREATE TABLE ListeningHistory (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    song_id INT NOT NULL,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES `User`(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (song_id)
        REFERENCES Song(song_id)
        ON DELETE CASCADE
);

CREATE TABLE Album (
    album_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    release_date DATE,
    cover_image VARCHAR(255),
    artist_id INT NOT NULL,
    FOREIGN KEY (artist_id)
        REFERENCES Artist(artist_id)
        ON DELETE CASCADE
);

CREATE TABLE AlbumSong (
    album_id INT NOT NULL,
    song_id INT NOT NULL,
    PRIMARY KEY (album_id, song_id),
    FOREIGN KEY (album_id)
        REFERENCES Album(album_id)
        ON DELETE CASCADE,
    FOREIGN KEY (song_id)
        REFERENCES Song(song_id)
        ON DELETE CASCADE
);

INSERT INTO SubscriptionPlan (name, price, audio_quality, ads_enabled, offline_downloads)
VALUES
('Free', 0.00, '128 kbps', TRUE, FALSE),
('Premium Individual', 14900.00, '320 kbps', FALSE, TRUE),
('Premium Duo', 19900.00, '320 kbps', FALSE, TRUE),
('Premium Family', 24900.00, '320 kbps', FALSE, TRUE),
('Premium Student', 7900.00, '320 kbps', FALSE, TRUE);

INSERT INTO Artist (name, country, biography, image_url)
VALUES
('Luna Ray', 'Colombia', 'Synth-pop artist.', 'images/lunaray.jpg'),
('The Wandering Notes', 'United States', 'Alternative indie band.', 'images/wandering.jpg'),
('Nocturno Club', 'Spain', 'Electronic music duo.', 'images/nocturno.jpg');

INSERT INTO Song (title, genre, duration_seconds, cover_image, audio_url, release_date, artist_id)
VALUES
('Horizonte Naranja', 'Synth-pop', 214, 'covers/horizonte.jpg', 'music/horizonte.mp3', '2024-02-10', 1),
('Última Hoguera', 'Indie Rock', 187, 'covers/hoguera.jpg', 'music/hoguera.mp3', '2024-04-05', 2),
('Sistema Nocturno', 'Techno', 301, 'covers/nocturno.jpg', 'music/nocturno.mp3', '2024-05-20', 3);