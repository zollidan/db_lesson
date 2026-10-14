-- Проверки на копии Library_04. Исходные записи сохраняются.
-- Запуск из корня репозитория: mysql ... < lab2/tests.sql
SOURCE lab2/reset_corrections.sql;
DROP TRIGGER IF EXISTS Library_04.lab2_check_dates_insert;
DROP TRIGGER IF EXISTS Library_04.lab2_check_dates_update;
DROP TRIGGER IF EXISTS Library_04.lab2_check_seven_insert;
DROP TRIGGER IF EXISTS Library_04.lab2_check_reactivate_update;
DROP TRIGGER IF EXISTS Library_04.lab2_check_issue_rules_insert;
DROP TRIGGER IF EXISTS Library_04.lab2_check_five_insert;
DROP TRIGGER IF EXISTS Library_04.lab2_check_reader_name_insert;
DROP TRIGGER IF EXISTS Library_04.lab2_check_book_year_insert;
DROP TRIGGER IF EXISTS Library_04.lab2_check_author_name_insert;
SOURCE lab2/task1.sql;
SOURCE lab2/task2.sql;
SOURCE lab2/task4.sql;
USE Library_04;
DROP PROCEDURE IF EXISTS lab2_assert;
DROP PROCEDURE IF EXISTS lab2_expect_error;
DELIMITER //
CREATE PROCEDURE lab2_assert(IN ok BOOLEAN,IN label VARCHAR(128))
BEGIN
    IF ok IS NULL OR NOT ok THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT=label; END IF;
    SELECT CONCAT('PASS: ',label) AS test;
END//
CREATE PROCEDURE lab2_expect_error(IN statement_text TEXT,IN expected_text VARCHAR(128))
BEGIN
    DECLARE caught BOOLEAN DEFAULT FALSE;
    DECLARE actual_message TEXT;
    DECLARE diagnostic_count INT;
    SET @lab2_statement=statement_text;
    PREPARE lab2_statement FROM @lab2_statement;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLSTATE '45000'
        BEGIN
            SET caught=TRUE;
            GET STACKED DIAGNOSTICS diagnostic_count=NUMBER;
            GET STACKED DIAGNOSTICS CONDITION diagnostic_count actual_message=MESSAGE_TEXT;
        END;
        EXECUTE lab2_statement;
    END;
    DEALLOCATE PREPARE lab2_statement;
    CALL lab2_assert(caught AND LOCATE(expected_text,actual_message)>0,expected_text);
END//
DELIMITER ;

