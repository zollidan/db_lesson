-- Задание 2 (пункты 3.1–3.5 методички).
USE Library_04;
SET NAMES utf8mb4;
-- 3.4. Повторный запуск не добавляет колонку второй раз.
DROP PROCEDURE IF EXISTS lab2_add_last_visit;
DELIMITER //
CREATE PROCEDURE lab2_add_last_visit()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema=DATABASE() AND table_name='subscribers' AND column_name='last_visit') THEN
        ALTER TABLE subscribers ADD COLUMN last_visit DATE NULL;
    END IF;
END//
DELIMITER ;
CALL lab2_add_last_visit();
DROP PROCEDURE lab2_add_last_visit;
UPDATE subscribers s SET last_visit=(SELECT MAX(sb_start) FROM subscriptions WHERE sb_subscriber=s.s_id);

-- 3.1. Каждому соавтору засчитывается выдача; статусы Y и N равноправны.
CREATE TABLE IF NOT EXISTS authors_statistics (
    a_id INT UNSIGNED PRIMARY KEY,
    name_authors VARCHAR(150) NOT NULL,
    count_books BIGINT NOT NULL DEFAULT 0
) ENGINE=InnoDB;
DELETE FROM authors_statistics;
INSERT INTO authors_statistics
SELECT a.a_id, a.a_name, COUNT(sb.sb_id)
FROM authors a LEFT JOIN m2m_books_authors m ON m.a_id=a.a_id
LEFT JOIN subscriptions sb ON sb.sb_book=m.b_id
GROUP BY a.a_id, a.a_name;

-- 3.2. Архив сохраняет все поля исходной записи, включая last_visit.
CREATE TABLE IF NOT EXISTS archive (
    s_id INT UNSIGNED PRIMARY KEY, s_name VARCHAR(150) NOT NULL,
    sex CHAR(1), birthday DATE, last_visit DATE
) ENGINE=InnoDB;

-- 3.5. Средние по ВСЕМ читателям, в том числе с нулём выдач.
-- Срок чтения считается по возвращённым книгам (N).
CREATE TABLE IF NOT EXISTS averages (
    id TINYINT PRIMARY KEY CHECK (id=1),
    avg_books_on_hands DECIMAL(18,4) NOT NULL,
    avg_reading_days DECIMAL(18,4) NOT NULL,
    avg_books_read DECIMAL(18,4) NOT NULL
) ENGINE=InnoDB;
DROP PROCEDURE IF EXISTS lab2_refresh_averages;
DELIMITER //
CREATE PROCEDURE lab2_refresh_averages()
MODIFIES SQL DATA
BEGIN
    REPLACE INTO averages
    SELECT 1,
        COALESCE(SUM(sb_is_active='Y') / NULLIF((SELECT COUNT(*) FROM subscribers),0),0),
        COALESCE(AVG(CASE WHEN sb_is_active='N' THEN DATEDIFF(sb_finish,sb_start) END),0),
        COALESCE(SUM(sb_is_active='N') / NULLIF((SELECT COUNT(*) FROM subscribers),0),0)
    FROM subscriptions;
END//
DELIMITER ;
CALL lab2_refresh_averages();

DROP TRIGGER IF EXISTS lab2_sub_cache_ai;
DELIMITER //
CREATE TRIGGER lab2_sub_cache_ai AFTER INSERT ON subscriptions
FOR EACH ROW 
BEGIN
    UPDATE authors_statistics a JOIN m2m_books_authors m ON m.a_id=a.a_id
        SET a.count_books=a.count_books+1 WHERE m.b_id=NEW.sb_book;
    UPDATE subscribers SET last_visit=(SELECT MAX(sb_start) FROM subscriptions
        WHERE sb_subscriber=NEW.sb_subscriber) WHERE s_id=NEW.sb_subscriber;
    CALL lab2_refresh_averages();
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_sub_cache_ad;
DELIMITER //
CREATE TRIGGER lab2_sub_cache_ad AFTER DELETE ON subscriptions
FOR EACH ROW 
BEGIN
    UPDATE authors_statistics a JOIN m2m_books_authors m ON m.a_id=a.a_id
        SET a.count_books=a.count_books-1 WHERE m.b_id=OLD.sb_book;
    UPDATE subscribers SET last_visit=(SELECT MAX(sb_start) FROM subscriptions
        WHERE sb_subscriber=OLD.sb_subscriber) WHERE s_id=OLD.sb_subscriber;
    CALL lab2_refresh_averages();
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_sub_cache_au;
DELIMITER //
CREATE TRIGGER lab2_sub_cache_au AFTER UPDATE ON subscriptions
FOR EACH ROW 
BEGIN
    UPDATE authors_statistics a JOIN m2m_books_authors m ON m.a_id=a.a_id
        SET a.count_books=a.count_books-1 WHERE m.b_id=OLD.sb_book;
    UPDATE authors_statistics a JOIN m2m_books_authors m ON m.a_id=a.a_id
        SET a.count_books=a.count_books+1 WHERE m.b_id=NEW.sb_book;
    UPDATE subscribers SET last_visit=(SELECT MAX(sb_start) FROM subscriptions
        WHERE sb_subscriber=OLD.sb_subscriber) WHERE s_id=OLD.sb_subscriber;
    UPDATE subscribers SET last_visit=(SELECT MAX(sb_start) FROM subscriptions
        WHERE sb_subscriber=NEW.sb_subscriber) WHERE s_id=NEW.sb_subscriber;
    CALL lab2_refresh_averages();
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_subscribers_cascade_bd;
DELIMITER //
CREATE TRIGGER lab2_subscribers_cascade_bd BEFORE DELETE ON subscribers
FOR EACH ROW 
BEGIN
    DECLARE active_count BIGINT;
    REPLACE INTO archive VALUES(OLD.s_id,OLD.s_name,OLD.sex,OLD.birthday,OLD.last_visit);
    SELECT COUNT(*) INTO active_count FROM subscriptions sb WHERE sb.sb_subscriber=OLD.s_id AND sb.sb_is_active='Y';
    UPDATE books_statistics SET given=given-active_count, rest=rest+active_count;
    UPDATE authors_statistics a JOIN (
        SELECT m.a_id, COUNT(*) cnt FROM subscriptions sb
        JOIN m2m_books_authors m ON m.b_id=sb.sb_book
        WHERE sb.sb_subscriber=OLD.s_id GROUP BY m.a_id
    ) x ON x.a_id=a.a_id SET a.count_books=a.count_books-x.cnt;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_subscribers_cache_ad;
