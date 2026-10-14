// Практическое занятие 1, задание 3: библиотека из документа.
// Запуск из корня репозитория: mongosh --file lab3/library_seed.js
(() => {
  const library = db.getSiblingDB(process.env.LAB3_LIBRARY_DB || 'library_lab3');
  const names = ['authors', 'books', 'readers', 'borrowings'];
  const seedTag = 'db_lesson_lab3_library_v1';
  // Не смешиваем учебные данные с посторонними документами.
  for (const name of names) {
    if (library.getCollection(name).countDocuments({seed_tag: {$ne: seedTag}})) {
      throw new Error(`Коллекция ${library.getName()}.${name} содержит посторонние данные`);
    }
  }
  const oid = (kind, index) => ObjectId(`${kind.toString(16).padStart(2,'0')}${index.toString(16).padStart(22,'0')}`);
  const upsert = (name, docs) => {
    if (!library.getCollectionNames().includes(name)) library.createCollection(name);
    library.getCollection(name).bulkWrite(docs.map(doc => ({replaceOne: {
      filter: {_id: doc._id}, replacement: {...doc, seed_tag: seedTag}, upsert: true
    }})));
  };
  const authorData = [
  {
    "last_name": "Достоевский",
    "first_name": "Фёдор",
    "parent_name": "Михайлович",
    "birth_year": 1821,
    "country": [
      "Россия"
    ]
  },
  {
    "last_name": "Толстой",
    "first_name": "Лев",
    "parent_name": "Николаевич",
    "birth_year": 1828,
    "country": [
      "Россия"
    ]
  },
  {
    "last_name": "Гоголь",
    "first_name": "Николай",
    "parent_name": "Васильевич",
    "birth_year": 1809,
    "country": [
      "Россия"
    ]
  },
  {
    "last_name": "Пушкин",
    "first_name": "Александр",
    "parent_name": "Сергеевич",
    "birth_year": 1799,
    "country": [
      "Россия"
    ]
  },
  {
    "last_name": "Лермонтов",
    "first_name": "Михаил",
    "parent_name": "Юрьевич",
    "birth_year": 1814,
    "country": [
      "Россия"
    ]
  },
  {
    "last_name": "Гончаров",
    "first_name": "Иван",
    "parent_name": "Александрович",
    "birth_year": 1812,
    "country": [
      "Россия"
    ]
  },
  {
    "last_name": "Тургенев",
    "first_name": "Иван",
    "parent_name": "Сергеевич",
    "birth_year": 1818,
    "country": [
      "Россия"
    ]
  },
  {
    "last_name": "Куприн",
    "first_name": "Александр",
    "parent_name": "Иванович",
    "birth_year": 1870,
    "country": [
      "Россия"
    ]
  },
  {
    "last_name": "Набоков",
    "first_name": "Владимир",
    "parent_name": "Владимирович",
    "birth_year": 1899,
    "country": [
      "Россия",
      "США"
    ]
  },
  {
    "last_name": "Дюма",
    "first_name": "Александр",
    "birth_year": 1802,
    "country": [
      "Франция"
    ],
    "parent_name": ""
  },
  {
    "last_name": "Гюго",
    "first_name": "Виктор",
    "birth_year": 1802,
    "country": [
      "Франция"
    ],
    "parent_name": ""
  },
  {
    "last_name": "Золя",
    "first_name": "Эмиль",
    "birth_year": 1840,
    "country": [
      "Франция"
    ],
    "parent_name": ""
  },
  {
    "last_name": "По",
    "first_name": "Эдгар",
    "birth_year": 1809,
    "country": [
      "США"
    ],
    "parent_name": ""
  },
  {
    "last_name": "Фолкнер",
    "first_name": "Уильям",
    "birth_year": 1897,
    "country": [
      "США"
    ],
    "parent_name": ""
  },
  {
    "last_name": "Уэллс",
    "first_name": "Герберт",
    "birth_year": 1866,
    "country": [
      "Великобритания"
    ],
    "parent_name": ""
  },
  {
    "last_name": "Диккенс",
    "first_name": "Чарльз",
    "birth_year": 1812,
    "country": [
      "Великобритания"
    ],
    "parent_name": ""
  },
  {
    "last_name": "Стругацкий",
    "first_name": "Борис",
    "parent_name": "Натанович",
    "birth_year": 1933,
    "country": [
      "Россия"
    ]
  },
  {
    "last_name": "Стругацкий",
    "first_name": "Аркадий",
    "parent_name": "Натанович",
    "birth_year": 1925,
    "country": [
      "Россия"
    ]
  },
  {
    "last_name": "Ильф",
    "first_name": "Илья",
    "parent_name": "Арнольдович",
    "birth_year": 1897,
    "country": [
      "Россия"
    ]
  },
  {
    "last_name": "Петров",
    "first_name": "Евгений",
    "parent_name": "Петрович",
    "birth_year": 1902,
    "country": [
      "Россия"
    ]
  }
];
  const bookData = [
  {
    "title": "Преступление и наказание",
    "year": 2017,
    "isbn": "978-5-699-35662-7",
    "genres": [
      "классика",
      "психологический роман"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 20,
    "availableCopies": 7,
    "author_keys": [
      "Достоевский"
    ]
  },
  {
    "title": "Братья Карамазовы",
    "year": 2020,
    "isbn": "978-5-699-37899-1",
    "genres": [
      "классика",
      "психологический роман",
      "философский роман"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 36,
    "availableCopies": 10,
    "author_keys": [
      "Достоевский"
    ]
  },
  {
    "title": "Бесы",
    "year": 2022,
    "isbn": "978-5-699-35111-1",
    "genres": [
      "классика",
      "психологический роман",
      "философский роман"
    ],
    "publisher": "АСТ",
    "language": [
      "русский"
    ],
    "totalCopies": 12,
    "availableCopies": 5,
    "author_keys": [
      "Достоевский"
    ]
  },
  {
    "title": "Крейцерова соната",
    "year": 2020,
    "isbn": "978-5-667-36783-2",
    "genres": [
      "повесть",
      "психологическая проза",
      "философская проза"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 13,
    "availableCopies": 10,
    "author_keys": [
      "Толстой"
    ]
  },
  {
    "title": "Воскресение",
    "year": 2012,
    "isbn": "978-5-654-35234-1",
    "genres": [
      "психологический роман",
      "философский роман",
      "социальный роман"
    ],
    "publisher": "АСТ",
    "language": [
      "русский"
    ],
    "totalCopies": 34,
    "availableCopies": 30,
    "author_keys": [
      "Толстой"
    ]
  },
  {
    "title": "Анна Каренина",
    "year": 2017,
    "isbn": "978-5-789-38904-1",
    "genres": [
      "психологический роман",
      "семейный роман",
      "социальный роман"
    ],
    "publisher": "Вече",
    "language": [
      "русский"
    ],
    "totalCopies": 22,
    "availableCopies": 12,
    "author_keys": [
      "Толстой"
    ]
  },
  {
    "title": "Мёртвые души",
    "year": 2023,
    "isbn": "978-5-790-38321-3",
    "genres": [
      "сатира",
      "прозаическая поэма"
    ],
    "publisher": "Азбука",
    "language": [
      "русский"
    ],
    "totalCopies": 15,
    "availableCopies": 12,
    "author_keys": [
      "Гоголь"
    ]
  },
  {
    "title": "Ревизор",
    "year": 2024,
    "isbn": "978-5-745-34561-3",
    "genres": [
      "комедия"
    ],
    "publisher": "Азбука",
    "language": [
      "русский"
    ],
    "totalCopies": 15,
    "availableCopies": 12,
    "author_keys": [
      "Гоголь"
    ]
  },
  {
    "title": "Шинель",
    "year": 2011,
    "isbn": "978-5-712-34621-3",
    "genres": [
      "драматическая проза"
    ],
    "publisher": "Вече",
    "language": [
      "русский"
    ],
    "totalCopies": 19,
    "availableCopies": 11,
    "author_keys": [
      "Гоголь"
    ]
  },
  {
    "title": "Евгений Онегин",
    "year": 2009,
    "isbn": "978-5-755-38902-3",
    "genres": [
      "роман в стихах"
    ],
    "publisher": "Вече",
    "language": [
      "русский"
    ],
    "totalCopies": 34,
    "availableCopies": 10,
    "author_keys": [
      "Пушкин"
    ]
  },
  {
    "title": "Руслан и Людмила",
    "year": 1999,
    "isbn": "978-5-711-31190-1",
    "genres": [
      "поэма",
      "русская литературная сказка"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 12,
    "availableCopies": 10,
    "author_keys": [
      "Пушкин"
    ]
  },
  {
    "title": "Дубровский",
    "year": 1998,
    "isbn": "978-5-777-38899-1",
    "genres": [
      "разбойничий роман"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 17,
    "availableCopies": 11,
    "author_keys": [
      "Пушкин"
    ]
  },
  {
    "title": "Герой нашего времени",
    "year": 2014,
    "isbn": "978-5-799-37791-1",
    "genres": [
      "психологический роман",
      "социальный роман"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 20,
    "availableCopies": 17,
    "author_keys": [
      "Лермонтов"
    ]
  },
  {
    "title": "Демон",
    "year": 2023,
    "isbn": "978-5-799-366882-1",
    "genres": [
      "поэма",
      "философская притча"
    ],
    "publisher": "Вече",
    "language": [
      "русский"
    ],
    "totalCopies": 28,
    "availableCopies": 17,
    "author_keys": [
      "Лермонтов"
    ]
  },
  {
    "title": "Обломов",
    "year": 1998,
    "isbn": "978-5-799-343356-1",
    "genres": [
      "психологический роман",
      "социальный роман"
    ],
    "publisher": "Азбука-Аттикус",
    "language": [
      "русский"
    ],
    "totalCopies": 38,
    "availableCopies": 8,
    "author_keys": [
      "Гончаров"
    ]
  },
  {
    "title": "Обрыв",
    "year": 1994,
    "isbn": "978-5-799-35552-1",
    "genres": [
      "психологический роман",
      "социальный роман"
    ],
    "publisher": "Азбука-Аттикус",
    "language": [
      "русский"
    ],
    "totalCopies": 38,
    "availableCopies": 8,
    "author_keys": [
      "Гончаров"
    ]
  },
  {
    "title": "Рудин",
    "year": 2021,
    "isbn": "978-5-799-366771-1",
    "genres": [
      "любовный роман",
      "психологический роман"
    ],
    "publisher": "Азбука-Аттикус",
    "language": [
      "русский"
    ],
    "totalCopies": 10,
    "availableCopies": 8,
    "author_keys": [
      "Тургенев"
    ]
  },
  {
    "title": "Дворянское гнездо",
    "year": 2021,
    "isbn": "978-5-799-32223-1",
    "genres": [
      "любовный роман",
      "психологический роман"
    ],
    "publisher": "Азбука-Аттикус",
    "language": [
      "русский"
    ],
    "totalCopies": 30,
    "availableCopies": 7,
    "author_keys": [
      "Тургенев"
    ]
  },
  {
    "title": "Яма",
    "year": 2021,
    "isbn": "978-5-795-39922-1",
    "genres": [
      "повесть",
      "социальная драма",
      "реализм"
    ],
    "publisher": "Время",
    "language": [
      "русский"
    ],
    "totalCopies": 10,
    "availableCopies": 2,
    "author_keys": [
      "Куприн"
    ]
  },
  {
    "title": "Юнкера",
    "year": 2018,
    "isbn": "978-5-795-34441-2",
    "genres": [
      "автобиографический роман",
      "реализм"
    ],
    "publisher": "Время",
    "language": [
      "русский"
    ],
    "totalCopies": 14,
    "availableCopies": 6,
    "author_keys": [
      "Куприн"
    ]
  },
  {
    "title": "Поединок",
    "year": 2023,
    "isbn": "978-5-795-32221-1",
    "genres": [
      "повесть",
      "социальная драма"
    ],
    "publisher": "Азбука-Аттикус",
    "language": [
      "русский"
    ],
    "totalCopies": 19,
    "availableCopies": 12,
    "author_keys": [
      "Куприн"
    ]
  },
  {
    "title": "Защита Лужина",
    "year": 2020,
    "isbn": "978-5-795-37651-1",
    "genres": [
      "психологический роман",
      "реализм"
    ],
    "publisher": "Азбука-Аттикус",
    "language": [
      "русский"
    ],
    "totalCopies": 11,
    "availableCopies": 10,
    "author_keys": [
      "Набоков"
    ]
  },
  {
    "title": "Камера обскура",
    "year": 2020,
    "isbn": "978-5-798-37331-1",
    "genres": [
      "психологический роман",
      "реализм"
    ],
    "publisher": "Олма-пресс",
    "language": [
      "русский",
      "английский"
    ],
    "totalCopies": 21,
    "availableCopies": 10,
    "author_keys": [
      "Набоков"
    ]
  },
  {
    "title": "Королева Марго",
    "year": 2019,
    "isbn": "978-5-798-37771-1",
    "genres": [
      "исторический роман",
      "приключенческий роман"
    ],
    "publisher": "Слово",
    "language": [
      "русский"
    ],
    "totalCopies": 5,
    "availableCopies": 1,
    "author_keys": [
      "Дюма"
    ]
  },
  {
    "title": "Отверженные",
    "year": 2025,
    "isbn": "978-5-798-33359-1",
    "genres": [
      "исторический роман",
      "социальный роман",
      "роман-эпопея"
    ],
    "publisher": "Слово",
    "language": [
      "русский"
    ],
    "totalCopies": 34,
    "availableCopies": 7,
    "author_keys": [
      "Гюго"
    ]
  },
  {
    "title": "Человек, который смеётся",
    "year": 2011,
    "isbn": "978-5-798-31188-1",
    "genres": [
      "исторический роман",
      "социальный роман",
      "готическая драма"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 12,
    "availableCopies": 2,
    "author_keys": [
      "Гюго"
    ]
  },
  {
    "title": "Собор Парижской Богоматери",
    "year": 2009,
    "isbn": "978-5-798-31100-2",
    "genres": [
      "исторический роман",
      "роман-эпопея",
      "готическая драма"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 12,
    "availableCopies": 2,
    "author_keys": [
      "Гюго"
    ]
  },
  {
    "title": "Жерминаль",
    "year": 2022,
    "isbn": "978-5-798-31188-2",
    "genres": [
      "социальный роман",
      "психологический роман",
      "реализм"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 50,
    "availableCopies": 9,
    "author_keys": [
      "Золя"
    ]
  },
  {
    "title": "Человек-зверь",
    "year": 2022,
    "isbn": "978-5-798-30334-2",
    "genres": [
      "социальный роман",
      "психологический роман",
      "реализм"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 11,
    "availableCopies": 9,
    "author_keys": [
      "Золя"
    ]
  },
  {
    "title": "Повесть о приключениях Артура Гордона Пима",
    "year": 2013,
    "isbn": "978-5-798-35559-2",
    "genres": [
      "приключенческий роман",
      "ужасы",
      "готическая драма"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 19,
    "availableCopies": 9,
    "author_keys": [
      "По"
    ]
  },
  {
    "title": "Шум и ярость",
    "year": 2015,
    "isbn": "978-5-798-35119-2",
    "genres": [
      "психологический роман",
      "модернизм",
      "готическая драма"
    ],
    "publisher": "АСТ",
    "language": [
      "русский"
    ],
    "totalCopies": 19,
    "availableCopies": 9,
    "author_keys": [
      "Фолкнер"
    ]
  },
  {
    "title": "Особняк",
    "year": 2015,
    "isbn": "978-5-798-37789-2",
    "genres": [
      "социальный роман",
      "психологический роман",
      "реализм"
    ],
    "publisher": "АСТ",
    "language": [
      "русский"
    ],
    "totalCopies": 9,
    "availableCopies": 5,
    "author_keys": [
      "Фолкнер"
    ]
  },
  {
    "title": "Машина времени",
    "year": 2017,
    "isbn": "978-5-798-33671-2",
    "genres": [
      "роман",
      "научная фантастика",
      "антиутопия"
    ],
    "publisher": "АСТ",
    "language": [
      "русский"
    ],
    "totalCopies": 9,
    "availableCopies": 5,
    "author_keys": [
      "Уэллс"
    ]
  },
  {
    "title": "Человек-невидимка",
    "year": 2017,
    "isbn": "978-5-798-33222-2",
    "genres": [
      "роман",
      "научная фантастика",
      "ужасы"
    ],
    "publisher": "АСТ",
    "language": [
      "русский"
    ],
    "totalCopies": 9,
    "availableCopies": 5,
    "author_keys": [
      "Уэллс"
    ]
  },
  {
    "title": "Приключения Оливера Твиста",
    "year": 2017,
    "isbn": "978-5-798-31132-2",
    "genres": [
      "приключенческий роман",
      "социальный роман"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 23,
    "availableCopies": 7,
    "author_keys": [
      "Диккенс"
    ]
  },
  {
    "title": "Дэвид Копперфильд",
    "year": 2022,
    "isbn": "978-5-798-31770-2",
    "genres": [
      "роман воспитания",
      "автобиографический роман",
      "социальный роман"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 21,
    "availableCopies": 5,
    "author_keys": [
      "Диккенс"
    ]
  },
  {
    "title": "Понедельник начинается в субботу",
    "year": 2022,
    "isbn": "978-5-798-33000-2",
    "genres": [
      "повесть",
      "научная фантастика",
      "сатира"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 21,
    "availableCopies": 8,
    "author_keys": [
      "Стругацкий Борис",
      "Стругацкий Аркадий"
    ]
  },
  {
    "title": "Пикник на обочине",
    "year": 2001,
    "isbn": "978-5-798-33111-1",
    "genres": [
      "философский роман",
      "научная фантастика",
      "психологический роман",
      "приключенческий роман"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 21,
    "availableCopies": 8,
    "author_keys": [
      "Стругацкий Борис",
      "Стругацкий Аркадий"
    ]
  },
  {
    "title": "Трудно быть богом",
    "year": 2003,
    "isbn": "978-5-798-33111-1",
    "genres": [
      "научная фантастика",
      "социальная фантастика",
      "приключенческий роман",
      "философский роман"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 24,
    "availableCopies": 9,
    "author_keys": [
      "Стругацкий Борис",
      "Стругацкий Аркадий"
    ]
  },
  {
    "title": "Двенадцать стульев",
    "year": 2003,
    "isbn": "978-5-798-39901-1",
    "genres": [
      "плутовской роман",
      "сатирический роман"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 26,
    "availableCopies": 8,
    "author_keys": [
      "Ильф",
      "Петров"
    ]
  },
  {
    "title": "Золотой телёнок",
    "year": 2012,
    "isbn": "978-5-798-31122-1",
    "genres": [
      "плутовской роман",
      "сатирический роман"
    ],
    "publisher": "Эксмо",
    "language": [
      "русский"
    ],
    "totalCopies": 20,
    "availableCopies": 4,
    "author_keys": [
      "Ильф",
      "Петров"
    ]
  }
];
  const readerData = [
  {
    "last_name": "Иванов",
    "first_name": "Игорь",
    "parent_name": "Николаевич",
    "card_number": "567345",
    "registration_date": "2014-02-15",
    "passport_num": "4087612311",
    "birthday": "1990-11-12",
    "phone": "+7(657)1122331",
    "email": "ivanov_i1111@mail.ru"
  },
  {
    "last_name": "Фомин",
    "first_name": "Михаил",
    "parent_name": "Петрович",
    "card_number": "555300",
    "registration_date": "2020-03-14",
    "passport_num": "4044226123",
    "birthday": "1995-12-10",
    "phone": "+7(655)1456711",
    "email": "fomin_mih6745@mail.ru"
  },
  {
    "last_name": "Нестерова",
    "first_name": "Ирина",
    "parent_name": "Александровна",
    "card_number": "341122",
    "registration_date": "2020-11-14",
    "passport_num": "4077288121",
    "birthday": "1999-01-10",
    "phone": "+7(688)2456790",
    "email": "nester_irin1256@mail.ru"
  },
  {
    "last_name": "Жукова",
    "first_name": "Мария",
    "parent_name": "Алексеевна",
    "card_number": "366133",
    "registration_date": "2024-12-17",
    "passport_num": "4023255111",
    "birthday": "1977-11-09",
    "phone": "+7(622)2456710",
    "email": "zukova_mar9875@mail.ru"
  },
  {
    "last_name": "Соколов",
    "first_name": "Эдуард",
    "parent_name": "Алексеевич",
    "card_number": "390765",
    "registration_date": "2017-10-11",
    "passport_num": "4056908765",
    "birthday": "1997-09-09",
    "phone": "+7(659)2876540",
    "email": "sokolov_ed8911@mail.ru"
  },
  {
    "last_name": "Данилов",
    "first_name": "Роман",
    "parent_name": "Игнатович",
    "card_number": "987722",
    "registration_date": "2016-12-06",
    "passport_num": "4033444765",
    "birthday": "1992-11-01",
    "phone": "+7(611)2987640",
    "email": "danilov_rom8811@mail.ru"
  },
  {
    "last_name": "Косоротов",
    "first_name": "Александр",
    "parent_name": "Александрович",
    "card_number": "786442",
    "registration_date": "2010-01-30",
    "passport_num": "7090893422",
    "birthday": "1985-10-19",
    "phone": "+7(614)2234567",
    "email": "kosorotov_alex1234@mail.ru"
  },
  {
    "last_name": "Симакова",
    "first_name": "Анна",
    "parent_name": "Васильевна",
    "card_number": "123987",
    "registration_date": "2020-01-30",
    "passport_num": "7088098167",
    "birthday": "2002-06-11",
    "phone": "+7(615)2218877",
    "email": "simakovs_anna1122@mail.ru"
  }
];
  const borrowingData = [
  {
    "reader_key": "Иванов",
    "book_title": "Преступление и наказание",
    "date_borrowed": "2023-01-06",
    "date_return": "2023-01-07",
    "returned": true
  },
  {
    "reader_key": "Иванов",
    "book_title": "Братья Карамазовы",
    "date_borrowed": "2023-01-06",
    "date_return": "2023-01-07",
    "returned": true
  },
  {
    "reader_key": "Иванов",
    "book_title": "Воскресение",
    "date_borrowed": "2023-01-06",
    "date_return": "2023-01-07",
    "returned": true
  },
  {
    "reader_key": "Иванов",
    "book_title": "Руслан и Людмила",
    "date_borrowed": "2023-10-01",
    "date_return": "2023-10-15",
    "returned": true
  },
  {
    "reader_key": "Иванов",
    "book_title": "Демон",
    "date_borrowed": "2023-10-01",
    "date_return": "2023-10-15",
    "returned": true
  },
  {
    "reader_key": "Иванов",
    "book_title": "Отверженные",
    "date_borrowed": "2023-10-01",
    "date_return": "2023-10-15",
    "returned": true
  },
  {
    "reader_key": "Иванов",
    "book_title": "Преступление и наказание",
    "date_borrowed": "2024-03-01",
    "date_return": "2024-04-21",
    "returned": true
  },
  {
    "reader_key": "Иванов",
    "book_title": "Человек, который смеётся",
    "date_borrowed": "2024-04-23",
    "date_return": "2024-05-31",
    "returned": true
  },
  {
    "reader_key": "Иванов",
    "book_title": "Обломов",
    "date_borrowed": "2024-05-26",
    "date_return": "2024-06-15",
    "returned": true
  },
  {
    "reader_key": "Иванов",
    "book_title": "Руслан и Людмила",
    "date_borrowed": "2025-11-01",
    "date_return": "2025-12-08",
    "returned": true
  },
  {
    "reader_key": "Иванов",
    "book_title": "Демон",
    "date_borrowed": "2025-11-05",
    "date_return": "2025-12-15",
    "returned": true
  },
  {
    "reader_key": "Иванов",
    "book_title": "Мёртвые души",
    "date_borrowed": "2025-11-11",
    "date_return": "2025-12-15",
    "returned": false
  },
  {
    "reader_key": "Фомин",
    "book_title": "Преступление и наказание",
    "date_borrowed": "2023-03-06",
    "date_return": "2023-03-17",
    "returned": true
  },
  {
    "reader_key": "Фомин",
    "book_title": "Королева Марго",
    "date_borrowed": "2023-04-16",
    "date_return": "2023-04-20",
    "returned": true
  },
  {
    "reader_key": "Фомин",
    "book_title": "Собор Парижской Богоматери",
    "date_borrowed": "2023-04-16",
    "date_return": "2023-04-30",
    "returned": true
  },
  {
    "reader_key": "Фомин",
    "book_title": "Руслан и Людмила",
    "date_borrowed": "2023-11-01",
    "date_return": "2023-11-15",
    "returned": true
  },
  {
    "reader_key": "Фомин",
    "book_title": "Демон",
    "date_borrowed": "2023-11-02",
    "date_return": "2023-12-15",
    "returned": true
  },
  {
    "reader_key": "Фомин",
    "book_title": "Шум и ярость",
    "date_borrowed": "2023-11-08",
    "date_return": "2023-12-15",
    "returned": true
  },
  {
    "reader_key": "Фомин",
    "book_title": "Преступление и наказание",
    "date_borrowed": "2024-12-01",
    "date_return": "2024-12-25",
    "returned": true
  },
  {
    "reader_key": "Фомин",
    "book_title": "Человек-невидимка",
    "date_borrowed": "2024-11-23",
    "date_return": "2024-12-30",
    "returned": true
  },
  {
    "reader_key": "Фомин",
    "book_title": "Обломов",
    "date_borrowed": "2024-05-26",
    "date_return": "2024-06-15",
    "returned": true
  },
  {
    "reader_key": "Фомин",
    "book_title": "Руслан и Людмила",
    "date_borrowed": "2025-12-01",
    "date_return": "2025-12-30",
    "returned": true
  },
  {
    "reader_key": "Фомин",
    "book_title": "Демон",
    "date_borrowed": "2025-11-05",
    "date_return": "2025-12-15",
    "returned": true
  },
  {
    "reader_key": "Фомин",
    "book_title": "Машина времени",
    "date_borrowed": "2025-11-11",
    "date_return": "2025-11-25",
    "returned": false
  },
  {
    "reader_key": "Нестерова",
    "book_title": "Жерминаль",
    "date_borrowed": "2024-05-23",
    "date_return": "2024-06-30",
    "returned": true
  },
  {
    "reader_key": "Нестерова",
    "book_title": "Камера обскура",
    "date_borrowed": "2024-05-26",
    "date_return": "2024-06-15",
    "returned": true
  },
  {
    "reader_key": "Нестерова",
    "book_title": "Мёртвые души",
    "date_borrowed": "2025-11-01",
    "date_return": "2025-12-08",
    "returned": true
  },
  {
    "reader_key": "Нестерова",
    "book_title": "Воскресение",
    "date_borrowed": "2025-11-05",
    "date_return": "2025-12-15",
    "returned": true
  },
  {
    "reader_key": "Нестерова",
    "book_title": "Обрыв",
    "date_borrowed": "2025-11-11",
    "date_return": "2025-12-15",
    "returned": false
  },
  {
    "reader_key": "Нестерова",
    "book_title": "Повесть о приключениях Артура Гордона Пима",
    "date_borrowed": "2025-03-06",
    "date_return": "2025-03-17",
    "returned": true
  },
  {
    "reader_key": "Жукова",
    "book_title": "Ревизор",
    "date_borrowed": "2024-05-23",
    "date_return": "2024-06-30",
    "returned": true
  },
  {
    "reader_key": "Жукова",
    "book_title": "Понедельник начинается в субботу",
    "date_borrowed": "2024-05-26",
    "date_return": "2024-06-15",
    "returned": true
  },
  {
    "reader_key": "Жукова",
    "book_title": "Обрыв",
    "date_borrowed": "2025-11-01",
    "date_return": "2025-12-08",
    "returned": true
  },
  {
    "reader_key": "Жукова",
    "book_title": "Юнкера",
    "date_borrowed": "2025-11-05",
    "date_return": "2025-12-15",
    "returned": true
  },
  {
    "reader_key": "Жукова",
    "book_title": "Герой нашего времени",
    "date_borrowed": "2025-08-16",
    "date_return": "2025-09-15",
    "returned": false
  },
  {
    "reader_key": "Соколов",
    "book_title": "Золотой телёнок",
    "date_borrowed": "2024-07-24",
    "date_return": "2024-08-30",
    "returned": true
  },
  {
    "reader_key": "Соколов",
    "book_title": "Защита Лужина",
    "date_borrowed": "2024-07-26",
    "date_return": "2024-08-15",
    "returned": true
  },
  {
    "reader_key": "Соколов",
    "book_title": "Машина времени",
    "date_borrowed": "2025-11-01",
    "date_return": "2025-12-08",
    "returned": true
  },
  {
    "reader_key": "Соколов",
    "book_title": "Двенадцать стульев",
    "date_borrowed": "2025-11-05",
    "date_return": "2025-12-15",
    "returned": true
  },
  {
    "reader_key": "Соколов",
    "book_title": "Машина времени",
    "date_borrowed": "2025-08-16",
    "date_return": "2025-09-15",
    "returned": false
  },
  {
    "reader_key": "Соколов",
    "book_title": "Повесть о приключениях Артура Гордона Пима",
    "date_borrowed": "2024-09-24",
    "date_return": "2024-10-30",
    "returned": true
  },
  {
    "reader_key": "Соколов",
    "book_title": "Дэвид Копперфильд",
    "date_borrowed": "2024-09-26",
    "date_return": "2024-10-17",
    "returned": true
  },
  {
    "reader_key": "Соколов",
    "book_title": "Поединок",
    "date_borrowed": "2025-03-01",
    "date_return": "2025-04-02",
    "returned": true
  },
  {
    "reader_key": "Соколов",
    "book_title": "Яма",
    "date_borrowed": "2025-06-05",
    "date_return": "2025-07-10",
    "returned": true
  },
  {
    "reader_key": "Соколов",
    "book_title": "Дворянское гнездо",
    "date_borrowed": "2025-08-17",
    "date_return": "2025-09-03",
    "returned": false
  },
  {
    "reader_key": "Соколов",
    "book_title": "Воскресение",
    "date_borrowed": "2025-11-05",
    "date_return": "2025-11-15",
    "returned": true
  },
  {
    "reader_key": "Соколов",
    "book_title": "Ревизор",
    "date_borrowed": "2025-02-23",
    "date_return": "2025-03-30",
    "returned": true
  },
  {
    "reader_key": "Соколов",
    "book_title": "Герой нашего времени",
    "date_borrowed": "2025-08-10",
    "date_return": "2025-09-10",
    "returned": false
  },
  {
    "reader_key": "Данилов",
    "book_title": "Особняк",
    "date_borrowed": "2024-07-24",
    "date_return": "2024-08-30",
    "returned": true
  },
  {
    "reader_key": "Данилов",
    "book_title": "Обрыв",
    "date_borrowed": "2024-07-26",
    "date_return": "2024-08-15",
    "returned": true
  },
  {
    "reader_key": "Данилов",
    "book_title": "Трудно быть богом",
    "date_borrowed": "2025-11-01",
    "date_return": "2025-12-08",
    "returned": true
  },
  {
    "reader_key": "Данилов",
    "book_title": "Пикник на обочине",
    "date_borrowed": "2025-11-05",
    "date_return": "2025-12-15",
    "returned": true
  },
  {
    "reader_key": "Данилов",
    "book_title": "Рудин",
    "date_borrowed": "2025-08-16",
    "date_return": "2025-09-15",
    "returned": false
  },
  {
    "reader_key": "Данилов",
    "book_title": "Обломов",
    "date_borrowed": "2024-09-24",
    "date_return": "2024-10-30",
    "returned": true
  },
  {
    "reader_key": "Данилов",
    "book_title": "Особняк",
    "date_borrowed": "2024-09-26",
    "date_return": "2024-10-17",
    "returned": true
  },
  {
    "reader_key": "Данилов",
    "book_title": "Пикник на обочине",
    "date_borrowed": "2025-03-01",
    "date_return": "2025-04-02",
    "returned": true
  },
  {
    "reader_key": "Данилов",
    "book_title": "Шинель",
    "date_borrowed": "2025-06-05",
    "date_return": "2025-07-10",
    "returned": true
  },
  {
    "reader_key": "Данилов",
    "book_title": "Трудно быть богом",
    "date_borrowed": "2025-08-17",
    "date_return": "2025-09-03",
    "returned": false
  },
  {
    "reader_key": "Данилов",
    "book_title": "Воскресение",
    "date_borrowed": "2025-11-05",
    "date_return": "2025-11-15",
    "returned": true
  },
  {
    "reader_key": "Данилов",
    "book_title": "Ревизор",
    "date_borrowed": "2025-02-23",
    "date_return": "2025-03-30",
    "returned": true
  },
  {
    "reader_key": "Данилов",
    "book_title": "Герой нашего времени",
    "date_borrowed": "2025-08-10",
    "date_return": "2025-09-10",
    "returned": false
  },
  {
    "reader_key": "Косоротов",
    "book_title": "Мёртвые души",
    "date_borrowed": "2025-02-23",
    "date_return": "2025-03-30",
    "returned": true
  },
  {
    "reader_key": "Косоротов",
    "book_title": "Евгений Онегин",
    "date_borrowed": "2025-08-10",
    "date_return": "2025-09-10",
    "returned": false
  },
  {
    "reader_key": "Косоротов",
    "book_title": "Крейцерова соната",
    "date_borrowed": "2025-03-23",
    "date_return": "2025-04-30",
    "returned": true
  },
  {
    "reader_key": "Косоротов",
    "book_title": "Бесы",
    "date_borrowed": "2025-03-10",
    "date_return": "2025-04-10",
    "returned": false
  }
];
  const authors = authorData.map((a,i) => ({...a, _id: oid(1,i+1), book_ids: []}));
  const authorsByKey = new Map(authors.map(a => [a.last_name === 'Стругацкий' ? `${a.last_name} ${a.first_name}` : a.last_name,a]));
  const books = bookData.map((b,i) => {
    const {author_keys, ...fields} = b;
    return {...fields, _id: oid(2,i+1), year: NumberInt(b.year),
      totalCopies: NumberInt(b.totalCopies), availableCopies: NumberInt(b.availableCopies),
      author_ids: author_keys.map(key => {
        const author = authorsByKey.get(key);
        if (!author) throw new Error(`Неизвестный автор ${key}`);
        return author._id;
      })};
  });
  const booksByTitle = new Map(books.map(b => [b.title,b]));
  for (const book of books) for (const id of book.author_ids) {
    authors.find(a => a._id.equals(id)).book_ids.push(book._id);
  }
  for (const author of authors) author.birth_year = NumberInt(author.birth_year);
  const readers = readerData.map((r,i) => ({...r, _id: oid(3,i+1),
    birthday: ISODate(r.birthday), registration_date: ISODate(r.registration_date), borrowedBooks: []}));
  const readersByName = new Map(readers.map(r => [r.last_name,r]));
  const borrowings = borrowingData.map((b,i) => {
    const reader = readersByName.get(b.reader_key), book = booksByTitle.get(b.book_title);
    if (!reader || !book) throw new Error(`Неизвестная ссылка в выдаче ${i+1}`);
    const loan = {_id: oid(4,i+1), reader_id: reader._id, book_id: book._id,
      date_borrowed: ISODate(b.date_borrowed), date_return: ISODate(b.date_return), returned: b.returned};
    if (!loan.returned) reader.borrowedBooks.push({borrowing_id: loan._id, book_id: loan.book_id,
      date_borrowed: loan.date_borrowed, date_return: loan.date_return});
    return loan;
  });
  upsert('authors', authors); upsert('books', books);
  upsert('readers', readers); upsert('borrowings', borrowings);
  library.books.createIndex({title:1}, {unique:true});
  library.books.createIndex({author_ids:1}); library.books.createIndex({genres:1});
  library.books.createIndex({year:1}); library.books.createIndex({publisher:1});
  library.readers.createIndex({card_number:1}, {unique:true});
  library.borrowings.createIndex({reader_id:1, returned:1});
  library.borrowings.createIndex({book_id:1}); library.borrowings.createIndex({date_borrowed:1});
  print(`Готово: ${library.getName()}: ${authors.length} авторов, ${books.length} книг, ${readers.length} читателей, ${borrowings.length} выдач`);
})();
