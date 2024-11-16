import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TodosState {
  items: string[];
}

const initialState: TodosState = {
  items: []
}

const todosSlice = createSlice({
  name: "todos",
  initialState,
  reducers: {
    setTodos(state, action: PayloadAction<string[]>) {
      state.items = action.payload;
    },
    addTodo(state, action: PayloadAction<string>) {
      state.items.push(action.payload);
    },
    deleteTodo(state, action: PayloadAction<string>) {
      state.items = state.items.filter(todo => todo !== action.payload);
    },
  },
})

export const { setTodos, addTodo, deleteTodo } = todosSlice.actions;
export default todosSlice.reducer;
