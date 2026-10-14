// Проверки в отдельных учебных базах; запросы сверяются с расчётом на JavaScript.
process.env.LAB3_LIBRARY_DB = process.env.LAB3_TEST_LIBRARY_DB || 'library_lab3_tests';
process.env.LAB3_UNIVERSITY_DB = process.env.LAB3_TEST_UNIVERSITY_DB || 'university_lab3_tests';
globalThis.LAB3_SILENT = true;
load('lab3/library_seed.js');
load('lab3/university_seed.js');
load('lab3/library_queries.js');
load('lab3/university_queries.js');
(() => {
  let passed=0;
  const ok=(condition,label) => { if (!condition) throw new Error(label); passed++; print(`PASS: ${label}`); };
  const normalize=value => {
    if (value instanceof Date) return value.toISOString();
    if (value && value._bsontype==='ObjectId') return value.toHexString();
    if (value && ['Int32','Long','Double','Decimal128'].includes(value._bsontype)) return Number(value);
    if (Array.isArray(value)) return value.map(normalize).sort((a,b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if (value && typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(k => [k,normalize(value[k])]));
    if (typeof value==='number') return Math.round(value*1e8)/1e8;
    return value;
  };
  const same=(actual,expected,label) => {
    const left=JSON.stringify(normalize(actual)),right=JSON.stringify(normalize(expected));
    if (left!==right) throw new Error(`${label}\nПолучено: ${left}\nОжидалось: ${right}`);
    ok(true,label);
  };
  const id=x => x.toString();
  const pick=(row,fields) => Object.fromEntries(fields.map(k => [k,row[k]]));
  const sum=(rows,fn) => rows.reduce((total,row) => total+Number(fn(row)),0);
  const avg=(rows,fn) => sum(rows,fn)/rows.length;
  const unique=rows => [...new Set(rows)];
  const maximum=(rows,key) => rows.filter(row => row[key]===Math.max(...rows.map(r => r[key])));
  const library=db.getSiblingDB(process.env.LAB3_LIBRARY_DB);
  const books=library.books.find().toArray(),authors=library.authors.find().toArray();
  const readers=library.readers.find().toArray(),loans=library.borrowings.find().toArray();
  const byBook=new Map(books.map(b => [id(b._id),b])),byReader=new Map(readers.map(r => [id(r._id),r]));
  const readerFields=['last_name','first_name','parent_name','card_number'];
  const authorFields=['last_name','first_name','parent_name'];
  const readerInfo=r => pick(r,readerFields);
  const authorInfo=a => pick(a,authorFields);
  const bookTitles=rows => rows.map(b => ({title:b.title}));
  const booksForAuthor=a => books.filter(b => b.author_ids.some(x => id(x)===id(a._id)));
  const loansForReader=r => loans.filter(l => id(l.reader_id)===id(r._id));
  const loansForBook=b => loans.filter(l => id(l.book_id)===id(b._id));
  const titleForLoan=l => byBook.get(id(l.book_id)).title;
  const days=l => (l.date_return-l.date_borrowed)/86400000;
  const active=loans.filter(l => !l.returned),returned=loans.filter(l => l.returned);
  const countedReaders=filter => readers.map(r => ({...readerInfo(r),count:loansForReader(r).filter(filter).length})).filter(r => r.count>0);
  const allCounts=countedReaders(() => true),activeCounts=countedReaders(l => !l.returned);
  const popularity=authors.map(a => ({...authorInfo(a),count:sum(booksForAuthor(a),b => loansForBook(b).length)}));
  const expected=new Map();
  const e=(n,value) => expected.set(n,value);
  e(1,authors.map(a => pick(a,[...authorFields,'birth_year','country'])));
  e(2,books.map(b => pick(b,['title','year','publisher','genres'])));
  e(3,unique(books.map(b => b.publisher)));
  e(4,bookTitles(booksForAuthor(authors.find(a => a.last_name==='Достоевский'))));
  e(5,bookTitles(books.filter(b => b.publisher==='Эксмо')));
  const russian19=authors.filter(a => a.country.includes('Россия') && a.birth_year>=1801 && a.birth_year<=1900);
  e(6,bookTitles(books.filter(b => b.author_ids.some(x => russian19.some(a => id(a._id)===id(x))))));
  e(7,bookTitles(books.filter(b => b.genres.includes('психологический роман'))));
  e(8,books.filter(b => b.genres.includes('социальный роман')).length);
  e(9,bookTitles(books.filter(b => b.genres.includes('научная фантастика') && b.genres.includes('психологический роман'))));
  const monday=books.find(b => b.title==='Понедельник начинается в субботу');
  e(10,authors.filter(a => monday.author_ids.some(x => id(x)===id(a._id))).map(authorInfo));
  e(11,books.length); e(12,[{total:sum(books,b => b.totalCopies)}]); e(13,readers.length);
  e(14,[{available:sum(books,b => b.availableCopies)}]);
  e(15,books.filter(b => b.publisher==='Азбука-Аттикус').length);
  const regional=JSON.parse(process.env.LAB3_REGIONAL_PUBLISHERS || '[]');
  e(16,books.filter(b => regional.includes(b.publisher)).length);
  const youngest=Math.max(...readers.map(r => r.birthday.getTime()));
  e(17,readers.filter(r => r.birthday.getTime()===youngest).map(r => ({...readerInfo(r),birthday:r.birthday})));
  e(18,readers.filter(r => loansForReader(r).length).map(readerInfo));
  e(19,unique(loans.map(titleForLoan)).map(title => ({title})));
  e(20,books.filter(b => loansForBook(b).length).map(b => ({title:b.title,count:loansForBook(b).length})));
  e(21,active.length); e(22,unique(loans.map(l => id(l.book_id))).length);
  e(23,expected.get(18)); e(24,unique(loans.map(l => id(l.reader_id))).length);
  e(25,[{total:sum(books,b => b.totalCopies),minimum:Math.min(...books.map(b => b.totalCopies)),maximum:Math.max(...books.map(b => b.totalCopies)),average:avg(books,b => b.totalCopies)}]);
  e(26,books.map(b => pick(b,['title','year'])));
  e(27,books.filter(b => b.year>=2020 && b.year<=2024 && b.totalCopies<=15).map(b => pick(b,['title','year','totalCopies'])));
  e(28,loans.filter(l => l.date_borrowed.getUTCFullYear()===2025).map(l => ({title:titleForLoan(l),date_borrowed:l.date_borrowed})));
  e(29,[{average:avg(books,b => b.totalCopies)}]);
  const averageCopies=avg(books,b => b.totalCopies);
  e(30,books.filter(b => b.totalCopies<averageCopies).map(b => ({title:b.title,totalCopies:b.totalCopies,average:averageCopies})));
  e(31,maximum(books,'totalCopies').map(b => pick(b,['title','totalCopies'])));
  e(32,[{average_days:avg(returned,days)}]);
  e(33,unique(loans.map(l => l.date_borrowed.getUTCFullYear())).map(year => ({year,count:loans.filter(l => l.date_borrowed.getUTCFullYear()===year).length})));
  e(34,books.filter(b => b.genres.length>1).map(b => pick(b,['title','genres'])));
  e(35,activeCounts.filter(r => r.count>5)); e(36,activeCounts);
  e(37,authors.map(a => ({...authorInfo(a),copies:sum(booksForAuthor(a),b => b.totalCopies)})));
  e(38,authors.map(a => ({...authorInfo(a),editions:booksForAuthor(a).length})));
  e(39,expected.get(38).filter(a => a.editions>2));
  e(40,books.filter(b => loansForBook(b).length).map(b => ({title:b.title,copies_issued:loansForBook(b).length})));
  e(41,readers.filter(r => !loansForReader(r).length).map(readerInfo));
  e(42,bookTitles(books.filter(b => !loansForBook(b).length)));
  e(43,unique(books.flatMap(b => b.genres)).map(genre => ({genre,count:books.filter(b => b.genres.includes(genre)).length})));
  e(44,maximum(allCounts,'count'));
  e(45,books.filter(b => b.author_ids.length>1).map(b => pick(b,['title','author_ids'])));
  e(46,books.filter(b => b.genres.length===1).map(b => pick(b,['title','genres'])));
  e(47,popularity); e(48,maximum(popularity,'count'));
  e(49,authors.filter(a => booksForAuthor(a).some(b => b.genres.length>=2)).map(authorInfo));
  e(50,[{average_on_hands:active.length/readers.length}]);
  const maxGenres=Math.max(...books.map(b => b.genres.length));
  const diverseIds=books.filter(b => b.genres.length===maxGenres).map(b => id(b._id));
  e(51,readers.filter(r => loansForReader(r).some(l => diverseIds.includes(id(l.book_id)))).map(readerInfo));
  const minimumDays=Math.min(...returned.map(days));
  e(52,readers.filter(r => loansForReader(r).some(l => l.returned && days(l)===minimumDays)).map(r => ({...readerInfo(r),reading_days:minimumDays})));
  e(53,expected.get(42));
  e(54,readers.map(r => ({...readerInfo(r),not_borrowed:bookTitles(books.filter(b => !loansForReader(r).some(l => id(l.book_id)===id(b._id))))})));
  e(55,readers.filter(r => loansForReader(r).length).map(r => {
    const history=loansForReader(r),firstDate=new Date(Math.min(...history.map(l => l.date_borrowed.getTime())));
    return {...readerInfo(r),first_date:firstDate,books:unique(history.filter(l => l.date_borrowed.toISOString().slice(0,10)===firstDate.toISOString().slice(0,10)).map(titleForLoan))};
  }));
  const winners=maximum(allCounts,'count'); e(56,winners.length===1 ? winners : []);
  e(57,[{returned:returned.length,not_returned:active.length}]);
  ok(libraryQueries.length===57,'Библиотека: 57 запросов');
  for (const query of libraryQueries) same(query.run(),expected.get(query.number),`Библиотека: запрос ${query.number}`);
  const ordered=libraryQueries[25].run();
  ok(ordered.every((b,i) => !i || b.year>=ordered[i-1].year),'Запрос 26: годы действительно возрастают');
  same([books.length,authors.length,readers.length,loans.length],[41,20,8,65],'Объём исходного набора');
  same([expected.get(12)[0].total,expected.get(14)[0].available,active.length,returned.length],[833,357,12,53],'Контрольные суммы библиотеки');
  for (const b of books) {
    ok(b.author_ids.every(x => authors.some(a => id(a._id)===id(x) && a.book_ids.some(y => id(y)===id(b._id)))) ,`Взаимные ссылки книги: ${b.title}`);
  }
  ok(loans.every(l => byBook.has(id(l.book_id)) && byReader.has(id(l.reader_id)) && l.date_return>=l.date_borrowed),'Ссылки и даты всех выдач');
  ok(readers.every(r => r.borrowedBooks.length===loansForReader(r).filter(l => !l.returned).length),'Вложенные активные выдачи читателей');

  // Граничные условия на временных документах; удаляем даже при провале проверки.
  const edgeReader={_id:new ObjectId(),last_name:'Проверочный',first_name:'Читатель',parent_name:'Тестович',card_number:'TEST-EDGE',birthday:ISODate('2002-06-11')};
  const edgeAuthor={_id:new ObjectId(),last_name:'Безкнижный',first_name:'Автор',parent_name:''};
  const edgeBook={_id:new ObjectId(),title:'Проверочный максимум',year:NumberInt(2024),totalCopies:NumberInt(50),availableCopies:NumberInt(50),genres:['жанр'],author_ids:[]};
  const edgeLoans=[];
  try {
    library.readers.insertOne(edgeReader); library.authors.insertOne(edgeAuthor); library.books.insertOne(edgeBook);
    ok(libraryQueries[16].run().length===2,'Запрос 17: все самые молодые при совпадении дат');
    ok(libraryQueries[30].run().length===2,'Запрос 31: все книги с максимальным количеством');
    ok(libraryQueries[36].run().some(a => a.last_name==='Безкнижный' && a.copies===0),'Запрос 37: автор без книг сохраняется');
    for (let i=0;i<6;i++) edgeLoans.push({_id:new ObjectId(),reader_id:edgeReader._id,book_id:books[i]._id,
      date_borrowed:ISODate(`2026-01-01T${String(i+8).padStart(2,'0')}:00:00Z`),date_return:ISODate('2026-02-01'),returned:false});
    library.borrowings.insertMany(edgeLoans.slice(0,5));
    ok(!libraryQueries[34].run().some(r => r.card_number==='TEST-EDGE'),'Запрос 35: ровно пять книг не проходит');
    library.borrowings.insertOne(edgeLoans[5]);
    ok(libraryQueries[34].run().some(r => r.card_number==='TEST-EDGE' && r.count===6),'Запрос 35: шесть книг проходит');
    ok(libraryQueries[54].run().find(r => r.card_number==='TEST-EDGE').books.length===6,'Запрос 55: все выдачи в первый день, разные часы');
    ok(libraryQueries[43].run().length===2 && libraryQueries[55].run().length===0,'Запросы 44 и 56: общий максимум и отсутствие строгого победителя');
  } finally {
    library.borrowings.deleteMany({_id:{$in:edgeLoans.map(l => l._id)}});
    library.readers.deleteOne({_id:edgeReader._id}); library.authors.deleteOne({_id:edgeAuthor._id}); library.books.deleteOne({_id:edgeBook._id});
  }

  // Отдельная проверка 8 коллекций и 20 запросов собственной БД.
  const university=db.getSiblingDB(process.env.LAB3_UNIVERSITY_DB);
  const collections=['departments','teachers','students','courses','enrollments','classrooms','lessons','payments'];
  const data=Object.fromEntries(collections.map(name => [name,university.getCollection(name).find().toArray()]));
  for (const name of collections) ok(data[name].length>=10,`Учебный центр: минимум 10 документов в ${name}`);
  const {departments,teachers,students,courses,enrollments,classrooms,lessons,payments}=data;
  const find=(rows,key) => rows.find(row => id(row._id)===id(key));
  ok(enrollments.every(e => find(students,e.student_id) && find(courses,e.course_id)),'Ссылки записей на курсы');
  ok(lessons.every(l => find(courses,l.course_id) && find(teachers,l.teacher_id) && find(classrooms,l.classroom_id) && l.ends_at>l.starts_at),'Ссылки и длительность занятий');
  ok(payments.every(p => find(enrollments,p.enrollment_id) && find(students,p.student_id)),'Ссылки платежей');
  ok(universityQueries.length===20,'Учебный центр: 20 запросов');
  const uExpected=[];
  uExpected.push(students.filter(s => s.city==='Москва').map(s => pick(s,['name','card_number'])));
  uExpected.push(courses.filter(c => c.level==='beginner' && c.format==='online').map(c => pick(c,['title','fee'])));
  uExpected.push(courses.filter(c => c.fee>=10000 && c.fee<=12000).map(c => pick(c,['title','fee'])));
  uExpected.push(classrooms.filter(c => c.equipment.includes('компьютеры') && c.capacity>=30).map(c => pick(c,['number','capacity'])));
  uExpected.push(courses.map(c => ({title:c.title,department:find(departments,c.department_id).name})));
  uExpected.push(teachers.map(t => ({name:t.name,courses:courses.filter(c => c.teacher_ids.some(x => id(x)===id(t._id))).map(c => c.title)})));
  const studentEnrol=s => enrollments.filter(e => id(e.student_id)===id(s._id));
  uExpected.push(courses.map(c => ({title:c.title,count:enrollments.filter(e => id(e.course_id)===id(c._id)).length})));
  uExpected.push(students.filter(s => studentEnrol(s).length>2).map(s => ({...pick(s,['name','card_number']),count:studentEnrol(s).length})));
  uExpected.push(students.filter(s => !studentEnrol(s).length).map(s => pick(s,['name','card_number'])));
  uExpected.push(students.filter(s => studentEnrol(s).some(e => e.status==='completed')).map(s => {
    const completed=studentEnrol(s).filter(e => e.status==='completed');
    return {name:s.name,average_grade:avg(completed,e => e.grade),completed:completed.length};
  }));
  const revenue=c => sum(payments.filter(p => p.status==='paid' && id(find(enrollments,p.enrollment_id).course_id)===id(c._id)),p => p.amount);
  uExpected.push(courses.filter(c => payments.some(p => p.status==='paid' && id(find(enrollments,p.enrollment_id).course_id)===id(c._id))).map(c => ({title:c.title,revenue:revenue(c)})));
  uExpected.push(enrollments.map(e => ({name:find(students,e.student_id).name,title:find(courses,e.course_id).title,
    debt:Math.max(0,find(courses,e.course_id).fee-sum(payments.filter(p => id(p.enrollment_id)===id(e._id) && p.status==='paid'),p => p.amount))})).filter(e => e.debt>0));
  uExpected.push(lessons.filter(l => l.starts_at.toISOString().slice(0,10)==='2026-09-07').map(l => ({title:find(courses,l.course_id).title,room:find(classrooms,l.classroom_id).number,starts_at:l.starts_at,ends_at:l.ends_at})));
  uExpected.push(teachers.filter(t => lessons.some(l => id(l.teacher_id)===id(t._id))).map(t => {
    const taught=lessons.filter(l => id(l.teacher_id)===id(t._id));
    return {name:t.name,lessons:taught.length,minutes:sum(taught,l => (l.ends_at-l.starts_at)/60000)};
  }));
  uExpected.push(departments.map(d => ({name:d.name,teachers:teachers.filter(t => id(t.department_id)===id(d._id)).length,courses:courses.filter(c => id(c.department_id)===id(d._id)).length})));
  uExpected.push(departments.filter(d => !courses.some(c => id(c.department_id)===id(d._id))).map(d => ({name:d.name})));
  uExpected.push(maximum(courses,'fee').map(c => pick(c,['title','fee'])));
  uExpected.push([{minimum:Math.min(...courses.map(c => c.fee)),maximum:Math.max(...courses.map(c => c.fee)),average:avg(courses,c => c.fee)}]);
  const paid=payments.filter(p => p.status==='paid');
  uExpected.push(unique(paid.map(p => p.paid_at.toISOString().slice(0,7))).map(month => ({month,revenue:sum(paid.filter(p => p.paid_at.toISOString().slice(0,7)===month),p => p.amount),payments:paid.filter(p => p.paid_at.toISOString().slice(0,7)===month).length})));
  uExpected.push(lessons.map(l => ({title:find(courses,l.course_id).title,room:find(classrooms,l.classroom_id).number,starts_at:l.starts_at,attended:l.attendance_ids.length,
    occupancy_percent:Math.round(10000*l.attendance_ids.length/find(classrooms,l.classroom_id).capacity)/100})));
  for (const query of universityQueries) same(query.run(),uExpected[query.number-1],`Учебный центр: запрос ${query.number}`);
  // Повторная загрузка не создаёт дубликаты и восстанавливает тот же набор.
  load('lab3/library_seed.js'); load('lab3/university_seed.js');
  same([library.books.countDocuments(),library.borrowings.countDocuments()],[41,65],'Повторная загрузка библиотеки');
  same(collections.map(name => university.getCollection(name).countDocuments()),collections.map(name => data[name].length),'Повторная загрузка учебного центра');
  print(`\nПроверки завершены: ${passed} PASS; MongoDB ${db.version()}`);
})();
