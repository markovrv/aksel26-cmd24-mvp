import Database from 'sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database.Database(join(__dirname, 'app.db'));

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function seed() {
    console.log('Starting seed...');

    // Admin
    const adminHash = await bcrypt.hash('admin123', 10);
    await run(`INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)`,
        ['admin@factory-gto.ru', adminHash, 'admin', 'active']);
    console.log('Admin created');

    // Enterprises
    const enterprises = [
        {
            email: 'hr@severstal.com',
            password: 'enterprise123',
            company_name: 'Северсталь',
            region: 'Череповец, Вологодская область',
            description: 'Крупнейшая горнодобывающая и металлургическая компания России. Инвестируем в развитие молодых специалистов и инновационные проекты.',
            contact_person: 'Алексей Петров'
        },
        {
            email: 'career@gazprom.ru',
            password: 'enterprise123',
            company_name: 'Газпром',
            region: 'Москва',
            description: 'Государственная энергетическая компания, лидер газовой отрасли. Реализуем программы развития кадрового потенциала.',
            contact_person: 'Мария Иванова'
        },
        {
            email: 'hr@rosatom.ru',
            password: 'enterprise123',
            company_name: 'Росатом',
            region: 'Москва',
            description: 'Государственная корпорация по атомной энергии. Приглашаем талантливых студентов и школьников для участия в реальных проектах.',
            contact_person: 'Дмитрий Соколов'
        }
    ];

    const enterpriseIds = [];
    for (const ent of enterprises) {
        const hash = await bcrypt.hash(ent.password, 10);
        const userResult = await run(`INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)`,
            [ent.email, hash, 'enterprise', 'active']);
        const userId = userResult.lastID;
        enterpriseIds.push(userId);

        await run(`INSERT INTO enterprise_profiles (user_id, company_name, region, description, contact_person, moderation_status)
                VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, ent.company_name, ent.region, ent.description, ent.contact_person, 'approved']);
    }
    console.log('Enterprises created');

    // Participants
    const participants = [
        { email: 'ivanov@school158.ru', password: 'participant123', full_name: 'Иванов Алексей Сергеевич', education_org: 'Школа №158', category: 'school_10_11', region: 'Москва', contact_consent: 1 },
        { email: 'petrova@school45.ru', password: 'participant123', full_name: 'Петрова Мария Дмитриевна', education_org: 'Гимназия №45', category: 'school_10_11', region: 'Санкт-Петербург', contact_consent: 1 },
        { email: 'smirnov@college.ru', password: 'participant123', full_name: 'Смирнов Андрей Владимирович', education_org: 'Колледж энергетики и машиностроения', category: 'spo', region: 'Екатеринбург', contact_consent: 1 },
        { email: 'kozlova@uni.ru', password: 'participant123', full_name: 'Козлова Елена Александровна', education_org: 'МГТУ им. Баумана', category: 'university', region: 'Москва', contact_consent: 1 },
        { email: 'fedorov@school.ru', password: 'participant123', full_name: 'Федоров Дмитрий Игоревич', education_org: 'Школа №201', category: 'school_8_9', region: 'Новосибирск', contact_consent: 1 },
        { email: 'volkov@college2.ru', password: 'participant123', full_name: 'Волков Сергей Петрович', education_org: 'Политехнический колледж', category: 'spo', region: 'Казань', contact_consent: 1 },
        { email: 'novikova@uni2.ru', password: 'participant123', full_name: 'Новикова Анна Сергеевна', education_org: 'СПбПУ', category: 'university', region: 'Санкт-Петербург', contact_consent: 1 },
        { email: 'morozov@school88.ru', password: 'participant123', full_name: 'Морозов Игорь Олегович', education_org: 'Школа №88', category: 'school_10_11', region: 'Москва', contact_consent: 1 },
        { email: 'voronova@college3.ru', password: 'participant123', full_name: 'Воронова Ольга Николаевна', education_org: 'Колледж информатики', category: 'spo', region: 'Красноярск', contact_consent: 1 },
        { email: 'solovev@uni3.ru', password: 'participant123', full_name: 'Соловьев Павел Андреевич', education_org: 'МФТИ', category: 'university', region: 'Москва', contact_consent: 1 },
        { email: 'kuznetsov@school5.ru', password: 'participant123', full_name: 'Кузнецов Артём Максимович', education_org: 'Школа №5', category: 'school_8_9', region: 'Челябинск', contact_consent: 1 },
        { email: 'pavlova@school32.ru', password: 'participant123', full_name: 'Павлова Виктория Денисовна', education_org: 'Школа №32', category: 'school_10_11', region: 'Ростов-на-Дону', contact_consent: 1 }
    ];

    const participantIds = [];
    for (const p of participants) {
        const hash = await bcrypt.hash(p.password, 10);
        const userResult = await run(`INSERT INTO users (email, password_hash, role, status) VALUES (?, ?, ?, ?)`,
            [p.email, hash, 'participant', 'active']);
        const userId = userResult.lastID;
        participantIds.push(userId);

        await run(`INSERT INTO participant_profiles (user_id, full_name, education_org, category, region, contact_consent)
                VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, p.full_name, p.education_org, p.category, p.region, p.contact_consent]);
    }
    console.log('Participants created');

    // Cases
    const cases = [
        {
            enterprise_idx: 0,
            title: 'Оптимизация маршрута транспортировки стали между цехами',
            short_description: 'Разработайте математическую модель для сокращения времени транспортировки жидкой стали между сталеплавильным и прокатным цехами.',
            full_description: 'Требуется разработать модель оптимизации маршрутов внутризаводского транспорта для перевозки жидкой стали. Необходимо учесть: множественность маршрутов, пропускную способность дорог, время разгрузки/погрузки, безопасность перевозок.',
            requirements: 'Решение должно содержать: математическую модель, описание алгоритма, программную реализацию (Python/MATLAB), тестовые расчёты.',
            deadline: '2026-06-15',
            categories: ['school_10_11', 'spo', 'university']
        },
        {
            enterprise_idx: 0,
            title: 'Система мониторинга износа прокатных валков',
            short_description: 'Создайте проект системы контроля состояния прокатных валков с использованием датчиков и аналитики данных.',
            full_description: 'Разработайте концепцию системы мониторинга износа прокатных валков в реальном времени. Система должна собирать данные с датчиков вибрации, температуры, давления и анализировать их с помощью ML-моделей.',
            requirements: 'Проект системы с обоснованием выбора датчиков, архитектурой, схемой размещения и описанием ML-алгоритмов.',
            deadline: '2026-06-20',
            categories: ['university', 'spo']
        },
        {
            enterprise_idx: 1,
            title: 'Модель прогнозирования потребления газа',
            short_description: 'Разработайте ML-модель для краткосрочного прогнозирования потребления газа населённым пунктом.',
            full_description: 'Необходимо создать модель машинного обучения для прогнозирования потребления газа на 24-72 часа вперёд. Данные включают исторические показания, температуру воздуха, день недели, праздничные дни.',
            requirements: 'Код модели на Python (scikit-learn, pandas), описание модели, метрики качества, визуализация результатов.',
            deadline: '2026-05-30',
            categories: ['university']
        },
        {
            enterprise_idx: 1,
            title: 'Проект системы автоматизированного учёта газа',
            short_description: 'Разработайте концепцию умного счётчика газа с функцией дистанционной передачи данных.',
            full_description: 'Создайте проект системы автоматизированного коммерческого учёта газа (АСКУГ) для многоквартирного дома. Система должна собирать данные с умных счётчиков и передавать по LoRaWAN.',
            requirements: 'Схема архитектуры, перечень оборудования, обоснование выбора технологий.',
            deadline: '2026-06-25',
            categories: ['school_10_11', 'spo', 'university']
        },
        {
            enterprise_idx: 2,
            title: 'Расчёт теплового баланса ядерного реактора ВВЭР',
            short_description: 'Выполните расчёт теплового баланса реактора ВВЭР-1200 для номинального режима работы.',
            full_description: 'Необходимо выполнить инженерный расчёт теплового баланса реактора ВВЭР-1200. Расчёт включает определение мощности реактора, расчёт тепловыделения в активной зоне, расчёт теплоотдачи к теплоносителю.',
            requirements: 'Расчётно-пояснительная записка с формулами, таблицами результатов, выводами.',
            deadline: '2026-07-10',
            categories: ['university']
        },
        {
            enterprise_idx: 2,
            title: 'Модель радиационной защиты для АЭС',
            short_description: 'Разработайте упрощённую модель расчёта радиационной защиты персонала АЭС.',
            full_description: 'Создайте упрощённую модель для оценки доз облучения персонала на АЭС. Модель должна учитывать геометрию защиты, свойства материалов, время работы в зоне, тип излучения.',
            requirements: 'Расчётная модель (Excel/Python), описание методики, пример расчёта.',
            deadline: '2026-06-30',
            categories: ['spo', 'university']
        },
        {
            enterprise_idx: 0,
            title: 'Автоматизация контроля качества металлопроката',
            short_description: 'Предложите систему автоматического обнаружения дефектов на поверхности металлопроката.',
            full_description: 'Разработайте концепцию системы технического зрения для контроля качества металлопроката. Система должна обнаруживать поверхностные дефекты, классифицировать типы дефектов и формировать отчёты для ОТК.',
            requirements: 'Описание системы, обоснование выбора оборудования, архитектура ПО, оценка точности.',
            deadline: '2026-07-05',
            categories: ['school_10_11', 'spo', 'university']
        },
        {
            enterprise_idx: 1,
            title: 'Оптимизация работы газораспределительной станции',
            short_description: 'Разработайте модель оптимального режима работы ГРС с учётом сезонных колебаний.',
            full_description: 'Создайте модель оптимизации работы газораспределительной станции (ГРС) для снижения энергопотребления. Необходимо учесть переменную нагрузку, сезонные колебания, ограничения по давлению.',
            requirements: 'Математическая модель, алгоритм оптимизации, примеры расчётов.',
            deadline: '2026-06-18',
            categories: ['university']
        },
        {
            enterprise_idx: 2,
            title: 'Цифровой двойник насосной станции АЭС',
            short_description: 'Разработайте концепцию цифрового двойника насосной станции системы безопасности АЭС.',
            full_description: 'Создайте проект цифрового двойника насосной станции аварийного охлаждения АЭС. Двойник должен воспроизводить поведение реальной станции и прогнозировать состояние оборудования.',
            requirements: 'Архитектура системы, описание математических моделей, обоснование выбора технологий.',
            deadline: '2026-07-15',
            categories: ['university']
        },
        {
            enterprise_idx: 0,
            title: 'Энергоаудит доменной печи',
            short_description: 'Проведите энергетический аудит доменной печи и предложите меры по повышению эффективности.',
            full_description: 'Необходимо выполнить энергетический аудит доменной печи. Задачи: собрать и проанализировать данные о потреблении энергии, определить источники потерь, рассчитать энергоэффективность.',
            requirements: 'Отчёт об аудите с расчётами, диаграммами энергопотребления, рекомендациями.',
            deadline: '2026-06-22',
            categories: ['spo', 'university']
        }
    ];

    const caseIds = [];
    for (const c of cases) {
        const enterpriseId = enterpriseIds[c.enterprise_idx];
        const result = await run(`INSERT INTO cases (enterprise_id, title, short_description, full_description, requirements, deadline, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [enterpriseId, c.title, c.short_description, c.full_description, c.requirements, c.deadline, 'open']);
        const caseId = result.lastID;
        caseIds.push(caseId);

        for (const cat of c.categories) {
            await run('INSERT INTO case_category_links (case_id, category) VALUES (?, ?)', [caseId, cat]);
        }
    }
    console.log('Cases created');

    // Submissions with evaluations
    const submissions = [
        { case_idx: 0, participant_idx: 0, text_answer: 'Предлагаю использовать модифицированный алгоритм Дейкстры с учётом временных окон.', status: 'reviewed' },
        { case_idx: 0, participant_idx: 3, text_answer: 'Разработана имитационная модель на AnyLogic. Маршруты оптимизированы с помощью генетического алгоритма.', status: 'reviewed' },
        { case_idx: 1, participant_idx: 3, text_answer: 'Система мониторинга на базе IoT-платформы. Датчики передают данные в облако.', status: 'reviewed' },
        { case_idx: 2, participant_idx: 3, text_answer: 'Модель на базе XGBoost. MAPE = 4.2%.', status: 'reviewed' },
        { case_idx: 3, participant_idx: 2, text_answer: 'Проект АСКУГ на базе счётчиков СГМН и LoRaWAN шлюзов.', status: 'under_review' },
        { case_idx: 4, participant_idx: 3, text_answer: 'Выполнен расчёт теплового баланса реактора ВВЭР-1200.', status: 'reviewed' },
        { case_idx: 5, participant_idx: 6, text_answer: 'Разработана таблица для расчёта доз с учётом слоистой защиты.', status: 'under_review' },
        { case_idx: 6, participant_idx: 4, text_answer: 'Концепция системы на базе камер Basler и CNN для детекции дефектов.', status: 'submitted' },
        { case_idx: 7, participant_idx: 9, text_answer: 'Оптимизационная модель на Python с использованием PuLP.', status: 'reviewed' },
        { case_idx: 8, participant_idx: 3, text_answer: 'Архитектура цифрового двойника на базе OPC UA и графовой базы данных.', status: 'submitted' }
    ];

    for (const s of submissions) {
        const caseId = caseIds[s.case_idx];
        const participantId = participantIds[s.participant_idx];
        const result = await run(`INSERT INTO submissions (case_id, participant_id, text_answer, status)
                VALUES (?, ?, ?, ?)`,
            [caseId, participantId, s.text_answer, s.status]);
        const submissionId = result.lastID;

        if (s.status === 'reviewed') {
            await run(`INSERT INTO evaluations (submission_id, reviewer_enterprise_id, total_score, comment)
                    VALUES (?, ?, ?, ?)`,
                [submissionId, enterpriseIds[cases[s.case_idx].enterprise_idx], Math.floor(Math.random() * 10) + 16, 'Хорошая работа']);
            const evalRow = await get('SELECT id FROM evaluations WHERE submission_id = ?', [submissionId]);
            if (evalRow) {
                await run(`INSERT INTO evaluation_scores (evaluation_id, elaboration, applicability, originality, technical_logic, presentation)
                        VALUES (?, ?, ?, ?, ?, ?)`,
                    [evalRow.id, 3 + Math.floor(Math.random() * 3), 3 + Math.floor(Math.random() * 3), 3 + Math.floor(Math.random() * 3), 3 + Math.floor(Math.random() * 3), 3 + Math.floor(Math.random() * 3)]);
            }
        }
    }
    console.log('Submissions created');

    // News
    const newsItems = [
        { title: 'Открыт набор кейсов на весенний семестр 2026', summary: 'Более 30 новых инженерных кейсов от ведущих предприятий России.', content: 'Студенты и школьники могут выбрать кейсы из различных отраслей.', published_at: '2026-04-01' },
        { title: 'Подведены итоги зимнего хакатона', summary: 'Команда МГТУ им. Баумана заняла первое место.', content: 'В хакатоне приняли участие 450 студентов из 23 регионов России.', published_at: '2026-02-15' },
        { title: 'Новые партнёры платформы', summary: 'Росатом и Газпром присоединились к платформе.', content: 'Теперь участники смогут решать реальные задачи атомной и газовой промышленности.', published_at: '2026-01-20' },
        { title: 'Методические рекомендации для участников', summary: 'Опубликованы советы по подготовке решений.', content: 'Эксперты Северстали и Росатома подготовили рекомендации.', published_at: '2025-12-10' },
        { title: 'Рейтинг участников за 2025 год', summary: 'Опубликован итоговый рейтинг участников.', content: 'В рейтинг вошло 280 участников из 45 регионов России.', published_at: '2025-12-01' }
    ];

    for (const n of newsItems) {
        await run(`INSERT INTO news (title, summary, content, published_at) VALUES (?, ?, ?, ?)`,
            [n.title, n.summary, n.content, n.published_at]);
    }
    console.log('News created');

    console.log('Seed completed successfully!');
}

seed().catch(console.error).finally(() => db.close());