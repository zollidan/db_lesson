-- Задание 3.1–3.8. Строгий режим проверки.
USE Library_04;
SET NAMES utf8mb4;
-- Пункт 1.
DROP TRIGGER IF EXISTS lab2_check_dates_insert;
DELIMITER //
CREATE TRIGGER lab2_check_dates_insert BEFORE INSERT ON subscriptions
FOR EACH ROW 
BEGIN
    IF NEW.sb_start>CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Дата выдачи находится в будущем';
    END IF;
    IF NEW.sb_finish<CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Дата возврата находится в прошлом';
    END IF;
    IF NEW.sb_finish=NEW.sb_start THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Даты выдачи и возврата совпадают';
    END IF;
END//
DELIMITER ;

-- Пункт 1.
DROP TRIGGER IF EXISTS lab2_check_dates_update;
DELIMITER //
CREATE TRIGGER lab2_check_dates_update BEFORE UPDATE ON subscriptions
FOR EACH ROW 
BEGIN
    IF NEW.sb_start>CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Дата выдачи находится в будущем';
    END IF;
    IF NEW.sb_finish<CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Дата возврата находится в прошлом';
    END IF;
    IF NEW.sb_finish=NEW.sb_start THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Даты выдачи и возврата совпадают';
    END IF;
END//
DELIMITER ;

-- Пункт 2.
DROP TRIGGER IF EXISTS lab2_check_seven_insert;
DELIMITER //
CREATE TRIGGER lab2_check_seven_insert BEFORE INSERT ON subscriptions
FOR EACH ROW 
BEGIN
    IF NEW.sb_is_active='Y' AND (SELECT COUNT(*) FROM subscriptions
        WHERE sb_subscriber=NEW.sb_subscriber AND sb_is_active='Y')>=7 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='У читателя на руках семь и более книг';
    END IF;
END//
DELIMITER ;

-- Пункт 3.
DROP TRIGGER IF EXISTS lab2_check_reactivate_update;
DELIMITER //
CREATE TRIGGER lab2_check_reactivate_update BEFORE UPDATE ON subscriptions
FOR EACH ROW 
BEGIN
    IF OLD.sb_is_active='N' AND NEW.sb_is_active='Y' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Нельзя менять статус с N на Y';
    END IF;
END//
DELIMITER ;

-- Пункт 4.
DROP TRIGGER IF EXISTS lab2_check_issue_rules_insert;
DELIMITER //
CREATE TRIGGER lab2_check_issue_rules_insert BEFORE INSERT ON subscriptions
FOR EACH ROW 
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

-- Пункт 5.
DROP TRIGGER IF EXISTS lab2_check_five_insert;
DELIMITER //
CREATE TRIGGER lab2_check_five_insert BEFORE INSERT ON subscriptions
FOR EACH ROW 
BEGIN
    IF NEW.sb_is_active='Y' AND (SELECT COUNT(*) FROM subscriptions
        WHERE sb_subscriber=NEW.sb_subscriber AND sb_is_active='Y')>=5
        AND (SELECT COALESCE(SUM(GREATEST(DATEDIFF(sb_finish,CURDATE()),0)),0)
            FROM subscriptions WHERE sb_subscriber=NEW.sb_subscriber AND sb_is_active='Y')
            <DATEDIFF(DATE_ADD(CURDATE(),INTERVAL 1 MONTH),CURDATE()) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Пять и более книг, суммарный остаток срока меньше месяца';
    END IF;
END//
DELIMITER ;

-- Пункт 6.
DROP TRIGGER IF EXISTS lab2_check_reader_name_insert;
DELIMITER //
CREATE TRIGGER lab2_check_reader_name_insert BEFORE INSERT ON subscribers
FOR EACH ROW 
BEGIN
    IF NOT REGEXP_LIKE(NEW.s_name,'[^[:space:].]+[[:space:]]+[^[:space:].]+')
        OR LOCATE('.',NEW.s_name)=0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Имя читателя должно содержать два слова и точку';
    END IF;
END//
DELIMITER ;

-- Пункт 7.
DROP TRIGGER IF EXISTS lab2_check_book_year_insert;
DELIMITER //
CREATE TRIGGER lab2_check_book_year_insert BEFORE INSERT ON books
FOR EACH ROW 
BEGIN
    IF NEW.b_year<YEAR(CURDATE())-100 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Книга издана более ста лет назад';
    END IF;
END//
DELIMITER ;

-- Пункт 8.
DROP TRIGGER IF EXISTS lab2_check_author_name_insert;
DELIMITER //
CREATE TRIGGER lab2_check_author_name_insert BEFORE INSERT ON authors
FOR EACH ROW 
BEGIN
    IF NOT REGEXP_LIKE(NEW.a_name, '^[A-Za-zА-Яа-яЁё0-9 ''-]+$', 'c')
        OR LEFT(NEW.a_name,1)=' ' OR RIGHT(NEW.a_name,1)=' '
        OR LOCATE('  ',NEW.a_name)>0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Недопустимые символы или пробелы в имени автора';
    END IF;
END//
DELIMITER ;

