import { useReducer, type Dispatch } from "react";
import { Button } from "./ui/button";

type ActionType =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "RESET" };

const counterReducer = (count: number, action: ActionType): number => {
  switch (action.type) {
    case "INCREMENT":
      return count + 1;
    case "DECREMENT":
      return count - 1;
    case "RESET":
      return 0;
  }
};

const CounterUseReducer = () => {
  const [count, dispatch] = useReducer(counterReducer, 0);

  return (
    <>
      <CounterDisplay count={count} />
      <CounterButtons dispatch={dispatch} />
    </>
  );
};

export default CounterUseReducer;

const CounterDisplay = ({ count }: { count: number }) => {
  return <h1>{count}</h1>;
};

const CounterButtons = ({ dispatch }: { dispatch: Dispatch<ActionType> }) => {
  return (
    <>
      <Button onClick={() => dispatch({ type: "DECREMENT" })}>Decrement</Button>
      <Button onClick={() => dispatch({ type: "RESET" })}>Reset</Button>
      <Button onClick={() => dispatch({ type: "INCREMENT" })}>Increment</Button>
    </>
  );
};
