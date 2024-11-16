import initSqlJs, { Database } from "sql.js";
import sqlWasm from "/sql-wasm.wasm?url";

export interface Todo {
  id: number;
  global_id: string;
  title: string;
}

let db: Database | null = null

export const initializeDb = async (): Promise<void> => {
  const SQL = await initSqlJs({ locateFile: () => sqlWasm });

  if ('storage' in navigator && 'getDirectory' in navigator.storage) {
    console.log('Using persistent database');

    const dirHandle = await navigator.storage.getDirectory();
    const fileHandle = await dirHandle.getFileHandle('todos.db', { create: true });
    const file = await fileHandle.getFile();
    const arrayBuffer = await file.arrayBuffer();

    if (arrayBuffer.byteLength > 0) {
      console.log('Loading existing database');
      db = new SQL.Database(new Uint8Array(arrayBuffer));
    } else {
      console.log('Creating new database');
      db = new SQL.Database();
    }
  } else {
    console.log('Fallback to in-memory database');
    db = new SQL.Database();
  }

  db.run('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT)');

  const tableExists = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='todos'");
  if (tableExists[0]?.values.length === 0) {
    // Table does not exist; create it with 'global_id' column
    db.run(`
      CREATE TABLE todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        global_id TEXT NOT NULL,
        title TEXT
      );
    `);
  } else {
    // Table exists; check if 'global_id' column exists
    const res = db.exec("PRAGMA table_info(todos)");
    const columns = res[0]?.values.map(([_, name]) => name);
    if (!columns.includes('global_id')) {
      // Perform migration to add 'global_id' column
      migrateDb();
    }
  }
}

export const getTodosFromDb = (): Todo[] => {
  if (!db) throw new Error('Database not initialized');

  const res = db.exec('SELECT id, global_id, title FROM todos');
  if (res[0]) {
    const rows = res[0].values
    return rows.map(row => ({
      id: row[0] as number,
      global_id: row[1] as string,
      title: row[2] as string
    }))
  }
  return [];
}

export const addTodoToDb = (title: string): Todo => {
  if (!db) throw new Error('Database not initialized');

  const guid = generateGUID();

  db.run('INSERT INTO todos (global_id, title) VALUES (?, ?)', [guid, title]);

  const res = db.exec('SELECT last_insert_rowid()');
  const id = res[0].values[0][0] as number;

  return { id, global_id: guid, title };
}

export const deleteTodoFromDb = (id: number): void => {
  if (!db) throw new Error('Database not initialized');

  db.run('DELETE FROM todos WHERE id = ?', [id]);
}

export const updateTodoInDb = (id: number, newTitle: string): void => {
  if (!db) throw new Error
  db.run('UPDATE todos SET title = ? WHERE id = ?', [newTitle, id]);
}

export const saveDb = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  if ('storage' in navigator && 'getDirectory' in navigator.storage) {
    const dirHandle = await navigator.storage.getDirectory();
    const fileHandle = await dirHandle.getFileHandle('todos.db', { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(db.export());
    await writable.close();
  }
}

const migrateDb = (): void => {
  db!.run("BEGIN TRANSACTION");

  try {
    db!.run("ALTER TABLE todos ADD COLUMN global_id TEXT");

    // Generate GUIDs for existing rows
    const res = db!.exec("SELECT id FROM todos");
    const ids = res[0].values.map(row => row[0] as number)

    ids.forEach(id => {
      const guid = generateGUID();
      db!.run("UPDATE todos SET global_id = ? WHERE id = ?", [guid, id]);
    })

    db!.run("COMMIT");
  } catch (error) {
    db!.run("ROLLBACK");
    console.error(error);
  }
}

const generateGUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

