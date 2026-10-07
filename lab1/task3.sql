USE Library_04;

-- задание 3

SELECT * FROM subscribers;


-- 1.

UPDATE subscribers
SET sex = 'н'
WHERE s_name = 'Петров П.П.';


-- 2.

UPDATE subscribers
SET birthday = '2014-01-01'
WHERE s_name = 'Петров П.П.';