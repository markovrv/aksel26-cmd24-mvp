import Database from 'sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database.Database(join(__dirname, 'app.db'));

const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');

db.exec(schema, (err) => {
    if (err) {
        console.error('Error initializing database:', err.message);
        process.exit(1);
    }
    console.log('Database initialized successfully');
    db.close();
});