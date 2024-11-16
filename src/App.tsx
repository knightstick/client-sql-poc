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
      const db = new SQL.Database();
      // Create a table
      db.run('CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT)');
      setDb(db);
      loadTodos();
    };
    loadDb();
  }, []);

  const loadTodos = () => {
    const res = db?.exec('SELECT title FROM todos');
    if (res && res[0]) {
      const titles = res[0].values.map(row => row[0] as string);
      setTodos(titles);
    }
  }

  const addTodo = () => {
    if (db && newTodo.trim() !== '') {
      db.run('INSERT INTO todos (title) VALUES (?)', [newTodo]);
      setTodos([...todos, newTodo]);
      setNewTodo('')
    }
  }

  return (
    <>
      <h1>Client SQL POC</h1>
      <input
        type="text"
        value={newTodo}
        onChange={e => setNewTodo(e.target.value)}
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
