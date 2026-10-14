-- Задание 4. Пять хранимых функций.
USE Library_04;
SET NAMES utf8mb4;
-- 1. Изменение фактического остатка, новый остаток минус старый.
-- Нельзя вызывать из SELECT, читающего books_statistics (MySQL error 1442).
DROP FUNCTION IF EXISTS refresh_books_statistics;
DELIMITER //
CREATE FUNCTION refresh_books_statistics() RETURNS BIGINT
NOT DETERMINISTIC MODIFIES SQL DATA
BEGIN
    DECLARE old_rest BIGINT DEFAULT 0;
    DECLARE new_total BIGINT;
    DECLARE new_given BIGINT;
    SELECT COALESCE(MAX(rest),0) INTO old_rest FROM books_statistics;
    SELECT COALESCE(SUM(b_quantity),0) INTO new_total FROM books;
    SELECT COUNT(*) INTO new_given FROM subscriptions WHERE sb_is_active='Y';
    DELETE FROM books_statistics;
    INSERT INTO books_statistics VALUES(new_total,new_given,new_total-new_given);
    RETURN new_total-new_given-old_rest;
END//
DELIMITER ;

-- 2. Уникальный упорядоченный список ID возвращённых книг.
-- Курсор устраняет усечение GROUP_CONCAT значением group_concat_max_len.
DROP FUNCTION IF EXISTS returned_books;
DELIMITER //
CREATE FUNCTION returned_books(p_reader INT UNSIGNED) RETURNS LONGTEXT
NOT DETERMINISTIC READS SQL DATA
BEGIN
    DECLARE done BOOLEAN DEFAULT FALSE;
    DECLARE book_id INT UNSIGNED;
    DECLARE result LONGTEXT DEFAULT '';
    DECLARE cur CURSOR FOR SELECT DISTINCT sb_book FROM subscriptions
        WHERE sb_subscriber=p_reader AND sb_is_active='N' ORDER BY sb_book;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done=TRUE;
    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO book_id;
        IF done THEN LEAVE read_loop; END IF;
        SET result=CONCAT(result,IF(result='','',','),book_id);
    END LOOP;
    CLOSE cur;
    RETURN result;
END//
DELIMITER ;

-- 3. При нескольких нарушениях приоритет: -1, затем -2, затем -3.
-- NULL возвращает NULL: даты в исходной таблице NOT NULL.
DROP FUNCTION IF EXISTS check_loan_dates;
DELIMITER //
CREATE FUNCTION check_loan_dates(p_start DATE,p_finish DATE) RETURNS INT
NOT DETERMINISTIC NO SQL
BEGIN
    IF p_start IS NULL OR p_finish IS NULL THEN RETURN NULL; END IF;
    IF p_start>CURDATE() THEN RETURN -1; END IF;
    IF p_finish<CURDATE() THEN RETURN -2; END IF;
    IF p_finish<p_start THEN RETURN -3; END IF;
    RETURN 1;
END//
DELIMITER ;

-- 4. Для неизвестного читателя возвращаем 0.
DROP FUNCTION IF EXISTS can_borrow_ten;
DELIMITER //
CREATE FUNCTION can_borrow_ten(p_reader INT UNSIGNED) RETURNS INT
NOT DETERMINISTIC READS SQL DATA
BEGIN
    IF NOT EXISTS(SELECT 1 FROM subscribers WHERE s_id=p_reader) THEN RETURN 0; END IF;
    RETURN (SELECT COUNT(*)<10 FROM subscriptions WHERE sb_subscriber=p_reader AND sb_is_active='Y');
END//
DELIMITER ;

-- 5. Возраст определяется по году издания; ровно 20 лет -> 0.
DROP FUNCTION IF EXISTS is_recent_book;
DELIMITER //
CREATE FUNCTION is_recent_book(p_book INT UNSIGNED) RETURNS INT
NOT DETERMINISTIC READS SQL DATA
BEGIN
    RETURN COALESCE((SELECT b_year>YEAR(CURDATE())-20 AND b_year<=YEAR(CURDATE())
        FROM books WHERE b_id=p_book),0);
END//
DELIMITER ;
SELECT refresh_books_statistics();
SELECT returned_books(1),can_borrow_ten(1),is_recent_book(1);
SELECT check_loan_dates(CURDATE()+INTERVAL 1 DAY,CURDATE()+INTERVAL 10 DAY);
