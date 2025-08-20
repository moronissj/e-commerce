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
            <Link className="nav-link d-inline text-white" to="/">Tienda{" "}</Link>
            <Link className="nav-link d-inline text-white" to="/gestion">Gestion</Link>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<Ventas />} />
            <Route path="/gestion" element={<Crud />} />
        </Routes>
      </div>
    </>
  );
}
