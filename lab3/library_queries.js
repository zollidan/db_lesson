// Практическое занятие 2. Все 57 запросов в порядке методички.
// MongoDB 8.0 / mongosh; запускается после library_seed.js.
(() => {
  const library = db.getSiblingDB(process.env.LAB3_LIBRARY_DB || 'library_lab3');
  const titles = [
  "Выведите список авторов.",
  "Выведите список книг.",
  "Выведите список издательств.",
  "Выведите список книг Ф.М. Достоевского.",
  "Выведите список книг, опубликованных в издательстве \"Эксмо\".",
  "Выведите список книг русских писателей, родившихся в XIX веке.",
  "Выведите список книг, относящихся к жанру \"психологический роман\".",
  "Определите число книг, относящихся к жанру \"социальный роман\".",
  "Выведите список книг, относящихся одновременно к жанрам \"научная фантастика\" и\"психологический роман\".",
  "Покажите автора(ов) книги \"Понедельник начинается в субботу\".",
  "Подсчитайте общее число книг (как изданий) в библиотеке.",
  "Подсчитайте общее число экземпляров книг в библиотеке.",
  "Подсчитайте сколько всего читателей зарегистрировано в библиотеке.",
  "Подсчитайте общее число доступных для выдачи экземпляров книг.",
  "Подсчитайте число книг (как изданий), опубликованных в издательстве Азбука-Аттикус.",
  "Подсчитайте число книг (как изданий), опубликованных в региональных издательствах.",
  "Покажите самого молодого читателя.",
  "Создайте запрос для просмотра (без повторений) ФИО и номеров читательских билетов читателей, бравших в библиотеке книги.",
  "Выведите (без повторений) список названий книг, которые были взяты читателями.",
  "Покажите по каждой книге, которую читатели брали в библиотеке, количество выдач этой книги читателям. Использовать название книги.",
  "Покажите сколько всего экземпляров книг находится на руках у читателей (по условию – “returned: false”.",
  "Подсчитайте сколько всего разных книг выдавалось читателям.",
  "Показать список читателей (last_name, first_name, parent_name, card_number), когда-либо бравших в библиотеке книги.",
  "Подсчитайте сколько читателей брало книги в библиотеке.",
  "Покажите общее (сумму), минимальное, максимальное и среднее значение количества экземпляров книг в библиотеке.",
  "Покажите все книги в библиотеке в порядке возрастания их года издания.",
  "Покажите книги, изданные в период 2020-2024 годов, представленные в библиотеке в количестве не более 15 экземпляров.",
  "Покажите названия и даты выдачи книг за 2025-го год.",
  "Покажите, сколько в среднем экземпляров книг есть в библиотеке.",
  "Покажите книги, количество экземпляров которых меньше среднего по библиотеке.",
  "Покажите книгу(и), количество экземпляров которой(ых) максимально в библиотеке.",
  "Покажите, на сколько в среднем дней читатели берут книги (учесть только случаи, когда книги были возвращены.",
  "Покажите по каждому году, сколько раз за этот год читатели брали книги.",
  "Покажите книги, относящиеся к более чем одному жанру.",
  "Покажите читателей (last_name, first_name, parent_name, card_number), у которых сейчас на руках больше пяти книг.",
  "Покажите всех читателей (last_name, first_name, parent_name, card_number), не вернувших книги, и количество невозвращённых книг по каждому такому читателю.",
  "Покажите всех авторов и количество экземпляров книг по каждому автору.",
  "Покажите всех авторов и количество книг (изданий) по каждому автору.",
  "Показать авторов, написавших более двух книг (из фонда библтотеки).",
  "Покажите, сколько экземпляров каждой книги выдавалось читателям (указать название книги и число экземпляров).",
  "Покажите список читателей, никогда не бравших в библиотеке книги.",
  "Покажите список названий книг, которые никто из читателей никогда не брал.",
  "Покажите жанры и количество книг, относящихся к этому жанру.",
  "Покажите читателя(ей) (last_name, first_name, parent_name, card_number), взявшего(их) в библиотеке больше всего книг и число взятых книг.",
  "Покажите список книг, у которых более одного автора.",
  "Покажите список книг, относящихся ровно к одному жанру.",
  "Покажите читаемость авторов, т.е. всех авторов и то количество раз, которое книги этих авторов были взяты читателями.",
  "Покажите самого читаемого автора, т.е. автора (или авторов, если их несколько), книги которого читатели брали чаще всего.",
  "Покажите авторов, одновременно работавших в двух и более жанрах (т.е. хотя бы одна книга автора должна одновременно относиться к двум и более жанрам).",
  "Покажите, сколько в среднем экземпляров книг сейчас на руках у читателей.",
  "Покажите читателей, бравших самые разножанровые книги (т.е. книги, одновременно относящиеся к максимальному количеству жанров).",
  "Покажите читателя (или читателей, если их окажется несколько), быстрее всего прочитавшего книгу (учитывать только случаи, когда книга возвращена).",
  "Покажите книги, которые ни разу не были взяты никем из читателей.",
  "Покажите информацию о том, какие книги каждый из читателей ещё не брал в библиотеке.",
  "Покажите какую книгу (или книги, если их несколько) каждый читатель взял в первый день своей работы с библиотекой.",
  "Показать читателя (last_name, first_name, parent_name, card_number), взявшего в библиотеке больше книг, чем любой другой читатель и чило взятых им книг.",
  "Показать, сколько книг было возвращено и не возвращено в библиотеку."
];
  // В документе региональные издательства не определены.
  // Указанные издательства — федеральные. Для иной классификации задайте список:
  const regionalPublishers = JSON.parse(process.env.LAB3_REGIONAL_PUBLISHERS || '[]');
  const queries = [];
  const add = (number, run) => queries.push({number, title: titles[number-1], run});
  const aggregate = (name, ...stages) => library.getCollection(name).aggregate(stages).toArray();
  const readerFields = {_id:0, last_name:1, first_name:1, parent_name:1, card_number:1};
  const joinBook = {$lookup:{from:'books',localField:'book_id',foreignField:'_id',as:'book'}};
  const joinReader = {$lookup:{from:'readers',localField:'reader_id',foreignField:'_id',as:'reader'}};
  const joinAuthorBooks = {$lookup:{from:'books',localField:'_id',foreignField:'author_ids',as:'books'}};
  const nameFromReader = {
    _id:0, last_name:'$reader.last_name', first_name:'$reader.first_name',
    parent_name:'$reader.parent_name', card_number:'$reader.card_number'
  };
  const maximumRows = field => [
    {$setWindowFields:{output:{maximum:{$max:`$${field}`,window:{documents:['unbounded','unbounded']}}}}},
    {$match:{$expr:{$eq:[`$${field}`,'$maximum']}}}, {$unset:'maximum'}
  ];
  const readerCounts = (filter = {}) => [
    {$match:filter}, {$group:{_id:'$reader_id',count:{$sum:1}}},
    {$lookup:{from:'readers',localField:'_id',foreignField:'_id',as:'reader'}},
    {$unwind:'$reader'}, {$project:{...nameFromReader, count:1}}
  ];
  const popularity = () => [
    joinAuthorBooks,
    {$lookup:{from:'borrowings',localField:'books._id',foreignField:'book_id',as:'loans'}},
    {$project:{_id:0,last_name:1,first_name:1,parent_name:1,count:{$size:'$loans'}}}
  ];

  // 1–10. Простые выборки, ссылки и жанры.
  add(1, () => library.authors.find({}, {_id:0,last_name:1,first_name:1,parent_name:1,birth_year:1,country:1}).sort({last_name:1,first_name:1}).toArray());
  add(2, () => library.books.find({}, {_id:0,title:1,year:1,publisher:1,genres:1}).sort({title:1}).toArray());
  add(3, () => library.books.distinct('publisher').sort());
  add(4, () => aggregate('authors', {$match:{last_name:'Достоевский',first_name:'Фёдор',parent_name:'Михайлович'}},
    joinAuthorBooks, {$unwind:'$books'}, {$project:{_id:0,title:'$books.title'}}, {$sort:{title:1}}));
  add(5, () => library.books.find({publisher:'Эксмо'},{_id:0,title:1}).sort({title:1}).toArray());
  // XIX век = 1801–1900 включительно. Пушкин (1799) сюда не входит.
  add(6, () => aggregate('books', {$lookup:{from:'authors',localField:'author_ids',foreignField:'_id',as:'authors'}},
    {$match:{authors:{$elemMatch:{country:'Россия',birth_year:{$gte:1801,$lte:1900}}}}},
    {$project:{_id:0,title:1}}, {$sort:{title:1}}));
  add(7, () => library.books.find({genres:'психологический роман'},{_id:0,title:1}).sort({title:1}).toArray());
  add(8, () => library.books.countDocuments({genres:'социальный роман'}));
  add(9, () => library.books.find({genres:{$all:['научная фантастика','психологический роман']}},{_id:0,title:1}).toArray());
  add(10, () => aggregate('books', {$match:{title:'Понедельник начинается в субботу'}},
    {$lookup:{from:'authors',localField:'author_ids',foreignField:'_id',as:'authors'}},
    {$unwind:'$authors'}, {$project:{_id:0,last_name:'$authors.last_name',first_name:'$authors.first_name',parent_name:'$authors.parent_name'}},
    {$sort:{first_name:1}}));

  // 11–20. Подсчёты, читатели и история выдач.
  add(11, () => library.books.countDocuments({}));
  add(12, () => aggregate('books', {$group:{_id:null,total:{$sum:'$totalCopies'}}}, {$project:{_id:0,total:1}}));
  add(13, () => library.readers.countDocuments({}));
  add(14, () => aggregate('books', {$group:{_id:null,available:{$sum:'$availableCopies'}}}, {$project:{_id:0,available:1}}));
  add(15, () => library.books.countDocuments({publisher:'Азбука-Аттикус'}));
  add(16, () => library.books.countDocuments({publisher:{$in:regionalPublishers}}));
  add(17, () => aggregate('readers', ...maximumRows('birthday'), {$project:{...readerFields,birthday:1}}, {$sort:{card_number:1}}));
  add(18, () => aggregate('borrowings', {$group:{_id:'$reader_id'}},
    {$lookup:{from:'readers',localField:'_id',foreignField:'_id',as:'reader'}},
    {$unwind:'$reader'}, {$project:nameFromReader}, {$sort:{card_number:1}}));
  add(19, () => aggregate('borrowings', {$group:{_id:'$book_id'}},
    {$lookup:{from:'books',localField:'_id',foreignField:'_id',as:'book'}},
    {$unwind:'$book'}, {$group:{_id:'$book.title'}}, {$project:{_id:0,title:'$_id'}}, {$sort:{title:1}}));
  add(20, () => aggregate('borrowings', {$group:{_id:'$book_id',count:{$sum:1}}},
    {$lookup:{from:'books',localField:'_id',foreignField:'_id',as:'book'}},
    {$unwind:'$book'}, {$project:{_id:0,title:'$book.title',count:1}}, {$sort:{title:1}}));

  // 21–30. Итоги и сравнение со средним.
  add(21, () => library.borrowings.countDocuments({returned:false}));
  add(22, () => library.borrowings.distinct('book_id').length);
  add(23, () => aggregate('readers', {$lookup:{from:'borrowings',localField:'_id',foreignField:'reader_id',as:'loans'}},
    {$match:{'loans.0':{$exists:true}}}, {$project:readerFields}, {$sort:{card_number:1}}));
  add(24, () => library.borrowings.distinct('reader_id').length);
  add(25, () => aggregate('books', {$group:{_id:null,total:{$sum:'$totalCopies'},minimum:{$min:'$totalCopies'},maximum:{$max:'$totalCopies'},average:{$avg:'$totalCopies'}}}, {$unset:'_id'}));
  add(26, () => library.books.find({},{_id:0,title:1,year:1}).sort({year:1,title:1}).toArray());
  add(27, () => library.books.find({year:{$gte:2020,$lte:2024},totalCopies:{$lte:15}},{_id:0,title:1,year:1,totalCopies:1}).sort({title:1}).toArray());
  add(28, () => aggregate('borrowings', {$match:{date_borrowed:{$gte:ISODate('2025-01-01'),$lt:ISODate('2026-01-01')}}},
    joinBook, {$unwind:'$book'}, {$project:{_id:0,title:'$book.title',date_borrowed:1}}, {$sort:{date_borrowed:1,title:1}}));
  add(29, () => aggregate('books', {$group:{_id:null,average:{$avg:'$totalCopies'}}}, {$unset:'_id'}));
  add(30, () => aggregate('books', {$setWindowFields:{output:{average:{$avg:'$totalCopies',window:{documents:['unbounded','unbounded']}}}}},
    {$match:{$expr:{$lt:['$totalCopies','$average']}}}, {$project:{_id:0,title:1,totalCopies:1,average:1}}, {$sort:{title:1}}));

  // 31–40. Максимумы, даты, задолженность и авторы.
  add(31, () => aggregate('books', ...maximumRows('totalCopies'), {$project:{_id:0,title:1,totalCopies:1}}, {$sort:{title:1}}));
  add(32, () => aggregate('borrowings', {$match:{returned:true}}, {$group:{_id:null,average_days:{$avg:{$dateDiff:{startDate:'$date_borrowed',endDate:'$date_return',unit:'day'}}}}}, {$unset:'_id'}));
  add(33, () => aggregate('borrowings', {$group:{_id:{$year:'$date_borrowed'},count:{$sum:1}}}, {$project:{_id:0,year:'$_id',count:1}}, {$sort:{year:1}}));
  add(34, () => library.books.find({'genres.1':{$exists:true}},{_id:0,title:1,genres:1}).sort({title:1}).toArray());
  add(35, () => aggregate('borrowings', ...readerCounts({returned:false}), {$match:{count:{$gt:5}}}, {$sort:{card_number:1}}));
  add(36, () => aggregate('borrowings', ...readerCounts({returned:false}), {$sort:{card_number:1}}));
  add(37, () => aggregate('authors', joinAuthorBooks, {$project:{_id:0,last_name:1,first_name:1,parent_name:1,copies:{$sum:'$books.totalCopies'}}}, {$sort:{last_name:1,first_name:1}}));
  add(38, () => aggregate('authors', joinAuthorBooks, {$project:{_id:0,last_name:1,first_name:1,parent_name:1,editions:{$size:'$books'}}}, {$sort:{last_name:1,first_name:1}}));
  add(39, () => aggregate('authors', joinAuthorBooks, {$project:{_id:0,last_name:1,first_name:1,parent_name:1,editions:{$size:'$books'}}}, {$match:{editions:{$gt:2}}}, {$sort:{last_name:1,first_name:1}}));
  // Одна выдача = один экземпляр. Повторные выдачи учитываются повторно.
  add(40, () => aggregate('borrowings', {$group:{_id:'$book_id',copies_issued:{$sum:1}}},
    {$lookup:{from:'books',localField:'_id',foreignField:'_id',as:'book'}}, {$unwind:'$book'},
    {$project:{_id:0,title:'$book.title',copies_issued:1}}, {$sort:{title:1}}));

  // 41–50. Отсутствующие связи, несколько жанров и рейтинги.
  add(41, () => aggregate('readers', {$lookup:{from:'borrowings',localField:'_id',foreignField:'reader_id',as:'loans'}},
    {$match:{'loans.0':{$exists:false}}}, {$project:readerFields}, {$sort:{card_number:1}}));
  add(42, () => aggregate('books', {$lookup:{from:'borrowings',localField:'_id',foreignField:'book_id',as:'loans'}},
    {$match:{'loans.0':{$exists:false}}}, {$project:{_id:0,title:1}}, {$sort:{title:1}}));
  add(43, () => aggregate('books', {$unwind:'$genres'}, {$group:{_id:'$genres',count:{$sum:1}}}, {$project:{_id:0,genre:'$_id',count:1}}, {$sort:{genre:1}}));
  add(44, () => aggregate('borrowings', ...readerCounts(), ...maximumRows('count'), {$sort:{card_number:1}}));
  add(45, () => library.books.find({'author_ids.1':{$exists:true}},{_id:0,title:1,author_ids:1}).sort({title:1}).toArray());
  add(46, () => library.books.find({genres:{$size:1}},{_id:0,title:1,genres:1}).sort({title:1}).toArray());
  add(47, () => aggregate('authors', ...popularity(), {$sort:{last_name:1,first_name:1}}));
  add(48, () => aggregate('authors', ...popularity(), ...maximumRows('count'), {$sort:{last_name:1,first_name:1}}));
  // Требование: хотя бы ОДНА книга автора имеет >=2 жанров.
  add(49, () => aggregate('authors', joinAuthorBooks, {$match:{books:{$elemMatch:{'genres.1':{$exists:true}}}}},
    {$project:{_id:0,last_name:1,first_name:1,parent_name:1}}, {$sort:{last_name:1,first_name:1}}));
  add(50, () => aggregate('readers', {$lookup:{from:'borrowings',let:{readerId:'$_id'},pipeline:[
    {$match:{$expr:{$and:[{$eq:['$reader_id','$$readerId']},{$eq:['$returned',false]}]}}}
  ],as:'active'}}, {$group:{_id:null,average_on_hands:{$avg:{$size:'$active'}}}}, {$unset:'_id'}));

  // 51–57. Максимально разножанровые книги, рекорды и первые выдачи.
  add(51, () => aggregate('books', {$set:{genre_count:{$size:'$genres'}}}, ...maximumRows('genre_count'),
    {$lookup:{from:'borrowings',localField:'_id',foreignField:'book_id',as:'loans'}}, {$unwind:'$loans'},
    {$group:{_id:'$loans.reader_id'}}, {$lookup:{from:'readers',localField:'_id',foreignField:'_id',as:'reader'}},
    {$unwind:'$reader'}, {$project:nameFromReader}, {$sort:{card_number:1}}));
  add(52, () => aggregate('borrowings', {$match:{returned:true}},
    {$set:{reading_days:{$dateDiff:{startDate:'$date_borrowed',endDate:'$date_return',unit:'day'}}}},
    {$setWindowFields:{output:{fastest:{$min:'$reading_days',window:{documents:['unbounded','unbounded']}}}}},
    {$match:{$expr:{$eq:['$reading_days','$fastest']}}}, joinReader, {$unwind:'$reader'},
    {$group:{_id:'$reader_id',reader:{$first:'$reader'},reading_days:{$first:'$reading_days'}}},
    {$project:{...nameFromReader,reading_days:1}}, {$sort:{card_number:1}}));
  add(53, () => aggregate('books', {$lookup:{from:'borrowings',localField:'_id',foreignField:'book_id',as:'loans'}},
    {$match:{'loans.0':{$exists:false}}}, {$project:{_id:0,title:1}}, {$sort:{title:1}}));
  add(54, () => aggregate('readers', {$lookup:{from:'borrowings',localField:'_id',foreignField:'reader_id',as:'history'}},
    {$lookup:{from:'books',let:{taken:'$history.book_id'},pipeline:[
      {$match:{$expr:{$not:[{$in:['$_id','$$taken']}]}}}, {$project:{_id:0,title:1}}, {$sort:{title:1}}
    ],as:'not_borrowed'}}, {$project:{...readerFields,not_borrowed:1}}, {$sort:{card_number:1}}));
  add(55, () => aggregate('borrowings', {$setWindowFields:{partitionBy:'$reader_id',output:{first_date:{$min:'$date_borrowed',window:{documents:['unbounded','unbounded']}}}}},
    {$match:{$expr:{$eq:[{$dateTrunc:{date:'$date_borrowed',unit:'day'}},{$dateTrunc:{date:'$first_date',unit:'day'}}]}}},
    joinBook, {$unwind:'$book'}, joinReader, {$unwind:'$reader'},
    {$group:{_id:'$reader_id',reader:{$first:'$reader'},first_date:{$min:'$date_borrowed'},books:{$addToSet:'$book.title'}}},
    {$project:{...nameFromReader,first_date:1,books:1}}, {$sort:{card_number:1}}));
  // В отличие от п.44, здесь требуется единственный строгий победитель.
  add(56, () => aggregate('borrowings', ...readerCounts(), ...maximumRows('count'),
    {$group:{_id:null,winners:{$push:'$$ROOT'}}}, {$match:{$expr:{$eq:[{$size:'$winners'},1]}}},
    {$unwind:'$winners'}, {$replaceWith:'$winners'}));
  add(57, () => aggregate('borrowings', {$group:{_id:null,returned:{$sum:{$cond:['$returned',1,0]}},not_returned:{$sum:{$cond:['$returned',0,1]}}}}, {$unset:'_id'}));

  globalThis.libraryQueries = queries;
  if (!globalThis.LAB3_SILENT) for (const query of queries) {
    print(`\n${query.number}. ${query.title}`);
    print(EJSON.stringify(query.run(), null, 2));
  }
})();
