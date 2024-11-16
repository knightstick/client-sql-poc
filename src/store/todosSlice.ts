import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Todo } from "../dbService";

interface TodosState {
  items: Todo[];
}

const initialState: TodosState = {
  items: []
}

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    setTodos(state, action: PayloadAction<Todo[]>) {
      state.items = action.payload;
    },
    addTodo(state, action: PayloadAction<Todo>) {
      state.items.push(action.payload);
    },
    deleteTodo(state, action: PayloadAction<number>) {
      state.items = state.items.filter(todo => todo.id !== action.payload);
    },
    updateTodo(state, action: PayloadAction<{ id: number, newTask: string }>) {
      const todo = state.items.find(todo => todo.id === action.payload.id);
      if (todo) {
        todo.title = action.payload.newTask;
      }
    }
  },
})

export const { setTodos, addTodo, deleteTodo, updateTodo } = todosSlice.actions;
export default todosSlice.reducer;
