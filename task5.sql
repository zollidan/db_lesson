USE Library_04;

-- ЗАДАНИЕ 5
-- Написание команд SELECT для поиска информации


-- 1.
-- Показать по каждой книге, которую читатели брали
-- в библиотеке, количество выдач.

SELECT
    b.b_name,
    COUNT(sb.sb_id) AS books_taken
FROM books b
JOIN subscriptions sb
    ON b.b_id = sb.sb_book
GROUP BY b.b_id, b.b_name;


-- 2.
-- Сколько всего разных книг зарегистрировано в библиотеке.
-- Книга рассматривается как издание, а не экземпляр.
-- Ожидаемый результат: 7

SELECT
    COUNT(*) AS total_books
FROM books;


-- 3.
-- Сумма, минимум, максимум и среднее количество экземпляров.
-- Ожидаемый результат:
-- 33 | 1 | 12 | 4.7143

SELECT
    SUM(b_quantity) AS `sum`,
    MIN(b_quantity) AS `min`,
    MAX(b_quantity) AS `max`,
    AVG(b_quantity) AS `avg`
FROM books;


-- 4.
-- Сколько книг сейчас находится на руках у каждого читателя.
-- Учитываем только sb_is_active = 'Y'.

SELECT
    s.s_id,
    s.s_name,
    COUNT(sb.sb_book) AS `Выдано книг`
FROM subscribers s
JOIN subscriptions sb
    ON s.s_id = sb.sb_subscriber
WHERE sb.sb_is_active = 'Y'
GROUP BY s.s_id, s.s_name;


-- 5.
-- Идентификаторы и даты выдачи книг за лето 2012 года.

SELECT
    sb_id,
    sb_start
FROM subscriptions
WHERE sb_start BETWEEN '2012-06-01' AND '2012-08-31';


-- 6.
-- Книги, количество экземпляров которых меньше
-- среднего по библиотеке.

SELECT
    b_id,
    b_name,
    b_quantity
FROM books
WHERE b_quantity < (
    SELECT AVG(b_quantity)
    FROM books
);


-- 7.
-- Выдачи за первый год работы библиотеки.

SELECT
    sb_id,
    sb_start
FROM subscriptions
WHERE YEAR(sb_start) = (
    SELECT YEAR(MIN(sb_start))
    FROM subscriptions
);


-- 8.
-- Книги с максимальным количеством экземпляров.
-- Используем подзапрос.

SELECT
    b_id,
    b_name,
    b_quantity
FROM books
WHERE b_quantity = (
    SELECT MAX(b_quantity)
    FROM books
);


-- 9.
-- Читатели, когда-либо бравшие книги.
-- JOIN использовать нельзя.
-- Используем IN.

SELECT
    s_id,
    s_name
FROM subscribers
WHERE s_id IN (
    SELECT sb_subscriber
    FROM subscriptions
);


-- 10.
-- Книги жанров "Программирование" и/или "Классика".
-- JOIN использовать нельзя.
-- ID жанров заранее неизвестны.

SELECT
    b_id,
    b_name
FROM books
WHERE b_id IN (
    SELECT b_id
    FROM m2m_books_genres
    WHERE g_id IN (
        SELECT g_id
        FROM genres
        WHERE g_name IN ('Программирование', 'Классика')
    )
);


-- 11.
-- То же самое, но с использованием JOIN.

SELECT DISTINCT
    b.b_id,
    b.b_name
FROM books b
JOIN m2m_books_genres mbg
    ON b.b_id = mbg.b_id
JOIN genres g
    ON mbg.g_id = g.g_id
WHERE g.g_name IN ('Программирование', 'Классика');


-- 12.
-- Среднее количество дней, на которое читатели берут книги.
-- Только возвращённые книги.
-- Ожидаемый результат: 46.0000

SELECT
    AVG(DATEDIFF(sb_finish, sb_start)) AS period
FROM subscriptions
WHERE sb_is_active = 'N';


-- 13.
-- Сколько раз читатели брали книги по каждому году.

SELECT
    YEAR(sb_start) AS `year`,
    COUNT(*) AS `books taken`
FROM subscriptions
GROUP BY YEAR(sb_start)
ORDER BY `year`;


-- 14.
-- Авторы, написавшие более одной книги.

SELECT
    a.a_name
FROM authors a
JOIN m2m_books_authors mba
    ON a.a_id = mba.a_id
GROUP BY a.a_id, a.a_name
HAVING COUNT(mba.b_id) > 1;


-- 15.
-- Сколько экземпляров каждой книги сейчас выдано.

SELECT
    b.b_name,
    COUNT(sb.sb_id) AS issued_now
