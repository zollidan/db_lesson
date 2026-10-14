// Собственная БД «Учебный центр»: 20 запросов на выборку.
(() => {
  const university=db.getSiblingDB(process.env.LAB3_UNIVERSITY_DB || 'university_lab3');
  const queries=[];
  const add=(number,title,run) => queries.push({number,title,run});
  const ag=(name,...stages) => university.getCollection(name).aggregate(stages).toArray();
  const courseJoin={$lookup:{from:'courses',localField:'course_id',foreignField:'_id',as:'course'}};
  const studentJoin={$lookup:{from:'students',localField:'student_id',foreignField:'_id',as:'student'}};

  add(1,'Студенты из Москвы',() => university.students.find({city:'Москва'},{_id:0,name:1,card_number:1}).sort({card_number:1}).toArray());
  add(2,'Начальные онлайн-курсы',() => university.courses.find({level:'beginner',format:'online'},{_id:0,title:1,fee:1}).sort({title:1}).toArray());
  add(3,'Курсы стоимостью от 10000 до 12000 рублей',() => university.courses.find({fee:{$gte:10000,$lte:12000}},{_id:0,title:1,fee:1}).sort({fee:1,title:1}).toArray());
  add(4,'Аудитории с компьютерами и вместимостью не менее 30',() => university.classrooms.find({equipment:'компьютеры',capacity:{$gte:30}},{_id:0,number:1,capacity:1}).sort({number:1}).toArray());
  add(5,'Курсы с названиями кафедр',() => ag('courses',{$lookup:{from:'departments',localField:'department_id',foreignField:'_id',as:'department'}},
    {$unwind:'$department'},{$project:{_id:0,title:1,department:'$department.name'}},{$sort:{title:1}}));
  add(6,'Преподаватели и их курсы, включая преподавателей без курсов',() => ag('teachers',
    {$lookup:{from:'courses',localField:'_id',foreignField:'teacher_ids',as:'courses'}},
    {$project:{_id:0,name:1,courses:'$courses.title'}},{$sort:{name:1}}));
  add(7,'Количество записей на каждый курс, включая нулевые',() => ag('courses',
    {$lookup:{from:'enrollments',localField:'_id',foreignField:'course_id',as:'enrollments'}},
    {$project:{_id:0,title:1,count:{$size:'$enrollments'}}},{$sort:{count:-1,title:1}}));
  add(8,'Студенты с более чем двумя записями на курсы',() => ag('enrollments',{$group:{_id:'$student_id',count:{$sum:1}}},{$match:{count:{$gt:2}}},
    {$lookup:{from:'students',localField:'_id',foreignField:'_id',as:'student'}},{$unwind:'$student'},
    {$project:{_id:0,name:'$student.name',card_number:'$student.card_number',count:1}},{$sort:{card_number:1}}));
  add(9,'Студенты, не записанные ни на один курс',() => ag('students',{$lookup:{from:'enrollments',localField:'_id',foreignField:'student_id',as:'enrollments'}},
    {$match:{'enrollments.0':{$exists:false}}},{$project:{_id:0,name:1,card_number:1}},{$sort:{card_number:1}}));
  add(10,'Средняя оценка завершённых курсов по студентам',() => ag('enrollments',{$match:{status:'completed',grade:{$ne:null}}},
    {$group:{_id:'$student_id',average_grade:{$avg:'$grade'},completed:{$sum:1}}},
    {$lookup:{from:'students',localField:'_id',foreignField:'_id',as:'student'}},{$unwind:'$student'},
    {$project:{_id:0,name:'$student.name',average_grade:1,completed:1}},{$sort:{average_grade:-1,name:1}}));
  add(11,'Полученная выручка по курсам; ожидающие оплаты не учитываются',() => ag('payments',{$match:{status:'paid'}},
    {$lookup:{from:'enrollments',localField:'enrollment_id',foreignField:'_id',as:'enrollment'}},{$unwind:'$enrollment'},
    {$group:{_id:'$enrollment.course_id',revenue:{$sum:'$amount'}}},
    {$lookup:{from:'courses',localField:'_id',foreignField:'_id',as:'course'}},{$unwind:'$course'},
    {$project:{_id:0,title:'$course.title',revenue:1}},{$sort:{revenue:-1,title:1}}));
  add(12,'Задолженность по каждой записи: цена курса минус успешные платежи',() => ag('enrollments',courseJoin,{$unwind:'$course'},
    {$lookup:{from:'payments',let:{enrollmentId:'$_id'},pipeline:[{$match:{$expr:{$and:[{$eq:['$enrollment_id','$$enrollmentId']},{$eq:['$status','paid']}]}}}],as:'paid'}},
    {$set:{debt:{$max:[0,{$subtract:['$course.fee',{$sum:'$paid.amount'}]}]}}},{$match:{debt:{$gt:0}}},
    studentJoin,{$unwind:'$student'},{$project:{_id:0,name:'$student.name',title:'$course.title',debt:1}},{$sort:{name:1,title:1}}));
  add(13,'Занятия 7 сентября 2026 года с курсом и аудиторией',() => ag('lessons',
    {$match:{starts_at:{$gte:ISODate('2026-09-07'),$lt:ISODate('2026-09-08')}}},courseJoin,{$unwind:'$course'},
    {$lookup:{from:'classrooms',localField:'classroom_id',foreignField:'_id',as:'room'}},{$unwind:'$room'},
    {$project:{_id:0,title:'$course.title',room:'$room.number',starts_at:1,ends_at:1}},{$sort:{starts_at:1}}));
  add(14,'Количество занятий и суммарная длительность по преподавателям',() => ag('lessons',
    {$group:{_id:'$teacher_id',lessons:{$sum:1},minutes:{$sum:{$dateDiff:{startDate:'$starts_at',endDate:'$ends_at',unit:'minute'}}}}},
    {$lookup:{from:'teachers',localField:'_id',foreignField:'_id',as:'teacher'}},{$unwind:'$teacher'},
    {$project:{_id:0,name:'$teacher.name',lessons:1,minutes:1}},{$sort:{minutes:-1,name:1}}));
  add(15,'Количество преподавателей и курсов по каждой кафедре',() => ag('departments',
    {$lookup:{from:'teachers',localField:'_id',foreignField:'department_id',as:'teachers'}},
    {$lookup:{from:'courses',localField:'_id',foreignField:'department_id',as:'courses'}},
    {$project:{_id:0,name:1,teachers:{$size:'$teachers'},courses:{$size:'$courses'}}},{$sort:{name:1}}));
  add(16,'Кафедры без курсов',() => ag('departments',{$lookup:{from:'courses',localField:'_id',foreignField:'department_id',as:'courses'}},
    {$match:{'courses.0':{$exists:false}}},{$project:{_id:0,name:1}},{$sort:{name:1}}));
  add(17,'Самые дорогие курсы, включая совпадения',() => ag('courses',
    {$setWindowFields:{output:{maximum:{$max:'$fee',window:{documents:['unbounded','unbounded']}}}}},
    {$match:{$expr:{$eq:['$fee','$maximum']}}},{$project:{_id:0,title:1,fee:1}},{$sort:{title:1}}));
  add(18,'Минимальная, максимальная и средняя стоимость курса',() => ag('courses',
    {$group:{_id:null,minimum:{$min:'$fee'},maximum:{$max:'$fee'},average:{$avg:'$fee'}}},{$unset:'_id'}));
  add(19,'Выручка по месяцам с учётом только успешных платежей',() => ag('payments',{$match:{status:'paid'}},
    {$group:{_id:{$dateToString:{date:'$paid_at',format:'%Y-%m'}},revenue:{$sum:'$amount'},payments:{$sum:1}}},
    {$project:{_id:0,month:'$_id',revenue:1,payments:1}},{$sort:{month:1}}));
  add(20,'Посещаемость занятий и доля занятых мест в аудитории',() => ag('lessons',
    {$lookup:{from:'classrooms',localField:'classroom_id',foreignField:'_id',as:'room'}},{$unwind:'$room'},courseJoin,{$unwind:'$course'},
    {$project:{_id:0,title:'$course.title',room:'$room.number',starts_at:1,attended:{$size:'$attendance_ids'},
      occupancy_percent:{$round:[{$multiply:[100,{$divide:[{$size:'$attendance_ids'},'$room.capacity']}]},2]}}},{$sort:{starts_at:1}}));
  globalThis.universityQueries=queries;
  if (!globalThis.LAB3_SILENT) for (const query of queries) {
    print(`\n${query.number}. ${query.title}`); print(EJSON.stringify(query.run(),null,2));
  }
})();
