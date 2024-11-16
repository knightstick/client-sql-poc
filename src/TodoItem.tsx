import { useState } from "react";
import { deleteTodoFromDb, saveDb, Todo, updateTodoInDb } from "./dbService";
import { useAppDispatch } from "./store/hooks";
import { deleteTodo, updateTodo } from "./store/todosSlice";

interface TodoItemProps {
  task: Todo;
}

function TodoItem({ task }: TodoItemProps) {
  const dispatch = useAppDispatch()
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);

  const handleDelete = async () => {
    try {
      deleteTodoFromDb(task.id);
      dispatch(deleteTodo(task.id));
      await saveDb();
    } catch (error) {
      console.error(error);
    }
  }

  const handleEdit = () => {
    setIsEditing(true);
  }

  const handleCancelEdit = () => {
    setEditedTitle(task.title); // Reset the edited task to the original task
    setIsEditing(false);
  }

  const handleSaveEdit = async () => {
    if (editedTitle.trim() === '') {
      alert("Todo cannot be empty");
      return
    }
    try {
      updateTodoInDb(task.id, editedTitle);
      dispatch(updateTodo({ id: task.id, newTask: editedTitle }));
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
            value={editedTitle}
            onChange={e => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button onClick={handleSaveEdit}>Save</button>
          <button onClick={handleCancelEdit}>Cancel</button>
        </>
      ) : (
        <>
          <span>{task.title}</span>
          <button onClick={handleEdit}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </>
      )}
    </li>
  )
}

export default TodoItem