-- До/после и четыре варианта перехода статуса (до установки запрета N -> Y).
START TRANSACTION;
SET @base_total=(SELECT total FROM books_statistics);
SET @base_given=(SELECT given FROM books_statistics);
INSERT INTO subscribers(s_name,sex,birthday) VALUES('Тестовый Читатель.','м','2000-01-01');
SET @reader=LAST_INSERT_ID();
INSERT INTO books(b_name,b_year,b_quantity) VALUES('Тестовая книга',YEAR(CURDATE()),20);
SET @book=LAST_INSERT_ID();
INSERT INTO authors(a_name) VALUES('Тестовый Автор');
SET @author=LAST_INSERT_ID();
INSERT INTO m2m_books_authors VALUES(@book,@author);
SELECT 'До выдачи' AS stage; SELECT * FROM books_statistics; SELECT * FROM authors_statistics WHERE a_id=@author;
INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active)
VALUES(@reader,@book,CURDATE()-INTERVAL 10 DAY,CURDATE()+INTERVAL 10 DAY,'N');
SET @loan=LAST_INSERT_ID();
CALL lab2_assert((SELECT count_books=1 FROM authors_statistics WHERE a_id=@author),'Автор: INSERT, статус N');
UPDATE subscriptions SET sb_is_active='N' WHERE sb_id=@loan;
CALL lab2_assert((SELECT given=@base_given FROM books_statistics),'Статистика N -> N');
UPDATE subscriptions SET sb_is_active='Y' WHERE sb_id=@loan;
SELECT 'После N -> Y' AS stage; SELECT * FROM books_statistics;
CALL lab2_assert((SELECT given=@base_given+1 FROM books_statistics),'Статистика N -> Y');
UPDATE subscriptions SET sb_is_active='Y' WHERE sb_id=@loan;
CALL lab2_assert((SELECT given=@base_given+1 FROM books_statistics),'Статистика Y -> Y');
UPDATE subscriptions SET sb_is_active='N' WHERE sb_id=@loan;
CALL lab2_assert((SELECT given=@base_given FROM books_statistics),'Статистика Y -> N');
SELECT 'После выдачи' AS stage; SELECT * FROM books_statistics; SELECT * FROM authors_statistics WHERE a_id=@author;
CALL lab2_assert((SELECT last_visit=CURDATE()-INTERVAL 10 DAY FROM subscribers WHERE s_id=@reader),'Последний визит INSERT');
UPDATE subscriptions SET sb_start=CURDATE()-INTERVAL 3 DAY WHERE sb_id=@loan;
CALL lab2_assert((SELECT last_visit=CURDATE()-INTERVAL 3 DAY FROM subscribers WHERE s_id=@reader),'Последний визит UPDATE даты');
INSERT INTO subscribers(s_name) VALUES('Второй Читатель.'); SET @reader2=LAST_INSERT_ID();
UPDATE subscriptions SET sb_subscriber=@reader2 WHERE sb_id=@loan;
CALL lab2_assert((SELECT last_visit IS NULL FROM subscribers WHERE s_id=@reader),'Последний визит прежнего читателя');
CALL lab2_assert((SELECT last_visit=CURDATE()-INTERVAL 3 DAY FROM subscribers WHERE s_id=@reader2),'Последний визит нового читателя');
SELECT 'До смены книги' AS stage; SELECT * FROM authors_statistics ORDER BY a_id;
UPDATE subscriptions SET sb_book=1 WHERE sb_id=@loan;
SELECT 'После смены книги' AS stage; SELECT * FROM authors_statistics ORDER BY a_id;
CALL lab2_assert((SELECT count_books=0 FROM authors_statistics WHERE a_id=@author),'Автор: UPDATE книги');
UPDATE subscriptions SET sb_book=@book WHERE sb_id=@loan;
DELETE FROM subscriptions WHERE sb_id=@loan;
SELECT 'После удаления выдачи' AS stage; SELECT * FROM authors_statistics WHERE a_id=@author;
CALL lab2_assert((SELECT count_books=0 FROM authors_statistics WHERE a_id=@author),'Автор: DELETE');
CALL lab2_assert((SELECT last_visit IS NULL FROM subscribers WHERE s_id=@reader2),'Последний визит DELETE');
UPDATE books SET b_quantity=25 WHERE b_id=@book;
CALL lab2_assert((SELECT total=@base_total+25 FROM books_statistics),'Статистика UPDATE количества');
INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active)
VALUES(@reader,@book,CURDATE(),CURDATE()+INTERVAL 10 DAY,'Y');
DELETE FROM subscribers WHERE s_id=@reader;
CALL lab2_assert((SELECT COUNT(*)=1 FROM archive WHERE s_id=@reader),'Архивирование читателя');
CALL lab2_assert((SELECT given=@base_given FROM books_statistics),'Каскад удаления читателя');
CALL lab2_assert((SELECT count_books=0 FROM authors_statistics WHERE a_id=@author),'Авторы после каскада удаления читателя');
INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active)
VALUES(@reader2,@book,CURDATE(),CURDATE()+INTERVAL 10 DAY,'Y');
DELETE FROM books WHERE b_id=@book;
CALL lab2_assert((SELECT total=@base_total AND given=@base_given FROM books_statistics),'Каскад удаления книги');
CALL lab2_assert((SELECT count_books=0 FROM authors_statistics WHERE a_id=@author),'Авторы после каскада удаления книги');
CALL lab2_assert((SELECT last_visit IS NULL FROM subscribers WHERE s_id=@reader2),'Визит после каскада удаления книги');
CALL lab2_assert((SELECT avg_books_on_hands=ROUND((SELECT COUNT(*) FROM subscriptions WHERE sb_is_active='Y')/(SELECT COUNT(*) FROM subscribers),4) FROM averages),'Среднее после каскада');
ROLLBACK;

