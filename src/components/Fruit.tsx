import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { v4 as uuidv4 } from "uuid";

type Fruit = {
  id: string;
  value: string;
};

const Fruit = () => {
  const items = ["사과", "배", "오렌지"];

  const [fruits, setFruits] = useState<Fruit[]>(() =>
    items.map((item) => ({
      id: uuidv4(),
      value: item,
    })),
  );

  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleFruitAdd = () => {
    if (!input.trim()) return;

    setFruits((prev) => [...prev, { id: uuidv4(), value: input }]);
    setInput("");
  };

  const handleFruitDelete = (id: string) => {
    setFruits((prev) => prev.filter((fruit) => fruit.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleFruitAdd();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardContent className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-center">🍎 Fruit List</h1>

          <div className="flex gap-2">
            <Input
              placeholder="과일을 입력하세요..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />

            <Button disabled={!input.trim()} onClick={handleFruitAdd}>
              추가
            </Button>
          </div>

          <ul className="space-y-2">
            {fruits.length === 0 ? (
              <p className="text-center text-gray-400">
                과일을 추가해보세요 🍊
              </p>
            ) : (
              fruits.map((fruit) => (
                <li
                  key={fruit.id}
                  className="group flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <span>{fruit.value}</span>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition"
                    onClick={() => handleFruitDelete(fruit.id)}
                  >
                    삭제
                  </Button>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
export default Fruit;
