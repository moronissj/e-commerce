import React, { useState, useEffect } from "react";
import app from "./firebase"; // tu firebase.js
import { getDatabase, ref, onValue } from "firebase/database";

const Ventas = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    const db = getDatabase(app);
    const productosRef = ref(db, "herramientas");
    onValue(productosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProductos(
          Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        );
      } else setProductos([]);
      setLoading(false);
    });
  }, []);

  const abrirModal = (producto) => {
    setSelectedProducto(producto);
    setCantidad(1);
    setModalOpen(true);
  };

  const agregarAlCarrito = () => {
    const existente = carrito.find((p) => p.id === selectedProducto.id);
    if (existente) {
      setCarrito(
        carrito.map((p) =>
          p.id === selectedProducto.id
            ? { ...p, cantidad: p.cantidad + cantidad }
            : p
        )
      );
    } else {
      setCarrito([...carrito, { ...selectedProducto, cantidad }]);
    }
    setModalOpen(false);
  };

  const enviarWhatsApp = () => {
    if (carrito.length === 0) return;
    const texto = carrito
      .map((p) => `${p.herramienta} x${p.cantidad} - $${p.precio}`)
      .join("%0A");
    window.open(`https://wa.me/527773848165?text=${texto}`, "_blank");
  };

  if (loading) return <p>Cargando productos...</p>;

  return (
    <div className="container mt-4">
      <h2>Productos</h2>
      <div className="row">
        {productos.map((prod) => (
          <div className="col-md-3 mb-3" key={prod.id}>
            <div className="card h-100">
              <img
                src={prod.imagenUrl}
                className="card-img-top"
                alt={prod.herramienta}
                style={{ height: "150px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">{prod.herramienta}</h5>
                <p className="card-text">${prod.precio}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => abrirModal(prod)}
                >
                  Añadir al carrito
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && selectedProducto && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedProducto.herramienta}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <img
                  src={selectedProducto.imagenUrl}
                  alt={selectedProducto.herramienta}
                  className="img-fluid mb-3"
                />
                <p>Precio: ${selectedProducto.precio}</p>
                <label>Cantidad:</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={agregarAlCarrito}>
                  Añadir al carrito
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {carrito.length > 0 && (
        <div className="fixed-bottom bg-light p-3 d-flex justify-content-between align-items-center border-top">
          <span>Productos en carrito: {carrito.length}</span>
          <button className="btn btn-success" onClick={enviarWhatsApp}>
            Comprar por WhatsApp
          </button>
        </div>
      )}
    </div>
  );
};

export default Ventas;
