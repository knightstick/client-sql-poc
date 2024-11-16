import './App.css';

import { useEffect, useRef, useState } from 'react';
import { addTodoToDb, getTodosFromDb, initializeDb, saveDb } from './dbService';

function App() {
  const [todos, setTodos] = useState<string[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeDb();
        const tasks = getTodosFromDb();
        setTodos(tasks);
        inputRef.current?.focus();
      } catch (error) {
        setError('Failed to load data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddTodo = async () => {
    if (newTodo.trim() !== '') {
      try {
        addTodoToDb(newTodo);
        setTodos(prevTodos => [...prevTodos, newTodo]);
        setNewTodo('');
        await saveDb();
      } catch (error) {
        setError('Failed to add task');
        console.error(error);
      }
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1>Client SQL POC</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
