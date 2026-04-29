# Заводское ГТО

Платформа инженерных кейсов для школьников и студентов. Позволяет решать реальные производственные задачи от ведущих предприятий России.

## Стек технологий

- **Frontend**: React 18, React Router 6, Vite
- **Backend**: Node.js, Express
- **База данных**: SQLite
- **Авторизация**: JWT

## Структура проекта

```
factory-gto/
├── client/                 # React-приложение
│   ├── src/
│   │   ├── api/           # API-клиент
│   │   ├── components/    # UI-компоненты
│   │   ├── hooks/         # React-хуки
│   │   ├── layouts/       # Layout-компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── App.jsx        # Главный компонент
│   │   ├── App.css        # Глобальные стили
│   │   └── main.jsx       # Точка входа
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── src/
│   │   ├── database/      # SQLite схема и инициализация
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/        # API routes
│   │   ├── uploads/       # Загруженные файлы
│   │   └── index.js       # Точка входа
│   └── package.json
├── README.md
```

## Быстрый старт

### 1. Установка зависимостей

```bash
# Установка зависимостей сервера
cd server
npm install

# Установка зависимостей клиента
cd ../client
npm install
```

### 2. Инициализация базы данных

```bash
cd server
npm run init-db
```

### 3. Заполнение демо-данными (опционально)

```bash
cd server
npm run seed
```

### 4. Запуск

```bash
# Терминал 1: Сервер (порт 3001)
cd server
npm start

# Терминал 2: Клиент (порт 5173)
cd client
npm run dev
```

Откройте http://localhost:5173 в браузере.

## Демо-аккаунты

После запуска `npm run seed` доступны следующие аккаунты:

| Роль | Email | Пароль |
|------|-------|--------|
| Администратор | admin@factory-gto.ru | admin123 |
| Предприятие | hr@severstal.com | enterprise123 |
| Предприятие | career@gazprom.ru | enterprise123 |
| Участник | ivanov@school158.ru | participant123 |
| Участник | petrova@school45.ru | participant123 |

## API Endpoints

### Auth
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь

### Публичные
- `GET /api/cases` - Список кейсов
- `GET /api/cases/:id` - Детали кейса
- `GET /api/enterprises` - Список предприятий
- `GET /api/enterprises/:id` - Детали предприятия
- `GET /api/rating` - Рейтинг участников
- `GET /api/news` - Новости

### Участник
- `GET /api/participant/profile` - Профиль
- `PUT /api/participant/profile` - Обновить профиль
- `GET /api/participant/submissions` - Мои решения
- `POST /api/participant/submissions` - Отправить решение

### Предприятие
- `GET /api/enterprise/profile` - Профиль
- `POST /api/enterprise/cases` - Создать кейс
- `PUT /api/enterprise/cases/:id` - Редактировать кейс
- `GET /api/enterprise/cases/:id/submissions` - Решения кейса
- `POST /api/enterprise/submissions/:id/evaluate` - Оценить решение
- `GET /api/enterprise/analytics` - Аналитика

### Админ
- `GET /api/admin/users` - Пользователи
- `GET /api/admin/enterprises` - Предприятия
- `PATCH /api/admin/enterprises/:id/moderate` - Модерация
- `GET /api/admin/cases` - Кейсы
- `PATCH /api/admin/cases/:id/status` - Изменить статус

## Роли пользователей

- **participant** - Участник (школьник, студент)
- **enterprise** - Предприятие
- **admin** - Администратор

## Категории участников

- `school_8_9` - Школьники 8–9 класс
- `school_10_11` - Школьники 10–11 класс
- `spo` - Студенты СПО / Колледж
- `university` - Студенты ВУЗ

## Критерии оценки решений

Каждое решение оценивается по 5 критериям от 1 до 5 баллов:
- `elaboration` - Проработка
- `applicability` - Применимость
- `originality` - Оригинальность
- `technical_logic` - Техническая логика
- `presentation` - Презентация

Итоговый балл = сумма всех критериев (максимум 25).

## Разработка

```bash
# Сервер с hot-reload
cd server
npm run dev

# Клиент с hot-reload
cd client
npm run dev
```

## Лицензия

MIT