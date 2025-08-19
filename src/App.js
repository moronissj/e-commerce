import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Crud from "./Crud";
import Ventas from "./Ventas";

export default function App() {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/">Ferretería</Link>
          <div>
            <Link className="nav-link d-inline text-white" to="/">CRUD</Link>
            <Link className="nav-link d-inline text-white" to="/ventas">Ventas</Link>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Crud />} />
          <Route path="/ventas" element={<Ventas />} />
        </Routes>
      </div>
    </>
  );
}
