import { useState } from "react";
import styles from "./CssModuleButtons.module.css";
import classNames from "classnames/bind";

const CssModuleButtons = () => {
  const initialButtons = [
    { id: 1, label: "Button 1", icon: "🔥", isDisabled: false },
    { id: 2, label: "Button 2", icon: "💧", isDisabled: false },
    { id: 3, label: "Button 3", icon: "🌱", isDisabled: true },
    { id: 4, label: "Button 4", icon: "⚡", isDisabled: false },
  ];
  return (
    <>
      <ButtonGroup initialButtons={initialButtons} />
    </>
  );
};
export default CssModuleButtons;

const ButtonGroup = ({
  initialButtons,
}: {
  initialButtons: {
    id: number;
    label: string;
    icon: string;
    isDisabled: boolean;
  }[];
}) => {
  const cx = classNames.bind(styles);
  const initialActiveStates: {
    [key: string]: boolean;
  } = {};
  initialButtons.forEach((btn) => {
    initialActiveStates[btn.id] = false;
  });
  console.log(
    `initialActiveStates:${JSON.stringify(initialActiveStates, null, 2)}`,
  );
  const [activeStates, setActiveStates] = useState(initialActiveStates);
  const handleToggleActiveButton = (id: number, isDisabled: boolean) => {
    if (isDisabled) return;
    setActiveStates((activeStates) => ({
      ...activeStates,
      [id]: !activeStates[id],
    }));
  };
  const handleResetActiveStates = () => {
    const resetActiveStates: { [key: string]: boolean } = {};
    initialButtons.forEach((btn) => {
      resetActiveStates[btn.id] = false;
    });
    setActiveStates(resetActiveStates);
  };
  return (
    <>
      <h1>Active Count: 0</h1>
      <div>
        {initialButtons.map((btn) => (
          <button
            key={btn.id}
            className={cx("button", {
              active: activeStates[btn.id],
              disabled: btn.isDisabled,
              highlight: btn.id === 2,
            })}
            onClick={() => handleToggleActiveButton(btn.id, btn.isDisabled)}
          >
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>
      <button className={cx("button")} onClick={handleResetActiveStates}>
        Reset
      </button>
    </>
  );
};
