// Практическое занятие 3. Собственная БД «Учебный центр»: 8 коллекций.
(() => {
  const university = db.getSiblingDB(process.env.LAB3_UNIVERSITY_DB || 'university_lab3');
  const seedTag = 'db_lesson_lab3_university_v1';
  const names = ['departments','teachers','students','courses','enrollments','classrooms','lessons','payments'];
  for (const name of names) if (university.getCollection(name).countDocuments({seed_tag:{$ne:seedTag}})) {
    throw new Error(`Коллекция ${university.getName()}.${name} содержит посторонние данные`);
  }
  const oid = (kind,index) => ObjectId(`${kind.toString(16).padStart(2,'0')}${index.toString(16).padStart(22,'0')}`);
  const upsert = (name,documents) => {
    if (!university.getCollectionNames().includes(name)) university.createCollection(name);
    university.getCollection(name).bulkWrite(documents.map(doc => ({replaceOne:{
      filter:{_id:doc._id}, replacement:{...doc,seed_tag:seedTag}, upsert:true
    }})));
  };
  const departmentNames = ['Информатика','Математика','Экономика','Менеджмент','Иностранные языки',
    'Дизайн','История','Право','Психология','Физика'];
  const departments = departmentNames.map((name,i) => ({_id:oid(11,i+1),code:`D${i+1}`,name,
    address:{city:'Москва',building:NumberInt(i%2+1)},email:`department${i+1}@example.test`}));
  const teacherNames = ['Анна Сергеева','Иван Орлов','Мария Волкова','Павел Крылов','Елена Зайцева',
    'Дмитрий Соколов','Ольга Лебедева','Алексей Морозов','Ирина Кузнецова','Никита Фёдоров'];
  const teachers = teacherNames.map((name,i) => ({_id:oid(12,i+1),name,department_id:departments[i%6]._id,
    email:`teacher${i+1}@example.test`,hired_at:ISODate(`${2015+i}-09-01`),
    skills:i%2 ? ['лекции','практика'] : ['лекции','практика','онлайн'],hourly_rate:NumberInt(1000+i*100)}));
  const studentNames = ['Александр Иванов','Виктория Петрова','Максим Смирнов','Анастасия Попова',
    'Михаил Васильев','Дарья Новикова','Артём Фролов','Полина Алексеева','Даниил Семёнов',
    'Софья Павлова','Кирилл Андреев','Маргарита Николаева'];
  const students = studentNames.map((name,i) => ({_id:oid(13,i+1),card_number:`S${String(i+1).padStart(3,'0')}`,name,
    email:`student${i+1}@example.test`,birth_date:ISODate(`${2000+i%6}-02-${String(i+1).padStart(2,'0')}`),
    registered_at:ISODate('2026-08-01'),city:i%3 ? 'Москва' : 'Тула',interests:i%2 ? ['языки','экономика'] : ['программирование','дизайн']}));
  const courseNames = ['Базы данных','Линейная алгебра','Микроэкономика','Управление проектами',
    'Английский язык','Основы дизайна','Программирование Python','Теория вероятностей',
    'Финансовый анализ','Деловые коммуникации','Испанский язык','Компьютерная графика'];
  const courses = courseNames.map((title,i) => ({_id:oid(14,i+1),code:`C${String(i+1).padStart(3,'0')}`,title,
    department_id:departments[i%6]._id,teacher_ids:[teachers[i%10]._id],
    hours:NumberInt(24+(i%4)*12),fee:NumberInt(9000+(i%5)*1000),level:i%2 ? 'advanced' : 'beginner',
    format:i%3 ? 'offline' : 'online',tags:i%2 ? ['углублённый','сертификат'] : ['вводный','сертификат']}));
  const enrollments = Array.from({length:24},(_,i) => ({_id:oid(15,i+1),student_id:students[i%10]._id,
    course_id:courses[(i%10+Math.floor(i/10)*3)%12]._id,enrolled_at:ISODate(`2026-08-${String(i+2).padStart(2,'0')}`),
    status:i%3===0 ? 'completed' : 'active',grade:i%3===0 ? NumberInt(3+Math.floor(i/3)%3) : null}));
  const classrooms = Array.from({length:10},(_,i) => ({_id:oid(16,i+1),number:`${i%2+1}-${101+i}`,
    building:NumberInt(i%2+1),capacity:NumberInt(15+i*5),
    equipment:i%2 ? ['проектор'] : ['проектор','компьютеры'],accessible:i%3!==0}));
  const lessons = Array.from({length:24},(_,i) => {
    const starts = new Date(Date.UTC(2026,8,7+Math.floor(i/4),8+(i%4)*2));
    return {_id:oid(17,i+1),course_id:courses[i%12]._id,teacher_id:teachers[(i%12)%10]._id,
      classroom_id:classrooms[i%10]._id,starts_at:starts,ends_at:new Date(starts.getTime()+90*60000),
      topic:`Занятие ${Math.floor(i/12)+1}`,attendance_ids:enrollments.filter(e => e.course_id.equals(courses[i%12]._id)).map(e => e.student_id)};
  });
  const payments = Array.from({length:20},(_,i) => {
    const enrollment=enrollments[i],course=courses.find(c => c._id.equals(enrollment.course_id));
    return {_id:oid(18,i+1),enrollment_id:enrollment._id,student_id:enrollment.student_id,
      amount:NumberInt(i%2 ? Number(course.fee)/2 : Number(course.fee)),currency:'RUB',
      status:i%4===0 ? 'pending' : 'paid',paid_at:i%4===0 ? null : ISODate(`2026-08-${String(i+3).padStart(2,'0')}`),
      method:i%2 ? 'card' : 'transfer'};
  });
  for (const [name,docs] of Object.entries({departments,teachers,students,courses,enrollments,classrooms,lessons,payments})) {
    upsert(name,docs); print(`${university.getName()}.${name}: ${docs.length}`);
  }
  university.departments.createIndex({code:1},{unique:true});
  university.students.createIndex({card_number:1},{unique:true});
  university.courses.createIndex({code:1},{unique:true});
  university.enrollments.createIndex({student_id:1,course_id:1},{unique:true});
  university.enrollments.createIndex({course_id:1,status:1});
  university.lessons.createIndex({classroom_id:1,starts_at:1});
  university.payments.createIndex({enrollment_id:1,status:1});
})();