-- Процедура управляет своей транзакцией; проверяем вне START TRANSACTION.
INSERT INTO subscribers(s_name,sex,birthday) VALUES('Архивный Читатель.','ж','1990-01-01');
SET @archived=LAST_INSERT_ID();
DELETE FROM subscribers WHERE s_id=@archived;
CALL restore_subscriber(@archived);
CALL lab2_assert((SELECT COUNT(*)=1 FROM subscribers WHERE s_id=@archived AND sex='ж' AND birthday='1990-01-01'),'Восстановление всех полей');
CALL lab2_assert((SELECT COUNT(*)=0 FROM archive WHERE s_id=@archived),'Удаление из архива после восстановления');
CALL lab2_expect_error(CONCAT('CALL restore_subscriber(',@archived,')'),'Читатель отсутствует в архиве');
DELETE FROM subscribers WHERE s_id=@archived;
DELETE FROM archive WHERE s_id=@archived;

-- Фикстуры для граничных условий создаются до установки строгих правил.
INSERT INTO books(b_name,b_year,b_quantity) VALUES('Проверочная книга',YEAR(CURDATE()),100);
SET @fixture_book=LAST_INSERT_ID();
INSERT INTO subscribers(s_name) VALUES('Семь Книг.'); SET @seven=LAST_INSERT_ID();
INSERT INTO subscribers(s_name) VALUES('Пять Книг.'); SET @five=LAST_INSERT_ID();
INSERT INTO subscribers(s_name) VALUES('Восемь Возвратов.'); SET @eight=LAST_INSERT_ID();
INSERT INTO subscribers(s_name) VALUES('Десять Книг.'); SET @ten=LAST_INSERT_ID();
INSERT INTO subscribers(s_name) VALUES('Свободный Читатель.'); SET @free=LAST_INSERT_ID();
SET @start=IF(DAYOFWEEK(CURDATE())=1,CURDATE()-INTERVAL 1 DAY,CURDATE());
SET @finish=CURDATE()+INTERVAL 60 DAY;
SET @finish=DATE_ADD(@finish,INTERVAL IF(DAYOFWEEK(@finish)=1,1,0) DAY);
CREATE TEMPORARY TABLE lab2_numbers(n INT);
INSERT INTO lab2_numbers VALUES(1),(2),(3),(4),(5),(6),(7),(8),(9),(10);
INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active)
SELECT @seven,@fixture_book,@start,@finish,'Y' FROM lab2_numbers LIMIT 7;
INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active)
SELECT @five,@fixture_book,@start,CURDATE(),'Y' FROM lab2_numbers LIMIT 5;
INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active)
SELECT @eight,@fixture_book,@start,@finish,'N' FROM lab2_numbers LIMIT 8;
INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active)
SELECT @ten,@fixture_book,@start,@finish,'Y' FROM lab2_numbers LIMIT 8;
INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active)
VALUES(@ten,@fixture_book,@start,@finish,'Y'),(@ten,@fixture_book,@start,@finish,'Y');
SET @insert=CONCAT('INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active) VALUES(',@free,',',@fixture_book,',');
SOURCE lab2/task3.sql;
START TRANSACTION;
CALL lab2_expect_error(CONCAT(@insert,'CURDATE()+INTERVAL 1 DAY,@finish,\'Y\')'),'Дата выдачи находится в будущем');
CALL lab2_expect_error(CONCAT(@insert,'@start,CURDATE()-INTERVAL 1 DAY,\'Y\')'),'Дата возврата находится в прошлом');
CALL lab2_expect_error(CONCAT(@insert,'CURDATE(),CURDATE(),\'Y\')'),'Даты выдачи и возврата совпадают');
INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active) VALUES(@free,@fixture_book,@start,@finish,'Y');
SET @valid=LAST_INSERT_ID();
CALL lab2_expect_error(CONCAT('UPDATE subscriptions SET sb_start=CURDATE()+INTERVAL 1 DAY WHERE sb_id=',@valid),'Дата выдачи находится в будущем');
CALL lab2_expect_error(CONCAT('UPDATE subscriptions SET sb_finish=CURDATE()-INTERVAL 1 DAY WHERE sb_id=',@valid),'Дата возврата находится в прошлом');
CALL lab2_expect_error(CONCAT('UPDATE subscriptions SET sb_start=CURDATE(),sb_finish=CURDATE() WHERE sb_id=',@valid),'Даты выдачи и возврата совпадают');
UPDATE subscriptions SET sb_is_active='N' WHERE sb_id=@valid;
CALL lab2_expect_error(CONCAT('UPDATE subscriptions SET sb_is_active=\'Y\' WHERE sb_id=',@valid),'Нельзя менять статус с N на Y');
SET @sunday=DATE_SUB(CURDATE(),INTERVAL (DAYOFWEEK(CURDATE())-1) DAY);
CALL lab2_expect_error(CONCAT(@insert,'@sunday,@finish,\'Y\')'),'Выдача или возврат приходится на воскресенье');
SET @short_start=IF(DAYOFWEEK(CURDATE()) IN(1,7),CURDATE()-INTERVAL 1 DAY,CURDATE());
SET @short_finish=DATE_ADD(@short_start,INTERVAL IF(DAYOFWEEK(CURDATE())=1,2,1) DAY);
CALL lab2_expect_error(CONCAT(@insert,'@short_start,@short_finish,\'Y\')'),'Срок выдачи меньше трёх дней');
CALL lab2_expect_error(CONCAT('INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active) VALUES(',@seven,',',@fixture_book,',@start,@finish,\'Y\')'),'У читателя на руках семь и более книг');
CALL lab2_expect_error(CONCAT('INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active) VALUES(',@five,',',@fixture_book,',@start,@finish,\'Y\')'),'Пять и более книг');
CALL lab2_expect_error(CONCAT('INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active) VALUES(',@eight,',',@fixture_book,',@start,@finish,\'N\')'),'За последние полгода');
CALL lab2_expect_error('INSERT INTO subscribers(s_name) VALUES(\'Однослово.\')','Имя читателя');
CALL lab2_expect_error('INSERT INTO subscribers(s_name) VALUES(\'Два Слова\')','Имя читателя');
CALL lab2_expect_error('INSERT INTO books(b_name,b_year,b_quantity) VALUES(\'Старая\',YEAR(CURDATE())-101,1)','более ста лет');
INSERT INTO books(b_name,b_year,b_quantity) VALUES('Граница',YEAR(CURDATE())-100,1);
CALL lab2_expect_error('INSERT INTO authors(a_name) VALUES(\'Автор.\')','Недопустимые символы');
CALL lab2_expect_error('INSERT INTO authors(a_name) VALUES(\' Автор\')','Недопустимые символы');
CALL lab2_expect_error('INSERT INTO authors(a_name) VALUES(\'Автор \')','Недопустимые символы');
CALL lab2_expect_error('INSERT INTO authors(a_name) VALUES(\'Автор  Два\')','Недопустимые символы');
INSERT INTO authors(a_name) VALUES('Ёж O''Brien-2');
CALL lab2_assert(can_borrow_ten(@seven)=1 AND can_borrow_ten(@ten)=0,'Функция: менее десяти книг');
CALL lab2_assert(returned_books(@eight)=CAST(@fixture_book AS CHAR),'Функция: список уникальных возвращённых книг');
CALL lab2_assert(is_recent_book(@fixture_book)=1,'Функция: новая книга');
INSERT INTO books(b_name,b_year,b_quantity) VALUES('Ровно двадцать',YEAR(CURDATE())-20,1);
CALL lab2_assert(is_recent_book(LAST_INSERT_ID())=0,'Функция: граница двадцать лет');
CALL lab2_assert(check_loan_dates(CURDATE()+INTERVAL 1 DAY,@finish)=-1,'Функция дат: -1');
CALL lab2_assert(check_loan_dates(@start,CURDATE()-INTERVAL 1 DAY)=-2,'Функция дат: -2');
CALL lab2_assert(check_loan_dates(@start,@finish)=1,'Функция дат: 1');
-- -3 логически недостижим: finish<start при start<=today означает finish<today (-2).
CALL lab2_assert(check_loan_dates(CURDATE(),CURDATE()-INTERVAL 1 DAY)=-2,'Функция дат: приоритет -2 над -3');
UPDATE books_statistics SET rest=rest-3;
CALL lab2_assert(refresh_books_statistics()=3,'Функция статистики: изменение остатка');
CALL lab2_assert(refresh_books_statistics()=0,'Функция статистики: повторная актуализация');
ROLLBACK;

