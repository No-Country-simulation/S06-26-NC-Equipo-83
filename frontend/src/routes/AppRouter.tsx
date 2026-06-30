import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../modules/landing/Landing";
import Login from "../modules/auth/login";
import Register from "../modules/auth/register";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}