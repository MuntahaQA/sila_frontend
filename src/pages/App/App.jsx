import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import HomePage from "../HomePage";
import AboutPage from "../AboutPage";
import ProgramsPage from "../ProgramsPage";
import LoginPage from "../LoginPage";
import SignupPage from "../SignupPage";
import ProfilePage from "../ProfilePage";
import DashboardPage from "../DashboardPage";
import "./App.css";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </AuthProvider>
  );
}