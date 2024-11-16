import { useEffect, useState } from 'react';
import initSqlJs, { Database } from 'sql.js';
import sqlWasm from '/sql-wasm.wasm?url';

import './App.css';

function App() {
  const [db, setDb] = useState<Database | null>(null);
  const [todos, setTodos] = useState<string[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const loadDb = async () => {
      const SQL = await initSqlJs({ locateFile: () => sqlWasm });
      let db: Database;

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

      // Create a table
      db.run('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT)');
      setDb(db);
      loadTodos(db);
    };
    loadDb();
  }, []);

  const loadTodos = (db: Database) => {
    const res = db.exec('SELECT title FROM todos');
    if (res[0]) {
      const titles = res[0].values.map(row => row[0] as string);
      setTodos(titles);
    }
  }

  const saveDb = async (db: Database) => {
    if ('storage' in navigator && 'getDirectory' in navigator.storage) {
      const dirHandle = await navigator.storage.getDirectory();
      const fileHandle = await dirHandle.getFileHandle('todos.db', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(db.export());
      await writable.close();
    }
  }

  const addTodo = async () => {
    if (db && newTodo.trim() !== '') {
      db.run('INSERT INTO todos (title) VALUES (?)', [newTodo]);
      setTodos([...todos, newTodo]);
      setNewTodo('')
      await saveDb(db);
    }
  }

  return (
    <>
      <h1>Client SQL POC</h1>
      <input
        type="text"
        value={newTodo}
        onChange={e => setNewTodo(e.target.value)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTodo();
          }
        }}
        placeholder='Enter a new task' />
      <button onClick={addTodo}>Add Task</button>
      <ul>
        {todos.map((todo, i) => (
          <li key={i}>{todo}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
