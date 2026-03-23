import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = path.resolve('database/database.db');
const schemaPath = path.resolve('database/schema.sql');
const seedPath = path.resolve('database/seed.sql');

const schema = fs.readFileSync(schemaPath, 'utf-8');
const seed = fs.readFileSync (seedPath, 'utf-8');

const db = new Database(dbPath);

db.exec(schema);

const propertyCount = db.prepare('SELECT COUNT(*) as count FROM property_list').get();

if (propertyCount.count === 0) {
    db.exec(seed);
}  

const inquiryCount = db.prepare('SELECT COUNT (*) as count FROM inquiries').get();

if (inquiryCount.count === 0)  {
    db.exec(seed);
}

export default db;

