import './App.css';

import { useEffect, useRef, useState } from 'react';
import { addTodoToDb, getTodosFromDb, initializeDb, saveDb } from './dbService';

function App() {
  const [todos, setTodos] = useState<string[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      await initializeDb();
      const tasks = getTodosFromDb();
      setTodos(tasks);
      inputRef.current?.focus();
    }
    loadData();
  }, []);

  const handleAddTodo = async () => {
    if (newTodo.trim() !== '') {
      addTodoToDb(newTodo);
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setNewTodo('');
      await saveDb();
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
            handleAddTodo();
          }
        }}
        placeholder='Enter a new task' />
      <button onClick={handleAddTodo}>Add Task</button>
      <ul>
        {todos.map((todo, i) => (
          <li key={i}>{todo}</li>
        ))}
      </ul>
    </>
  );
}

export default App;
