USE Library_67;

-- задание 3
-- Проверяем исходные данные

SELECT * FROM subscribers;


-- 1. Проверка ограничения для поля sex
-- Допустимы только 'м' и 'ж'

UPDATE subscribers
SET sex = 'н'
WHERE s_name = 'Петров П.П.';


-- 2. Проверка ограничения для birthday
-- Дата рождения должна быть не позже 31.12.2013

UPDATE subscribers
SET birthday = '2014-01-01'
WHERE s_name = 'Петров П.П.';