import { useState } from "react";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Homepage";

function App() {
  // เช็กว่าเคย login ไว้ไหม (รีเฟรชหน้าแล้วไม่ต้อง login ใหม่)
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );

  const handleLogin = async ({ studentId, password }) => {
    // TODO: ต่อ API จริงตรงนี้ ถ้า login ไม่ผ่านให้ throw error
    // เช่น
    // const res = await fetch("URL_ของคุณ", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ studentId, password }),
    // });
    // if (!res.ok) throw new Error("รหัสนักศึกษาหรือรหัสผ่านไม่ถูกต้อง");

    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  // ปุ่ม Logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  return isLoggedIn ? (
    <Home onLogout={handleLogout} />
  ) : (
    <LoginPage onSubmit={handleLogin} />
  );
}

export default App;