FROM books b
JOIN subscriptions sb
    ON b.b_id = sb.sb_book
WHERE sb.sb_is_active = 'Y'
GROUP BY b.b_id, b.b_name;


-- 16.
-- Читатели, никогда не бравшие книги.
-- JOIN использовать нельзя.
-- Используем NOT IN.

SELECT
    s_id,
    s_name
FROM subscribers
WHERE s_id NOT IN (
    SELECT sb_subscriber
    FROM subscriptions
);


-- 17.
-- Книги, написанные Карнеги и Страуструпом в соавторстве.

SELECT
    b.b_name
FROM books b
JOIN m2m_books_authors mba
    ON b.b_id = mba.b_id
JOIN authors a
    ON mba.a_id = a.a_id
WHERE a.a_name IN ('Д. Карнеги', 'Б. Страуструп')
GROUP BY b.b_id, b.b_name
HAVING COUNT(DISTINCT a.a_name) = 2;


-- 18.
-- Читатель, первым взявший книгу.

SELECT DISTINCT
    s.s_id,
    s.s_name,
    sb.sb_start
FROM subscribers s
JOIN subscriptions sb
    ON s.s_id = sb.sb_subscriber
WHERE sb.sb_start = (
    SELECT MIN(sb_start)
    FROM subscriptions
);


-- 19.
-- Самые читающие читатели:
-- взяли максимальное количество книг.

SELECT
    s.s_id,
    s.s_name
FROM subscribers s
JOIN subscriptions sb
    ON s.s_id = sb.sb_subscriber
GROUP BY s.s_id, s.s_name
HAVING COUNT(*) = (
    SELECT MAX(book_count)
    FROM (
        SELECT
            COUNT(*) AS book_count
        FROM subscriptions
        GROUP BY sb_subscriber
    ) AS counts
);


-- 20.
-- Книги, относящиеся ровно к одному жанру.

SELECT
    b.b_name,
    COUNT(mbg.g_id) AS kol
FROM books b
JOIN m2m_books_genres mbg
    ON b.b_id = mbg.b_id
GROUP BY b.b_id, b.b_name
HAVING COUNT(mbg.g_id) = 1;


-- 21.
-- Авторы, суммарное количество экземпляров книг
-- которых больше 5.

SELECT
    a.a_name,
    SUM(b.b_quantity) AS `Экземпляров книг автора`
FROM authors a
JOIN m2m_books_authors mba
    ON a.a_id = mba.a_id
JOIN books b
    ON mba.b_id = b.b_id
GROUP BY a.a_id, a.a_name
HAVING SUM(b.b_quantity) > 5;


-- 22.
-- Читаемость авторов:
-- сколько раз книги каждого автора брали читатели.

SELECT
    a.a_name,
    COUNT(sb.sb_id) AS `Выдавалось книг`
FROM authors a
LEFT JOIN m2m_books_authors mba
    ON a.a_id = mba.a_id
LEFT JOIN subscriptions sb
    ON mba.b_id = sb.sb_book
GROUP BY a.a_id, a.a_name
ORDER BY `Выдавалось книг` DESC;


-- 23.
-- Самый читаемый автор (или несколько авторов).

SELECT
    author_stats.a_name,
    author_stats.qbooks
FROM (
    SELECT
        a.a_id,
        a.a_name,
        COUNT(sb.sb_id) AS qbooks
    FROM authors a
    LEFT JOIN m2m_books_authors mba
        ON a.a_id = mba.a_id
    LEFT JOIN subscriptions sb
        ON mba.b_id = sb.sb_book
    GROUP BY a.a_id, a.a_name
) AS author_stats
WHERE author_stats.qbooks = (
    SELECT MAX(qbooks)
    FROM (
        SELECT
            a.a_id,
            COUNT(sb.sb_id) AS qbooks
        FROM authors a
        LEFT JOIN m2m_books_authors mba
            ON a.a_id = mba.a_id
        LEFT JOIN subscriptions sb
            ON mba.b_id = sb.sb_book
        GROUP BY a.a_id
    ) AS author_counts
);


-- 24.
-- Средняя читаемость жанров.
-- Ожидаемый результат по методичке: 3.6

SELECT
    AVG(genre_stats.qbooks) AS `Средняя читаемость жанров`
FROM (
    SELECT
        g.g_id,
        COUNT(sb.sb_id) AS qbooks
    FROM genres g
    JOIN m2m_books_genres mbg
        ON g.g_id = mbg.g_id
    JOIN subscriptions sb
        ON mbg.b_id = sb.sb_book
    GROUP BY g.g_id
) AS genre_stats;


