import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Link, Navigate } from "react-router-dom";
import Browse from "./pages/Browse";
import NowPlaying from "./pages/NowPlaying";

function TabNav() {
  const location = useLocation();
  return (
    <nav className="w-full flex justify-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black sticky top-0 z-50">
      <div className="flex gap-4 py-2">
        <Link
          to="/browse"
          className={`px-4 py-2 rounded-t font-semibold transition-colors duration-150 ${location.pathname === "/browse" ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-red-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"}`}
        >
          Browse
        </Link>
        <Link
          to="/now-playing"
          className={`px-4 py-2 rounded-t font-semibold transition-colors duration-150 ${location.pathname === "/now-playing" ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-red-400" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"}`}
        >
          Now Playing
        </Link>
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <>
      <TabNav />
      <Routes>
        <Route path="/browse" element={<Browse />} />
        <Route path="/now-playing" element={<NowPlaying />} />
        <Route path="/" element={<Navigate to="/browse" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