DELIMITER //
CREATE TRIGGER lab2_subscribers_cache_ad AFTER DELETE ON subscribers
FOR EACH ROW 
BEGIN
    CALL lab2_refresh_averages();
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_books_cascade_bd;
DELIMITER //
CREATE TRIGGER lab2_books_cascade_bd BEFORE DELETE ON books
FOR EACH ROW 
BEGIN
    DECLARE active_count BIGINT;
    SELECT COUNT(*) INTO active_count FROM subscriptions sb WHERE sb.sb_book=OLD.b_id AND sb.sb_is_active='Y';
    UPDATE books_statistics SET given=given-active_count, rest=rest+active_count;
    UPDATE authors_statistics a JOIN (
        SELECT m.a_id, COUNT(*) cnt FROM subscriptions sb
        JOIN m2m_books_authors m ON m.b_id=sb.sb_book
        WHERE sb.sb_book=OLD.b_id GROUP BY m.a_id
    ) x ON x.a_id=a.a_id SET a.count_books=a.count_books-x.cnt;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_books_cache_ad;
DELIMITER //
CREATE TRIGGER lab2_books_cache_ad AFTER DELETE ON books
FOR EACH ROW 
BEGIN
    UPDATE subscribers s SET last_visit=(SELECT MAX(sb_start) FROM subscriptions WHERE sb_subscriber=s.s_id);
    CALL lab2_refresh_averages();
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_subscribers_cache_ai;
DELIMITER //
CREATE TRIGGER lab2_subscribers_cache_ai AFTER INSERT ON subscribers
FOR EACH ROW 
BEGIN
    CALL lab2_refresh_averages();
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_authors_ai;
DELIMITER //
CREATE TRIGGER lab2_authors_ai AFTER INSERT ON authors
FOR EACH ROW 
BEGIN
    INSERT INTO authors_statistics VALUES(NEW.a_id,NEW.a_name,0);
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_authors_au;
DELIMITER //
CREATE TRIGGER lab2_authors_au AFTER UPDATE ON authors
FOR EACH ROW 
BEGIN
    UPDATE authors_statistics SET name_authors=NEW.a_name WHERE a_id=NEW.a_id;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_authors_ad;
DELIMITER //
CREATE TRIGGER lab2_authors_ad AFTER DELETE ON authors
FOR EACH ROW 
BEGIN
    DELETE FROM authors_statistics WHERE a_id=OLD.a_id;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_book_author_ai;
DELIMITER //
CREATE TRIGGER lab2_book_author_ai AFTER INSERT ON m2m_books_authors
FOR EACH ROW 
BEGIN
    UPDATE authors_statistics SET count_books=count_books+(SELECT COUNT(*) FROM subscriptions WHERE sb_book=NEW.b_id)
        WHERE a_id=NEW.a_id;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_book_author_ad;
DELIMITER //
CREATE TRIGGER lab2_book_author_ad AFTER DELETE ON m2m_books_authors
FOR EACH ROW 
BEGIN
    UPDATE authors_statistics SET count_books=count_books-(SELECT COUNT(*) FROM subscriptions WHERE sb_book=OLD.b_id)
        WHERE a_id=OLD.a_id;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_book_author_au;
DELIMITER //
CREATE TRIGGER lab2_book_author_au AFTER UPDATE ON m2m_books_authors
FOR EACH ROW 
BEGIN
    UPDATE authors_statistics SET count_books=count_books-(SELECT COUNT(*) FROM subscriptions WHERE sb_book=OLD.b_id) WHERE a_id=OLD.a_id;
    UPDATE authors_statistics SET count_books=count_books+(SELECT COUNT(*) FROM subscriptions WHERE sb_book=NEW.b_id) WHERE a_id=NEW.a_id;
END//
DELIMITER ;

-- 3.3. Вызывать отдельно, вне уже открытой транзакции.
DROP PROCEDURE IF EXISTS restore_subscriber;
DELIMITER //
CREATE PROCEDURE restore_subscriber(IN p_id INT UNSIGNED)
MODIFIES SQL DATA
BEGIN
    DECLARE archived_id INT UNSIGNED DEFAULT NULL;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    START TRANSACTION;
    SELECT s_id INTO archived_id FROM archive WHERE s_id=p_id FOR UPDATE;
    IF archived_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Читатель отсутствует в архиве';
    END IF;
    INSERT INTO subscribers(s_id,s_name,sex,birthday,last_visit)
    SELECT s_id,s_name,sex,birthday,last_visit FROM archive WHERE s_id=p_id;
    DELETE FROM archive WHERE s_id=p_id;
    COMMIT;
END//
DELIMITER ;
SELECT * FROM authors_statistics ORDER BY a_id;
SELECT * FROM averages;
