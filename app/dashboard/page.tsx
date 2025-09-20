"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
// 1. AGREGAR ESTE IMPORT AL INICIO DE TU ARCHIVO Dashboard
import { compartirPerfilPorWhatsApp } from '../generarWhatsapp/page'; // Ajusta la ruta según donde pongas el archivo
import { Share2 } from 'lucide-react'; // Para el ícono
import Link from "next/link";

interface Perfil {
    localidad: string;
    nombre: string;
    correo: string;
    telefono?: string;
    profesion?: string;
    aceptaTerminos: boolean;
    etiquetas?: string[];
    avatar?: string;
    cv?: string;
    calificacion?: number; // Solo lectura
    experiencia?: number; // Solo lectura
    precio?: number;        // NUEVO CAMPO
}

interface Usuario {
    _id: string;
    correo: string;
    perfil: Perfil;
    rol?: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    // Campos de edición
    const [localidad, setLocalidad] = useState("");
    const [correo, setCorreo] = useState("");
    const [nombre, setNombre] = useState("");
    const [telefono, setTelefono] = useState("");
    const [profesion, setProfesion] = useState("");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [cv, setCv] = useState<File | null>(null);
    const [etiquetas, setEtiquetas] = useState<string[]>([]);
    const [aceptaTerminos, setAceptaTerminos] = useState(false);
    const [precio, setPrecio] = useState<number>(0); // NUEVO CAMPO
    const [experiencia, setExperiencia] = useState<number>(0); // NUEVO CAMPO
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

    // NUEVOS ESTADOS PARA ROL
    const [nuevoRol, setNuevoRol] = useState<string>("");
    const [mostrarCambioRol, setMostrarCambioRol] = useState(false);

    const opcionesEtiquetas = ["Limpieza", "Electricidad", "Reparación General", "Jardinería", "Cocina", "Cuidado de niños"];

