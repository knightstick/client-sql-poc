import { deleteTodoFromDb, saveDb } from "./dbService";
import { useAppDispatch } from "./store/hooks";
import { deleteTodo } from "./store/todosSlice";

interface TodoItemProps {
  task: string;
}

function TodoItem({ task }: TodoItemProps) {
  const dispatch = useAppDispatch()

  const handleDelete = async (taskToDelete: string) => {
    try {
      deleteTodoFromDb(taskToDelete);
      dispatch(deleteTodo(taskToDelete));
      await saveDb();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <li>
      <span>{task}</span>
      <button onClick={() => handleDelete(task)}>Delete</button>
    </li>
  )
}

export default TodoItem