DROP PROCEDURE IF EXISTS lab2_test_old_date;
DELIMITER //
CREATE PROCEDURE lab2_test_old_date()
BEGIN
    IF DAYOFWEEK(CURDATE())=1 THEN
        CALL lab2_expect_error(@old_insert,'Выдача или возврат приходится на воскресенье');
    ELSE
        SET @lab2_statement=@old_insert;
        PREPARE lab2_old FROM @lab2_statement;
        EXECUTE lab2_old;
        DEALLOCATE PREPARE lab2_old;
        CALL lab2_assert((SELECT sb_start=CURDATE() FROM subscriptions WHERE sb_id=LAST_INSERT_ID()),'Коррекция: выдача полгода назад');
    END IF;
END//
DELIMITER ;
SOURCE lab2/task3_corrections.sql;
START TRANSACTION;
INSERT INTO subscribers(s_name) VALUES('Без Точки'); SET @fixed_reader=LAST_INSERT_ID();
CALL lab2_assert((SELECT s_name='Без Точки.' FROM subscribers WHERE s_id=@fixed_reader),'Коррекция: точка в имени');
INSERT INTO books(b_name,b_year,b_quantity) VALUES('  тестовая   книга  ',YEAR(CURDATE()),1);
CALL lab2_assert((SELECT b_name='Тестовая книга' FROM books WHERE b_id=LAST_INSERT_ID()),'Коррекция: название книги');
-- Выбираем дату, для которой и выдача, и возврат через два месяца не воскресные.
SET @fix_start=(SELECT MAX(DATE_SUB(CURDATE(),INTERVAL n-1 DAY)) FROM lab2_numbers
    WHERE DAYOFWEEK(DATE_SUB(CURDATE(),INTERVAL n-1 DAY))<>1
    AND DAYOFWEEK(DATE_ADD(DATE_SUB(CURDATE(),INTERVAL n-1 DAY),INTERVAL 2 MONTH))<>1);
INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active)
VALUES(@fixed_reader,@fixture_book,@fix_start,@fix_start-INTERVAL 1 DAY,'Y');
CALL lab2_assert((SELECT sb_finish=DATE_ADD(@fix_start,INTERVAL 2 MONTH) FROM subscriptions WHERE sb_id=LAST_INSERT_ID()),'Коррекция: два месяца');
-- На воскресенье пункт 4 обязан запретить даже скорректированную выдачу.
SET @old_start=DATE_SUB(CURDATE(),INTERVAL 6 MONTH);
SET @old_insert=CONCAT('INSERT INTO subscriptions(sb_subscriber,sb_book,sb_start,sb_finish,sb_is_active) VALUES(',@fixed_reader,',',@fixture_book,',@old_start,@finish,\'Y\')');
CALL lab2_test_old_date();
ROLLBACK;
DROP PROCEDURE lab2_test_old_date;

-- Удаляем фикстуры и возвращаем стандартный строгий режим.
DELETE FROM subscribers WHERE s_id IN(@seven,@five,@eight,@ten,@free);
DELETE FROM archive WHERE s_id IN(@seven,@five,@eight,@ten,@free);
DELETE FROM books WHERE b_id=@fixture_book;
DROP TEMPORARY TABLE lab2_numbers;
DROP PROCEDURE lab2_assert;
DROP PROCEDURE lab2_expect_error;
SOURCE lab2/reset_corrections.sql;
SOURCE lab2/task3.sql;
SELECT 'Проверки завершены' AS result;