-- 25.
-- Авторы, написавшие хотя бы одну книгу,
-- одновременно относящуюся к двум и более жанрам.

SELECT DISTINCT
    a.a_name
FROM authors a
JOIN m2m_books_authors mba
    ON a.a_id = mba.a_id
WHERE mba.b_id IN (
    SELECT b_id
    FROM m2m_books_genres
    GROUP BY b_id
    HAVING COUNT(g_id) >= 2
);


-- 26.
-- Авторы, работавшие в двух и более жанрах.

SELECT
    a.a_name,
    COUNT(DISTINCT mbg.g_id) AS `Число жанров`
FROM authors a
JOIN m2m_books_authors mba
    ON a.a_id = mba.a_id
JOIN m2m_books_genres mbg
    ON mba.b_id = mbg.b_id
GROUP BY a.a_id, a.a_name
HAVING COUNT(DISTINCT mbg.g_id) >= 2;


-- 27.
-- Читатели, бравшие самые разножанровые книги.

SELECT DISTINCT
    s.s_id,
    s.s_name
FROM subscribers s
JOIN subscriptions sb
    ON s.s_id = sb.sb_subscriber
WHERE sb.sb_book IN (
    SELECT b_id
    FROM m2m_books_genres
    GROUP BY b_id
    HAVING COUNT(g_id) = (
        SELECT MAX(genre_count)
        FROM (
            SELECT
                COUNT(g_id) AS genre_count
            FROM m2m_books_genres
            GROUP BY b_id
        ) AS genre_counts
    )
);


-- 28.
-- Читатели, быстрее всего прочитавшие книгу.
-- Только возвращённые книги.

SELECT
    s.s_id,
    s.s_name,
    DATEDIFF(sb.sb_finish, sb.sb_start)
        AS `Длительность выдачи (дней)`
FROM subscribers s
JOIN subscriptions sb
    ON s.s_id = sb.sb_subscriber
WHERE sb.sb_is_active = 'N'
  AND DATEDIFF(sb.sb_finish, sb.sb_start) = (
        SELECT MIN(DATEDIFF(sb_finish, sb_start))
        FROM subscriptions
        WHERE sb_is_active = 'N'
    );


-- 29.
-- Читатели, никогда не бравшие книги.
-- Теперь обязательно через LEFT JOIN.

SELECT
    s.s_id,
    s.s_name,
    sb.sb_start
FROM subscribers s
LEFT JOIN subscriptions sb
    ON s.s_id = sb.sb_subscriber
WHERE sb.sb_subscriber IS NULL;


-- 30.
-- Книги, которые никто никогда не брал.

SELECT
    sb.sb_subscriber,
    b.b_name
FROM books b
LEFT JOIN subscriptions sb
    ON b.b_id = sb.sb_book
WHERE sb.sb_book IS NULL;


-- 31.
-- Все книги, которые в принципе может взять каждый читатель.
-- Декартово произведение.

SELECT
    s.s_id,
    s.s_name,
    b.b_name
FROM subscribers s
CROSS JOIN books b;


-- 32.
-- Книги, которые каждый читатель ещё не брал.
-- По условию методички используем два табличных
-- подзапроса в FROM и LEFT JOIN.

SELECT
    inter1.s_id,
    inter1.s_name,
    inter1.b_name AS `Непрочитанные книги`
FROM (
    SELECT
        s.s_id,
        s.s_name,
        b.b_name
    FROM subscribers s
    CROSS JOIN books b
) AS inter1

LEFT JOIN (
    SELECT
        s.s_id,
        s.s_name,
        b.b_name
    FROM subscribers s
    JOIN subscriptions sb
        ON s.s_id = sb.sb_subscriber
    JOIN books b
        ON sb.sb_book = b.b_id
) AS inter2

    ON inter1.s_id = inter2.s_id
   AND inter1.b_name = inter2.b_name

WHERE inter2.b_name IS NULL;


-- 33.
-- Книга (или книги), которую читатель взял
-- в первый день своей работы с библиотекой.
-- Два табличных подзапроса в FROM.

SELECT
    inter1.s_id,
    inter1.s_name,
    inter2.b_name,
    inter2.sb_start
FROM (
    SELECT
        s.s_id,
        s.s_name,
        MIN(sb.sb_start) AS min_date
    FROM subscribers s
    JOIN subscriptions sb
        ON s.s_id = sb.sb_subscriber
    GROUP BY s.s_id, s.s_name
) AS inter1

