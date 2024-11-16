import initSqlJs, { Database } from "sql.js";
import sqlWasm from "/sql-wasm.wasm?url";

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
}

export const getTodosFromDb = (): string[] => {
  if (!db) throw new Error('Database not initialized');

  const res = db.exec('SELECT title FROM todos');
  if (res[0]) {
    return res[0].values.map(row => row[0] as string);
  }
  return [];
}

export const addTodoToDb = (title: string): void => {
  if (!db) throw new Error('Database not initialized');

  db.run('INSERT INTO todos (title) VALUES (?)', [title]);
}

export const deleteTodoFromDb = (title: string): void => {
  if (!db) throw new Error('Database not initialized');

  db.run('DELETE FROM todos WHERE title = ?', [title]);
}

export const updateTodoInDb = (oldTitle: string, newTitle: string): void => {
  if (!db) throw new Error
  db.run('UPDATE todos SET title = ? WHERE title = ?', [newTitle, oldTitle]);
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
