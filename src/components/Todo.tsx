import { useState } from "react";

type TodoItem = {
  id: number;
  text: string;
  completed: boolean;
};

const Todo = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // 추가
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text: input, completed: false },
    ]);
    setInput("");
  };

  // 삭제
  const handleDelete = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // 완료 토글
  const toggleComplete = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  // 수정 시작
  const startEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  // 수정 완료
  const submitEdit = (id: number) => {
    if (!editingText.trim()) return;

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text: editingText } : todo,
      ),
    );
    setEditingId(null);
    setEditingText("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Todo List</h1>
        <p className="text-gray-500 mb-4">
          Please enter your details to continue.
        </p>

        {/* 입력 */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter Todo List"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add
          </button>
        </form>

        {/* 리스트 */}
        <ul className="space-y-2">
          {todos.length === 0 ? (
            <li className="text-center text-gray-400">
              There are no registered tasks
            </li>
          ) : (
            todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
              >
                <div className="flex items-center gap-2 flex-1">
                  {/* 체크 */}
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="w-4 h-4"
                  />

                  {/* 텍스트 or 수정 input */}
                  {editingId === todo.id ? (
                    <input
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded"
                    />
                  ) : (
                    <span
                      className={`flex-1 ${
                        todo.completed
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {todo.text}
                    </span>
                  )}
                </div>

                {/* 버튼 영역 */}
                <div className="flex gap-2 ml-2">
                  {editingId === todo.id ? (
                    <button
                      onClick={() => submitEdit(todo.id)}
                      className="text-green-500 hover:text-green-700 text-sm"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEdit(todo)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default Todo;