INNER JOIN (
    SELECT
        s.s_id,
        s.s_name,
        sb.sb_start,
        b.b_name
    FROM subscribers s
    JOIN subscriptions sb
        ON s.s_id = sb.sb_subscriber
    JOIN books b
        ON sb.sb_book = b.b_id
) AS inter2

    ON inter1.s_id = inter2.s_id
   AND inter2.sb_start = inter1.min_date;


-- 34.
-- Книга, количество экземпляров которой больше,
-- чем у любой другой книги.
-- Коррелированный подзапрос + ALL.

SELECT
    ext.b_id,
    ext.b_name,
    ext.b_quantity
FROM books ext
WHERE ext.b_quantity > ALL (
    SELECT inter.b_quantity
    FROM books inter
    WHERE ext.b_id <> inter.b_id
);


-- 35.
-- Читатель-рекордсмен:
-- взял больше книг, чем любой другой читатель.
-- Коррелированный подзапрос.

SELECT
    ext.s_id,
    ext.s_name,
    ext.book_count AS `Число книг`
FROM (
    SELECT
        s.s_id,
        s.s_name,
        COUNT(sb.sb_id) AS book_count
    FROM subscribers s
    JOIN subscriptions sb
        ON s.s_id = sb.sb_subscriber
    GROUP BY s.s_id, s.s_name
) AS ext

WHERE ext.book_count > ALL (
    SELECT inter.book_count
    FROM (
        SELECT
            s.s_id,
            s.s_name,
            COUNT(sb.sb_id) AS book_count
        FROM subscribers s
        JOIN subscriptions sb
            ON s.s_id = sb.sb_subscriber
        GROUP BY s.s_id, s.s_name
    ) AS inter
    WHERE ext.s_id <> inter.s_id
);


-- 36.
-- Сколько книг возвращено и не возвращено.
-- Y -> Не возвращено
-- N -> Возвращено

SELECT
    CASE sb_is_active
        WHEN 'Y' THEN 'Не возвращено'
        WHEN 'N' THEN 'Возвращено'
    END AS `Статус`,
    COUNT(sb_book) AS `Число книг`
FROM subscriptions
GROUP BY
    CASE sb_is_active
        WHEN 'Y' THEN 'Не возвращено'
        WHEN 'N' THEN 'Возвращено'
    END;


-- 37.
-- Все книги и их авторы.
-- Название книги не должно дублироваться.
-- GROUP_CONCAT.

SELECT
    b.b_name AS `Книга`,
    GROUP_CONCAT(
        a.a_name
        SEPARATOR ', '
    ) AS `Авторы`
FROM books b
JOIN m2m_books_authors mba
    ON b.b_id = mba.b_id
JOIN authors a
    ON mba.a_id = a.a_id
GROUP BY b.b_id, b.b_name;


-- 38.
-- Все авторы, их книги и жанры.
-- Дублирование исключаем при помощи DISTINCT.

SELECT
    a.a_name AS `Автор`,

    GROUP_CONCAT(
        DISTINCT b.b_name
        ORDER BY b.b_name
        SEPARATOR ', '
    ) AS `Книги`,

    GROUP_CONCAT(
        DISTINCT g.g_name
        ORDER BY g.g_name
        SEPARATOR ', '
    ) AS `Жанры`

FROM authors a

JOIN m2m_books_authors mba
    ON a.a_id = mba.a_id

JOIN books b
    ON mba.b_id = b.b_id

JOIN m2m_books_genres mbg
    ON b.b_id = mbg.b_id

JOIN genres g
    ON mbg.g_id = g.g_id

GROUP BY a.a_id, a.a_name;


-- 39.
-- Какие книги каждый читатель взял
-- в первый день работы с библиотекой.
-- Имена читателей не дублируются благодаря GROUP_CONCAT.

SELECT
    inter1.s_id,
    inter1.s_name,

    GROUP_CONCAT(
        inter2.b_name
        ORDER BY inter2.b_name
        SEPARATOR ', '
    ) AS `Список книг`

FROM (
    SELECT
        s.s_id,
        s.s_name,
        MIN(sb.sb_start) AS min_date
    FROM subscribers s
    JOIN subscriptions sb
        ON s.s_id = sb.sb_subscriber
    GROUP BY s.s_id, s.s_name
) AS inter1

INNER JOIN (
    SELECT
        s.s_id,
        sb.sb_start,
        b.b_name
    FROM subscribers s
    JOIN subscriptions sb
        ON s.s_id = sb.sb_subscriber
    JOIN books b
        ON sb.sb_book = b.b_id
) AS inter2

    ON inter1.s_id = inter2.s_id
   AND inter2.sb_start = inter1.min_date

GROUP BY
    inter1.s_id,
    inter1.s_name;