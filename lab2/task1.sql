-- Задание 1. Учебные примеры. Схема из lab1, MySQL 8.0.
USE Library_04;
SET NAMES utf8mb4;
DROP FUNCTION IF EXISTS loan_period;
DELIMITER //
CREATE FUNCTION loan_period(p_start DATE, p_finish DATE)
RETURNS VARCHAR(80) CHARACTER SET utf8mb4
DETERMINISTIC NO SQL
BEGIN
    DECLARE days_count INT;
    SET days_count = DATEDIFF(p_finish, p_start);
    RETURN CONCAT(days_count, ' ', CASE
        WHEN days_count < 10 THEN '[ХОРОШО]'
        WHEN days_count <= 30 THEN '[УВЕДОМЛЕНИЕ]'
        ELSE '[ПРЕДУПРЕЖДЕНИЕ]' END);
END//
DELIMITER ;

-- Одна строка, как в методичке. Знаковые поля нужны для вычитания.
CREATE TABLE IF NOT EXISTS books_statistics (
    total BIGINT NOT NULL, given BIGINT NOT NULL, rest BIGINT NOT NULL
) ENGINE=InnoDB;
DELETE FROM books_statistics;
INSERT INTO books_statistics
SELECT t.total, g.given, t.total - g.given
FROM (SELECT COALESCE(SUM(b_quantity), 0) total FROM books) t
CROSS JOIN (SELECT COUNT(*) given FROM subscriptions WHERE sb_is_active='Y') g;

DROP TRIGGER IF EXISTS lab2_books_stats_ai;
DELIMITER //
CREATE TRIGGER lab2_books_stats_ai AFTER INSERT ON books
FOR EACH ROW 
BEGIN
    UPDATE books_statistics SET total=total+NEW.b_quantity, rest=rest+NEW.b_quantity;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_books_stats_ad;
DELIMITER //
CREATE TRIGGER lab2_books_stats_ad AFTER DELETE ON books
FOR EACH ROW 
BEGIN
    UPDATE books_statistics SET total=total-OLD.b_quantity, rest=rest-OLD.b_quantity;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_books_stats_au;
DELIMITER //
CREATE TRIGGER lab2_books_stats_au AFTER UPDATE ON books
FOR EACH ROW 
BEGIN
    UPDATE books_statistics SET total=total+CAST(NEW.b_quantity AS SIGNED)-CAST(OLD.b_quantity AS SIGNED),
        rest=rest+CAST(NEW.b_quantity AS SIGNED)-CAST(OLD.b_quantity AS SIGNED);
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_sub_stats_ai;
DELIMITER //
CREATE TRIGGER lab2_sub_stats_ai AFTER INSERT ON subscriptions
FOR EACH ROW 
BEGIN
    DECLARE delta INT;
    SET delta=(NEW.sb_is_active='Y');
    UPDATE books_statistics SET given=given+delta, rest=rest-delta;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_sub_stats_ad;
DELIMITER //
CREATE TRIGGER lab2_sub_stats_ad AFTER DELETE ON subscriptions
FOR EACH ROW 
BEGIN
    DECLARE delta INT;
    SET delta=-(OLD.sb_is_active='Y');
    UPDATE books_statistics SET given=given+delta, rest=rest-delta;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_sub_stats_au;
DELIMITER //
CREATE TRIGGER lab2_sub_stats_au AFTER UPDATE ON subscriptions
FOR EACH ROW 
BEGIN
    DECLARE delta INT;
    SET delta=(NEW.sb_is_active='Y')-(OLD.sb_is_active='Y');
    UPDATE books_statistics SET given=given+delta, rest=rest-delta;
END//
DELIMITER ;

SELECT loan_period('2026-01-01','2026-01-10'),
       loan_period('2026-01-01','2026-01-11'),
       loan_period('2026-01-01','2026-01-31'),
       loan_period('2026-01-01','2026-02-01');
SELECT * FROM books_statistics;
