import { useState } from "react";
import { deleteTodoFromDb, saveDb, updateTodoInDb } from "./dbService";
import { useAppDispatch } from "./store/hooks";
import { deleteTodo, updateTodo } from "./store/todosSlice";

interface TodoItemProps {
  task: string;
}

function TodoItem({ task }: TodoItemProps) {
  const dispatch = useAppDispatch()
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const handleDelete = async () => {
    try {
      deleteTodoFromDb(task);
      dispatch(deleteTodo(task));
      await saveDb();
    } catch (error) {
      console.error(error);
    }
  }

  const handleEdit = () => {
    setIsEditing(true);
  }

  const handleCancelEdit = () => {
    setEditedTask(task); // Reset the edited task to the original task
    setIsEditing(false);
  }

  const handleSaveEdit = async () => {
    if (editedTask.trim() === '') {
      alert("Todo cannot be empty");
      return
    }
    try {
      updateTodoInDb(task, editedTask);
      dispatch(updateTodo({ oldTask: task, newTask: editedTask }));
      await saveDb();
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  }

  return (
    <li>
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedTask}
            onChange={e => setEditedTask(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button onClick={handleSaveEdit}>Save</button>
          <button onClick={handleCancelEdit}>Cancel</button>
        </>
      ) : (
        <>
          <span>{task}</span>
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </>
      )}
    </li>
  )
}

export default TodoItem
