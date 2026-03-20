import { useState } from "react";
import { Button } from "./components/ui/button";

const App = () => {
  const [userInfo, setUserInfo] = useState({
    name: "Jack",
    age: 26,
    gender: "male",
  });
  const handleUpdateUserInfo = () => {
    setUserInfo({
      ...userInfo,
      name: "Keesoon",
    });
  };
  return (
    <>
      <p>name: {userInfo.name}</p>
      <p>age: {userInfo.age}</p>
      <p>gender: {userInfo.gender}</p>
      <Button onClick={handleUpdateUserInfo}>Update UserInfo</Button>
    </>
  );
};
export default App;
