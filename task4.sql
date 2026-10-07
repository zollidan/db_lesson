USE Library_04;

-- задание 4


-- 1. Представление bibl_fond
-- Книга + автор + жанр

CREATE OR REPLACE VIEW bibl_fond AS
SELECT
    b.b_name,
    a.a_name,
    g.g_name
FROM books AS b

JOIN m2m_books_authors AS mba
    ON b.b_id = mba.b_id

JOIN authors AS a
    ON mba.a_id = a.a_id

JOIN m2m_books_genres AS mbg
    ON b.b_id = mbg.b_id

JOIN genres AS g
    ON mbg.g_id = g.g_id;


-- Проверка

SELECT *
FROM bibl_fond;


-- 2. Представление reader_books

CREATE OR REPLACE VIEW reader_books AS
SELECT
    s.s_name,
    s.s_id,
    b.b_name,
    sb.sb_start,
    sb.sb_finish
FROM subscribers AS s

JOIN subscriptions AS sb
    ON s.s_id = sb.sb_subscriber

JOIN books AS b
    ON sb.sb_book = b.b_id;


-- Проверка

SELECT *
FROM reader_books;