    // Generar preview cuando cambia avatar
    useEffect(() => {
        if (!avatar) return setPreviewAvatar(null);
        const objectUrl = URL.createObjectURL(avatar);
        setPreviewAvatar(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [avatar]);

    // ----------------------------
    // Obtener perfil del backend
    // ----------------------------
    const obtenerPerfil = async () => {
        const token = localStorage.getItem("token");
        const perfilId = localStorage.getItem("perfilId");
        if (!token || !perfilId) return router.push("/login");

        try {
            const res = await fetch(`https://redoficios-back.vercel.app/api/perfil/obtener/${perfilId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            console.log("DATA DEL BACKEND:", data);

            if (!res.ok) {
                Swal.fire("Error", data.msg || "No se pudo cargar el perfil", "error");
                setLoading(false);
                return;
            }

            // Ajuste: usar data.perfil y data.usuario según lo que devuelva tu backend
            const perfilBackend = data.perfil || data.usuario?.perfil || {};
            const userIdBackend = data.usuario?.userId || data.usuario?._id || perfilId;
            const rolBackend = data.usuario?.rol || "visitante";
            const correoBackend = data.usuario?.correo || "temporal@usuario.com";

            const perfilFinal = {
                localidad: perfilBackend?.localidad || "",
                nombre: perfilBackend?.nombre || "Usuario de prueba",
                correo: perfilBackend?.correo || "CorreoTest@gmail",
                telefono: perfilBackend?.telefono || "",
                profesion: perfilBackend?.profesion || "Profesión no definida",
                etiquetas: perfilBackend?.etiquetas || ["Sin etiquetas"],
                aceptaTerminos: perfilBackend?.aceptaTerminos ?? false,
                avatar: perfilBackend?.avatar || "/assets/hero.jpg",
                cv: perfilBackend?.cv || null,
                calificacion: perfilBackend?.calificacion ?? 0,
                experiencia: perfilBackend?.experiencia ?? 0,
                precio: perfilBackend?.precio ?? 0,
            };

            setUsuario({
                _id: userIdBackend,
                rol: rolBackend,
                perfil: perfilFinal,
                correo: correoBackend,
            });

            setNombre(perfilFinal.nombre);
            setCorreo(perfilFinal.correo);
            setTelefono(perfilFinal.telefono);
            setProfesion(perfilFinal.profesion);
            setEtiquetas(perfilFinal.etiquetas);
            setAceptaTerminos(perfilFinal.aceptaTerminos);
            setPrecio(perfilFinal.precio || 0);
            setLocalidad(perfilFinal.localidad);
            setExperiencia(perfilFinal.experiencia || 0)

            Swal.fire(
                data.temporal ? "Aviso" : "Éxito",
                data.temporal ? "Usuario temporal cargado" : "Perfil cargado desde la base de datos",
                data.temporal ? "info" : "success"
            );

        } catch (err) {
            console.error(err);
            Swal.fire("Error", "No se pudo conectar al servidor", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        obtenerPerfil();
    }, []);

    // ----------------------------
    // Manejar click en editar perfil
    // ----------------------------
    const handleEditarClick = () => {
        if (usuario?.rol === "visitante") {
            Swal.fire(
                "Cambio de perfil necesario",
                "Para contactarte o para buscar trabajo debes elegir un perfil de empleado o empleador",
                "info"
            );
            setMostrarCambioRol(true);
        }
        setEditing(true);
    };

    // ----------------------------
    // Enviar cambio de rol
    // ----------------------------


    const handleCambiarRol = async () => {
        const token = localStorage.getItem("token");
        const perfilId = localStorage.getItem("perfilId");
        if (!token || !perfilId || !nuevoRol) {
            Swal.fire("Error", "Debes seleccionar un rol", "error");
            return;
        }

        try {
            const res = await fetch(`https://redoficios-back.vercel.app/api/perfil/editar/${perfilId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ rol: nuevoRol }),
            });

            const data = await res.json();
            if (res.ok) {
                Swal.fire("Éxito", `Rol cambiado a ${nuevoRol} correctamente`, "success");
                setUsuario((prev) => (prev ? { ...prev, rol: nuevoRol } : null));
                setMostrarCambioRol(false);
                setNuevoRol("");
            } else {
                Swal.fire("Error", data.msg || "No se pudo cambiar el rol", "error");
            }
        } catch {
            Swal.fire("Error", "Error al conectarse con el servidor", "error");
        }
    };
    // 2. AGREGAR ESTA FUNCIÓN DENTRO DEL COMPONENTE Dashboard (después de handleCambiarRol)
    const handleCompartirPerfil = () => {
        if (usuario) {
            compartirPerfilPorWhatsApp(usuario);
        } else {
            Swal.fire("Error", "No se pudieron cargar los datos del usuario", "error");
        }
    };



    // ----------------------------
    // Guardar perfil completo
    // ----------------------------

    const handleGuardarPerfil = async () => {
        const token = localStorage.getItem("token");
        const perfilId = localStorage.getItem("perfilId");
        if (!token || !perfilId) return;

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("correo", correo);
        formData.append("localidad", localidad); // ✅ CORREGIDO
        formData.append("telefono", telefono);
        formData.append("profesion", profesion);
        formData.append("experiencia", experiencia.toString()); // ✅ CORREGIDO
        formData.append("precio", precio.toString());
        formData.append("etiquetas", JSON.stringify(etiquetas));
        if (avatar) formData.append("avatar", avatar);
        if (cv) formData.append("cv", cv);
        if (usuario?.rol) formData.append("rol", usuario.rol);

        try {
            const res = await fetch(`https://redoficios-back.vercel.app/api/perfil/editar/${perfilId}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                Swal.fire("Éxito", "Perfil actualizado correctamente", "success");
                obtenerPerfil();
                setEditing(false);
            } else {
                Swal.fire("Error", data.msg || "No se pudo actualizar perfil", "error");
            }
        } catch {
            Swal.fire("Error", "Error al conectarse con el servidor", "error");
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="min-h-screen p-8 bg-gray-100 flex justify-center">
            {usuario && (
                <div className="max-w-md w-full bg-white rounded-3xl shadow-lg overflow-hidden">
                    <div className="relative h-64 w-full">

                        <img
                            src={usuario.perfil.avatar || `/assets/hero.jpg`}
                            alt={usuario.perfil.nombre}
                            className="object-cover"
                        />

                    </div>

                    <div className="p-6 flex flex-col gap-3">
                        {!editing ? (
                            <>
                                <h2 className="text-2xl font-bold">{usuario.perfil.nombre}</h2>
                                {usuario.perfil.profesion && <h3 className="text-sm text-gray-600">{usuario.perfil.profesion}</h3>}
                                {usuario.perfil.localidad && <h3 className="text-sm text-gray-600">Localidad:{usuario.perfil.localidad}</h3>}
                                {usuario.perfil.telefono && <h3 className="text-sm text-gray-600">Tel: {usuario.perfil.telefono}</h3>}
                                {usuario.perfil.experiencia && <h3 className="text-sm text-gray-600">Experiencia: {usuario.perfil.experiencia}</h3>}
                                {usuario.perfil.correo && <h3 className="text-sm text-gray-600">Correo: {usuario.perfil.correo}</h3>}


                                <p className="text-sm text-gray-600">Rol: {usuario.rol}</p>
                                {usuario.perfil.etiquetas && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {usuario.perfil.etiquetas.map(tag => (
                                            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-teal-200 text-black">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Mostrar calificación solo lectura */}
                                <h3 className="mt-2 text-sm text-gray-600">
                                    Calificación: {usuario.perfil.calificacion?.toFixed(1) ?? 0} ⭐
                                </h3>
                                <h3 className="mt-1 text-sm font-semibold text-emerald-600">
                                    Precio: ${usuario.perfil.precio?.toLocaleString("es-AR") ?? 0}
                                </h3>



                                <button
                                    onClick={handleEditarClick}
                                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                                >
                                    Editar Perfil
                                </button>

                                {/* AGREGAR ESTE NUEVO BOTÓN JUSTO DESPUÉS */}
                                <button
                                    onClick={handleCompartirPerfil}
                                    className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Compartir mi Perfil
                                </button>
                            </>
                        ) : (
                            <>
                                {/* SECCIÓN DE CAMBIO DE ROL - SIEMPRE VISIBLE EN EDICIÓN */}
                                <div className="border-2 border-orange-300 rounded-xl p-4 bg-orange-50 mb-4">
                                    <h3 className="text-lg font-semibold mb-3 text-orange-800">Rol del usuario</h3>
                                    <div className="flex flex-col gap-2 mb-3">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="rol"
                                                value="empleado"
                                                checked={nuevoRol === "empleado" || (!nuevoRol && usuario?.rol === "empleado")}
                                                onChange={(e) => setNuevoRol(e.target.value)}
                                                className="w-4 h-4"
                                            />
                                            <span>Empleado</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="rol"
                                                value="empleador"
                                                checked={nuevoRol === "empleador" || (!nuevoRol && usuario?.rol === "empleador")}
                                                onChange={(e) => setNuevoRol(e.target.value)}
                                                className="w-4 h-4"
                                            />
                                            <span>Empleador</span>
                                        </label>
                                    </div>
                                    <button
                                        onClick={handleCambiarRol}
                                        className="px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition w-full"
                                    >
                                        Cambiar Rol
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="px-4 py-2 border rounded-xl w-full"
                                />
                                <input
                                    type="text"
                                    placeholder="Localidad"
                                    value={localidad}
                                    onChange={(e) => setLocalidad(e.target.value)}
                                    className="px-4 py-2 border rounded-xl w-full"
                                />
                                <input
                                    type="email"
                                    placeholder="Correo"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    className="px-4 py-2 border rounded-xl"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Teléfono"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    className="px-4 py-2 border rounded-xl w-full"
                                />
                                <input
                                    type="number"
                                    placeholder="Experiencia (años)"
                                    value={experiencia}
                                    onChange={(e) => setExperiencia(Number(e.target.value) || 0)}  // ✅ Más limpio
                                    className="px-4 py-2 border rounded-xl w-full"
                                    min="0"
                                />
                                <select
                                    value={profesion}
                                    onChange={(e) => setProfesion(e.target.value)}
                                    className="px-4 py-2 border rounded-xl w-full"
                                >
                                    <option value="">Seleccionar profesión</option>
                                    {opcionesEtiquetas.map(prof => (
                                        <option key={prof} value={prof}>{prof}</option>
                                    ))}
                                </select>
                                <div>
                                    <label>Etiquetas:</label>
                                    <div className="flex gap-2 flex-wrap mt-1">
                                        {opcionesEtiquetas.map(tag => (
                                            <button
                                                type="button"
                                                key={tag}
                                                onClick={() =>
                                                    setEtiquetas(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
                                                }
                                                className={`px-2 py-1 border rounded ${etiquetas.includes(tag) ? "bg-emerald-500 text-white" : "bg-gray-200 text-black"}`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                        {etiquetas.length === 0 && (
                                            <span className="px-2 py-1 rounded-full bg-gray-300 text-black">Sin etiquetas</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label>Avatar:</label>
                                    <div
                                        className="mt-1 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500 transition"
                                        onClick={() => document.getElementById("avatarInput")?.click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (e.dataTransfer.files[0]) setAvatar(e.dataTransfer.files[0]);
                                        }}
                                    >
                                        {avatar ? (
                                            <p>{avatar.name}</p>
                                        ) : (
                                            <p className="text-gray-500">Arrastrar y soltar o click para subir imagen</p>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            id="avatarInput"
                                            className="hidden"
                                            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label>CV (PDF o Word):</label>
                                    <div
                                        className="mt-1 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500 transition"
                                        onClick={() => document.getElementById("cvInput")?.click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (e.dataTransfer.files[0]) setCv(e.dataTransfer.files[0]);
                                        }}
                                    >
                                        {cv ? (
                                            <p>{cv.name}</p>
                                        ) : (
                                            <p className="text-gray-500">Arrastrar y soltar o click para subir CV</p>
                                        )}
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            id="cvInput"
                                            className="hidden"
                                            onChange={(e) => setCv(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label>Precio por Hora:</label>
                                    <input
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={precio === 0 ? "" : precio}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPrecio(val === "" ? 0 : parseInt(val));
                                        }}
                                        className="px-4 py-2 border rounded-xl w-full"
                                    />
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={handleGuardarPerfil}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            setMostrarCambioRol(false);
                                            setNuevoRol("");
                                        }}
                                        className="px-4 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 transition"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

