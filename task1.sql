-- Задание 1
DROP DATABASE IF EXISTS Library_67;

CREATE DATABASE Library_67
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE Library_67;


CREATE TABLE books
(
    b_id       INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    b_name     VARCHAR(150) NOT NULL,
    b_year     SMALLINT UNSIGNED NOT NULL,
    b_quantity SMALLINT UNSIGNED NOT NULL,

    CONSTRAINT PK_books
        PRIMARY KEY (b_id)
);

CREATE TABLE subscribers
(
    s_id   INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    s_name VARCHAR(150) NOT NULL,

    CONSTRAINT PK_subscribers
        PRIMARY KEY (s_id)
);

CREATE TABLE subscriptions
(
    sb_id         INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    sb_subscriber INTEGER UNSIGNED NOT NULL,
    sb_book       INTEGER UNSIGNED NOT NULL,
    sb_start      DATE NOT NULL,
    sb_finish     DATE NOT NULL,
    sb_is_active  ENUM('Y', 'N') NOT NULL,

    CONSTRAINT PK_subscriptions
        PRIMARY KEY (sb_id)
);


-- Внешний ключ subscriptions -> books

ALTER TABLE subscriptions
    ADD CONSTRAINT FK_subscriptions_books
        FOREIGN KEY (sb_book)
        REFERENCES books (b_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;


-- Внешний ключ subscriptions -> subscribers

ALTER TABLE subscriptions
    ADD CONSTRAINT FK_subscriptions_subscribers
        FOREIGN KEY (sb_subscriber)
        REFERENCES subscribers (s_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE;


-- 4. Таблица genres


CREATE TABLE genres
(
    g_id   INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    g_name VARCHAR(150) NOT NULL,

    CONSTRAINT PK_genres
        PRIMARY KEY (g_id),

    CONSTRAINT UQ_genres_name
        UNIQUE (g_name)
);



-- 5. Таблица authors


CREATE TABLE authors
(
    a_id   INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    a_name VARCHAR(150) NOT NULL,

    CONSTRAINT PK_authors
        PRIMARY KEY (a_id)
);



-- 6. Связь многие-ко-многим books <-> genres


CREATE TABLE m2m_books_genres
(
    b_id INTEGER UNSIGNED NOT NULL,
    g_id INTEGER UNSIGNED NOT NULL,

    CONSTRAINT PK_m2m_books_genres
        PRIMARY KEY (b_id, g_id),

    CONSTRAINT FK_m2m_books_genres_books
        FOREIGN KEY (b_id)
        REFERENCES books (b_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT FK_m2m_books_genres_genres
        FOREIGN KEY (g_id)
        REFERENCES genres (g_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);



-- 7. Связь многие-ко-многим books <-> authors


CREATE TABLE m2m_books_authors
(
    b_id INTEGER UNSIGNED NOT NULL,
    a_id INTEGER UNSIGNED NOT NULL,

    CONSTRAINT PK_m2m_books_authors
        PRIMARY KEY (b_id, a_id),

    CONSTRAINT FK_m2m_books_authors_books
        FOREIGN KEY (b_id)
        REFERENCES books (b_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT FK_m2m_books_authors_authors
        FOREIGN KEY (a_id)
        REFERENCES authors (a_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);



-- Добавление пола и даты рождения в subscribers


ALTER TABLE subscribers
    ADD COLUMN sex CHAR(1),
    ADD COLUMN birthday DATE;


-- Ограничение: только м или ж

ALTER TABLE subscribers
    ADD CONSTRAINT CHK_subscribers_sex
        CHECK (sex IN ('м', 'ж'));


-- Ограничение: дата рождения не позже 31.12.2013

ALTER TABLE subscribers
    ADD CONSTRAINT CHK_subscribers_birthday
        CHECK (birthday <= '2013-12-31');


SHOW TABLES;