import React, { useState, useEffect } from 'react';
import app from './firebase'; // 👈 usa la instancia centralizada
import { getDatabase, ref, onValue, push, update, remove } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';


// Componente principal de la aplicación
const Crud = () => {
    // Definición de estados
    const [data, setData] = useState([]);
    const [modalInsertar, setModalInsertar] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalEliminar, setModalEliminar] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        herramienta: '',
        marca: '',
        modelo: '',
        precio: '',
        imagenUrl: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [id, setId] = useState(null);
    const [db, setDb] = useState(null);
    const [storage, setStorage] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Inicialización de Firebase y autenticación
useEffect(() => {
  const authInstance = getAuth(app);
  const database = getDatabase(app);
  const storageInstance = getStorage(app);

  setDb(database);
  setStorage(storageInstance);

  const authenticateUser = async () => {
    try {
      if (typeof window.__initial_auth_token !== 'undefined') {
        await signInWithCustomToken(authInstance, window.__initial_auth_token);
      } else {
        await signInAnonymously(authInstance);
      }
    } catch (error) {
      console.error("Error during Firebase authentication:", error);
    }
  };

  const unsubscribe = onAuthStateChanged(authInstance, (user) => {
    setCurrentUser(user);
    setIsAuthReady(true);
  });

  authenticateUser();
  return () => unsubscribe();
}, []);


    // Escucha los cambios en la base de datos una vez que la autenticación esté lista
    useEffect(() => {
        if (db && isAuthReady) {
            try {
                const herramientasRef = ref(db, 'herramientas');
                const unsubscribe = onValue(herramientasRef, (snapshot) => {
                    const herramientas = snapshot.val();
                    if (herramientas) {
                        const dataArray = Object.keys(herramientas).map(key => ({
                            id: key,
                            ...herramientas[key]
                        }));
                        setData(dataArray);
                    } else {
                        setData([]);
                    }
                    setLoading(false);
                });
                return () => unsubscribe();
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        }
    }, [db, isAuthReady]);

    // Maneja los cambios en los inputs del formulario
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // Maneja la selección del archivo de imagen
    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    // Función para subir la imagen a Firebase Storage
    const uploadImage = async () => {
        if (!imageFile || !storage) {
            console.error("No se ha seleccionado una imagen o el almacenamiento no está disponible.");
            return null;
        }

        try {
            const fileExtension = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
            const fileRef = storageRef(storage, `images/${fileName}`);
            
            await uploadBytes(fileRef, imageFile);
            const url = await getDownloadURL(fileRef);
            return url;
        } catch (error) {
            console.error("Error al subir la imagen:", error);
            return null;
        }
    };

    // Petición POST: crear un nuevo registro
    const peticionPost = async () => {
        let imageUrl = '';
        if (imageFile) {
            imageUrl = await uploadImage();
            if (!imageUrl) {
                return;
            }
        }

        const newForm = { ...form, imagenUrl: imageUrl };
        push(ref(db, 'herramientas'), newForm)
            .then(() => {
                setModalInsertar(false);
                resetForm();
            })
            .catch(error => console.error(error));
    };

    // Petición PUT: actualizar un registro existente
    const peticionPut = async () => {
        let imageUrl = form.imagenUrl;
        
        if (imageFile) {
            imageUrl = await uploadImage();
            if (!imageUrl) {
                return;
            }
        }

        const updatedForm = { ...form, imagenUrl: imageUrl };
        update(ref(db, `herramientas/${id}`), updatedForm)
            .then(() => {
                setModalEditar(false);
                resetForm();
            })
            .catch(error => console.error(error));
    };

    // Petición DELETE: eliminar un registro
    const peticionDelete = () => {
        remove(ref(db, `herramientas/${id}`))
            .then(() => {
                setModalEliminar(false);
                resetForm();
            })
            .catch(error => console.error(error));
    };

    // Resetea el formulario y la imagen seleccionada
    const resetForm = () => {
        setForm({
            herramienta: '',
            marca: '',
            modelo: '',
            precio: '',
            imagenUrl: ''
        });
        setImageFile(null);
    };

    // Selecciona una herramienta para editar o eliminar
    const seleccionarHerramienta = (herramienta, caso) => {
        setForm(herramienta);
        setId(herramienta.id);
        if (caso === 'Editar') {
            setModalEditar(true);
        } else {
            setModalEliminar(true);
        }
    };

    // Funciones para alternar la visibilidad de los modales
    const toggleModalInsertar = () => {
        setModalInsertar(!modalInsertar);
        if (modalInsertar) resetForm();
    };

    const toggleModalEditar = () => {
        setModalEditar(!modalEditar);
        if (modalEditar) resetForm();
    };

    const toggleModalEliminar = () => {
        setModalEliminar(!modalEliminar);
        if (modalEliminar) resetForm();
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">CRUD de Herramientas de Ferretería</h1>
            <div className="d-flex justify-content-center mb-4">
                <button
                    className="btn btn-success"
                    onClick={toggleModalInsertar}
                    disabled={!db || !isAuthReady}
                >
                    <i className="fas fa-plus me-2"></i> Insertar Herramienta
                </button>
            </div>
            {loading ? (
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th scope="col">Imagen</th>
                                <th scope="col">Herramienta</th>
                                <th scope="col">Marca</th>
                                <th scope="col">Modelo</th>
                                <th scope="col">Precio</th>
                                <th scope="col" className="text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        {item.imagenUrl ? (
                                            <img src={item.imagenUrl} alt={item.herramienta} className="rounded" style={{ width: '64px', height: '64px', objectFit: 'cover' }} />
                                        ) : (
                                            <div className="rounded bg-secondary text-white d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>Sin Imagen</div>
                                        )}
                                    </td>
                                    <td>{item.herramienta}</td>
                                    <td>{item.marca}</td>
                                    <td>{item.modelo}</td>
                                    <td>{item.precio}</td>
                                    <td className="text-center">
                                        <button
                                            className="btn btn-primary btn-sm me-2"
                                            onClick={() => seleccionarHerramienta(item, 'Editar')}
                                        >
                                            <i className="fas fa-edit"></i> Editar
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => seleccionarHerramienta(item, 'Eliminar')}
                                        >
                                            <i className="fas fa-trash-alt"></i> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal de Insertar */}
            <div className={`modal fade ${modalInsertar ? 'show d-block' : ''}`} tabIndex="-1" aria-labelledby="insertarModalLabel" aria-hidden={!modalInsertar}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="insertarModalLabel">Insertar Herramienta</h5>
                            <button type="button" className="btn-close" onClick={toggleModalInsertar}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Herramienta:</label>
                                <input type="text" className="form-control" name="herramienta" onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Marca:</label>
                                <input type="text" className="form-control" name="marca" onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Modelo:</label>
                                <input type="text" className="form-control" name="modelo" onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Precio:</label>
                                <input type="text" className="form-control" name="precio" onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Imagen:</label>
                                <input type="file" className="form-control" onChange={handleImageChange} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={peticionPost}
                                disabled={!db || !currentUser}
                            >
                                Insertar
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={toggleModalInsertar}>Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Editar */}
            <div className={`modal fade ${modalEditar ? 'show d-block' : ''}`} tabIndex="-1" aria-labelledby="editarModalLabel" aria-hidden={!modalEditar}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editarModalLabel">Editar Herramienta</h5>
                            <button type="button" className="btn-close" onClick={toggleModalEditar}></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Herramienta:</label>
                                <input type="text" className="form-control" name="herramienta" onChange={handleChange} value={form.herramienta} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Marca:</label>
                                <input type="text" className="form-control" name="marca" onChange={handleChange} value={form.marca} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Modelo:</label>
                                <input type="text" className="form-control" name="modelo" onChange={handleChange} value={form.modelo} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Precio:</label>
                                <input type="text" className="form-control" name="precio" onChange={handleChange} value={form.precio} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Imagen:</label>
                                <input type="file" className="form-control" onChange={handleImageChange} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-primary" 
                                onClick={peticionPut}
                                disabled={!db || !currentUser}
                            >
                                Editar
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={toggleModalEditar}>Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Eliminar */}
            <div className={`modal fade ${modalEliminar ? 'show d-block' : ''}`} tabIndex="-1" aria-labelledby="eliminarModalLabel" aria-hidden={!modalEliminar}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="eliminarModalLabel">Eliminar Herramienta</h5>
                            <button type="button" className="btn-close" onClick={toggleModalEliminar}></button>
                        </div>
                        <div className="modal-body">
                            <p>¿Estás seguro que deseas eliminar la herramienta **{form.herramienta}**?</p>
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={peticionDelete}
                                disabled={!db || !currentUser}
                            >
                                Eliminar
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={toggleModalEliminar}>Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Crud;
