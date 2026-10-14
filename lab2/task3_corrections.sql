-- Задание 3.9–3.12. Альтернативный режим коррекции.
-- Отключаем только проверки, конфликтующие с исправлением даты.
-- Проверка двух слов/точки выполняется ПОСЛЕ добавления точки (FOLLOWS).
USE Library_04;
SET NAMES utf8mb4;
DROP TRIGGER IF EXISTS lab2_check_dates_insert;
DROP TRIGGER IF EXISTS lab2_check_dates_update;
DROP TRIGGER IF EXISTS lab2_fix_reader_name;
DELIMITER //
CREATE TRIGGER lab2_fix_reader_name BEFORE INSERT ON subscribers
FOR EACH ROW 
BEGIN
    IF RIGHT(NEW.s_name,1)<>'.' THEN SET NEW.s_name=CONCAT(NEW.s_name,'.'); END IF;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_check_reader_name_insert;
DELIMITER //
CREATE TRIGGER lab2_check_reader_name_insert BEFORE INSERT ON subscribers
FOR EACH ROW FOLLOWS lab2_fix_reader_name
BEGIN
    IF NOT REGEXP_LIKE(NEW.s_name,'[^[:space:].]+[[:space:]]+[^[:space:].]+')
        OR LOCATE('.',NEW.s_name)=0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Имя читателя должно содержать два слова и точку';
    END IF;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_fix_start;
DELIMITER //
CREATE TRIGGER lab2_fix_start BEFORE INSERT ON subscriptions
FOR EACH ROW 
BEGIN
    IF NEW.sb_start<=DATE_SUB(CURDATE(),INTERVAL 6 MONTH) THEN SET NEW.sb_start=CURDATE(); END IF;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_fix_finish;
DELIMITER //
CREATE TRIGGER lab2_fix_finish BEFORE INSERT ON subscriptions
FOR EACH ROW FOLLOWS lab2_fix_start
BEGIN
    IF NEW.sb_finish<NEW.sb_start OR NEW.sb_finish<CURDATE() THEN
        SET NEW.sb_finish=DATE_ADD(NEW.sb_start,INTERVAL 2 MONTH);
    END IF;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_check_issue_rules_insert;
DELIMITER //
CREATE TRIGGER lab2_check_issue_rules_insert BEFORE INSERT ON subscriptions
FOR EACH ROW FOLLOWS lab2_fix_finish
BEGIN
    IF DAYOFWEEK(NEW.sb_start)=1 OR DAYOFWEEK(NEW.sb_finish)=1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Выдача или возврат приходится на воскресенье';
    END IF;
    IF (SELECT COUNT(*) FROM subscriptions WHERE sb_subscriber=NEW.sb_subscriber
        AND sb_start>=DATE_SUB(CURDATE(),INTERVAL 6 MONTH) AND sb_start<=CURDATE())>7 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='За последние полгода читатель брал более семи книг';
    END IF;
    IF DATEDIFF(NEW.sb_finish,NEW.sb_start)<3 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Срок выдачи меньше трёх дней';
    END IF;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS lab2_fix_book_name;
DELIMITER //
CREATE TRIGGER lab2_fix_book_name BEFORE INSERT ON books
FOR EACH ROW 
BEGIN
    SET NEW.b_name=REGEXP_REPLACE(TRIM(NEW.b_name),' {2,}',' ');
    SET NEW.b_name=CONCAT(UPPER(LEFT(NEW.b_name,1)),SUBSTRING(NEW.b_name,2));
END//
DELIMITER ;

