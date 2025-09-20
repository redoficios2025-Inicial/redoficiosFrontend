"use client";
import { useEffect, useState } from "react";
import { Trash2, MessageCircle, MessageSquare, Clock, CheckCircle, XCircle, Bell, Users, Check, X, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useUser } from "../contexts/UserContext";
import Link from "next/link";

type Perfil = {
    _id: string;
    perfilId: string;
    rol: string;
    fechaRegistro: string;
    __v: number;
    estado: string;
    notificacionEmpleador?: number;
    createdAt?: string;
    updatedAt?: string;
};

type Usuario = {
    _id: string;
    nombre: string;
    notificacion: string;
    calificacion: number; // o number si la convertís
    estado: string;
    telefono?: string;
    avatar?: string;
    rol: string;
    perfil?: Perfil; // <- agregamos esta propiedad opcional
};


type Notificacion = {
    _id: string;
    estado: string;
    fecha: string;
    empleador: Usuario;
    empleado: Usuario;
    notificacionEmpleador: string;
    notificacionEmpleado: string;
};

export default function Notificaciones() {
    const { user } = useUser();
    const router = useRouter();
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [notificacionesFiltradas, setNotificacionesFiltradas] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);



    useEffect(() => {
        const fetchNotificaciones = async () => {
            try {
                const res = await fetch("https://redoficios-back.vercel.app/api/contratacion/notificaciones");
                if (!res.ok) throw new Error("Error al obtener notificaciones");

                const data = await res.json();

                setNotificaciones(data.data || []);
                console.log("Datos que llegan del BACKEND:", data.data);

            } catch (err: unknown) {
                console.error("Error al obtener notificaciones:", err);

                // Guard clause para acceder a message si existe
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Ocurrió un error");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNotificaciones();
    }, []);


    // Filtrar notificaciones según el usuario logueado
    useEffect(() => {
        if (!user || !user._id || !notificaciones.length) {
            setNotificacionesFiltradas([]);
            return;
        }

        const filtradas = notificaciones.filter(notificacion => {
            if (user.rol.toLowerCase() === "empleado") {
                return notificacion.empleado._id === user._id;
            } else if (user.rol.toLowerCase() === "empleador") {
                return notificacion.empleador._id === user._id;
            }
            return false;
        });

        setNotificacionesFiltradas(filtradas);
    }, [user, notificaciones]);

    const getEstadoConfig = (estado: string) => {
        switch (estado.toLowerCase()) {
            case "pendiente":
                return {
                    color: "bg-amber-50 border-amber-200",
                    textColor: "text-amber-800",
                    badgeColor: "bg-amber-500",
                    icon: Clock,
                    iconColor: "text-amber-600"
                };
            case "aceptado":
                return {
                    color: "bg-emerald-50 border-emerald-200",
                    textColor: "text-emerald-800",
                    badgeColor: "bg-emerald-500",
                    icon: CheckCircle,
                    iconColor: "text-emerald-600"
                };
            case "rechazado":
                return {
                    color: "bg-red-50 border-red-200",
                    textColor: "text-red-800",
                    badgeColor: "bg-red-500",
                    icon: XCircle,
                    iconColor: "text-red-600"
                };
            default:
                return {
                    color: "bg-gray-50 border-gray-200",
                    textColor: "text-gray-800",
                    badgeColor: "bg-gray-500",
                    icon: Clock,
                    iconColor: "text-gray-600"
                };
        }
    };

    const handleWhatsAppClick = async (notificacion: Notificacion) => {
        const empleado = notificacion.empleado;

        if (empleado.estado.toLowerCase() === "aceptado") {
            await Swal.fire({
                icon: "info",
                title: "Trabajo pendiente",
                text: "El trabajo debe estar aceptado para habilitar WhatsApp",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Entendido",
            });
            return;
        }

        const telefono = empleado.telefono;
        if (!telefono) {
            await Swal.fire({
                icon: "error",
                title: "Número no encontrado",
                text: "No se encontró número de teléfono para este empleado",
                confirmButtonColor: "#d33",
                confirmButtonText: "Cerrar",
            });
            return;
        }

        const mensaje = `Hola ${empleado.nombre}, te contacto por el trabajo de RedOficios.`;
        const whatsappUrl = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

        const result = await Swal.fire({
            title: `Contactar a ${empleado.nombre}?`,
            text: `Número: ${telefono}`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#25D366",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, abrir WhatsApp",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            window.open(whatsappUrl, "_blank");
        }
    };

    const handleCalificarClick = (notificacion: Notificacion) => {
        if (!user) {
            Swal.fire("Error", "No hay usuario logueado", "error");
            return;
        }

        const isEmpleado = user.rol?.toLowerCase() === "empleado";

        // Determinar qué persona se va a calificar según el rol del usuario logueado
        const personaACalificar = isEmpleado ? notificacion.empleador : notificacion.empleado;

        const datosCalificacion = {
            contratacionId: notificacion._id,
            persona: {
                _id: personaACalificar._id,
                nombre: personaACalificar.nombre,
                profesion: isEmpleado ? "Empleador" : "Empleado", // Puedes usar el campo real si existe
                avatar: personaACalificar.avatar || "/assets/RedOficiosLogo.png"
            },
            rol: isEmpleado ? "empleador" : "empleado" // El rol de la persona que se va a calificar
        };

        // Usar sessionStorage para pasar los datos específicos de esta notificación
        sessionStorage.setItem('datosCalificacion', JSON.stringify(datosCalificacion));
        router.push('/calificacion');
    };

    const handleDeleteNotification = async (id: string) => {
        const result = await Swal.fire({
            title: "Eliminar notificación",
            text: "¿Estás seguro de que deseas eliminar esta notificación?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (!result.isConfirmed) return;

        setDeletingId(id);

        try {
            const res = await fetch(`https://redoficios-back.vercel.app/api/contratacion/notificaciones/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Error al eliminar notificación");

            setNotificaciones((prev) => prev.filter((n) => n._id !== id));

            await Swal.fire({
                icon: "success",
                title: "Notificación eliminada",
                showConfirmButton: false,
                timer: 1500,
            });
        } catch (err) {
            console.error("Error al eliminar notificación:", err);
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo eliminar la notificación",
                confirmButtonColor: "#d33",
                confirmButtonText: "Cerrar",
            });
        } finally {
            setDeletingId(null);
        }
    };

    const handleAceptarTrabajo = async (notificacionId: string) => {
        try {
            const estadoNotificaciones = { estado: "aceptado" };

            const res = await fetch(
                `https://redoficios-back.vercel.app/api/contratacion/notificaciones/estado/${notificacionId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(estadoNotificaciones),
                }
            );

            if (!res.ok) throw new Error("Error al actualizar la notificación");

            const data = await res.json();
            console.log("Trabajo aceptado:", data);

            // Actualizar el estado local
            setNotificaciones(prev => prev.map(n =>
                n._id === notificacionId ? { ...n, estado: "aceptado" } : n
            ));

            Swal.fire({
                icon: "success",
                title: "Trabajo aceptado",
                text: "Has aceptado la contratación",
                confirmButtonColor: "#3085d6",
            });
        } catch (error) {
            console.error("Error al aceptar trabajo:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo aceptar el trabajo. Intenta nuevamente.",
                confirmButtonColor: "#d33",
            });
        }
    };


    const handleRechazarTrabajo = async (notificacionId: string) => {
        try {
            const estadoNotificaciones = { estado: "rechazado" };

            const res = await fetch(
                `https://redoficios-back.vercel.app/api/contratacion/notificaciones/estado/${notificacionId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(estadoNotificaciones),
                }
            );

            if (!res.ok) throw new Error("Error al actualizar la notificación");

            const data = await res.json();
            console.log("Trabajo rechazado:", data);

            setNotificaciones(prev =>
                prev.map(n =>
                    n._id === notificacionId ? { ...n, estado: "rechazado" } : n
                )
            );

            Swal.fire({
                title: "Trabajo rechazado",
                text: "Has rechazado la notificación correctamente.",
                icon: "success",
                confirmButtonText: "OK",
                confirmButtonColor: "#3085d6"
            });
        } catch (error) {
            console.error("Error al rechazar trabajo:", error);
            Swal.fire({
                title: "Error",
                text: "No se pudo rechazar el trabajo. Intenta nuevamente.",
                icon: "error",
                confirmButtonText: "Cerrar",
                confirmButtonColor: "#d33"
            });
        }
    };

    const handleVerComentarios = (id: string,) => {
        localStorage.setItem(
            "comentariosData",
            JSON.stringify({ id })
        );
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Cargando notificaciones</h3>
                    <p className="text-gray-600">Por favor espera un momento...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
                    <div className="bg-red-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Intentar nuevamente
                    </button>
                </div>
            </div>
        );
    }

    if (notificacionesFiltradas.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
                    <div className="bg-gray-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Sin notificaciones</h3>
                    <p className="text-gray-600">No hay notificaciones disponibles en este momento</p>
                </div>
            </div>
        );
    }

    if (!user || !user.rol) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full mx-4">
                    <div className="bg-red-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Usuario no identificado</h3>
                    <p className="text-gray-600">Por favor, inicia sesión para ver las notificaciones</p>
                </div>
            </div>
        );
    }

    const isEmpleado = user.rol.toLowerCase() === "empleado";
    const isEmpleador = user.rol.toLowerCase() === "empleador";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-600 rounded-xl p-3 shadow-lg">
                            <Bell className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Panel de Notificaciones</h1>
                            <p className="text-gray-600 text-lg">
                                Gestiona tus contrataciones como {user.rol}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="bg-white rounded-lg px-4 py-2 shadow-md border">
                            <span className="text-blue-600 font-semibold">
                                {notificacionesFiltradas.length} notificación{notificacionesFiltradas.length !== 1 ? "es" : ""}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Pendiente</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Aceptado</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Rechazado</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Grid de notificaciones */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {notificacionesFiltradas.map((notificacion) => {
                        const estadoConfig = getEstadoConfig(notificacion.estado);
                        const IconComponent = estadoConfig.icon;
                        const isDeleting = deletingId === notificacion._id;

                        return (
                            <div
                                key={notificacion._id}
                                className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${estadoConfig.color} ${isDeleting ? 'opacity-50' : ''}`}
                            >
                                {/* Header de la tarjeta */}
                                <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 rounded-t-xl">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <IconComponent className={`w-6 h-6 ${estadoConfig.iconColor} bg-white rounded-full p-1`} />
                                            <span className="text-white font-semibold">Contratación</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${estadoConfig.badgeColor}`}></div>
                                            <button
                                                onClick={() => handleDeleteNotification(notificacion._id)}
                                                disabled={isDeleting}
                                                className="text-white hover:text-red-300 transition-colors p-1 rounded hover:bg-white/10"
                                                title="Eliminar notificación"
                                            >
                                                {isDeleting ? (
                                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col items-center">
                                    {/* Badge de estado */}
                                    <div className="flex justify-center mb-4">
                                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${estadoConfig.color} ${estadoConfig.textColor}`}>
                                            <IconComponent className="w-4 h-4" />
                                            {notificacion.estado.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Información según el rol del usuario */}
                                    {isEmpleado && (
                                        <div className="text-center mb-4">
                                            <img
                                                src={notificacion.empleador.avatar || "/assets/RedOficiosLogo.png"}
                                                alt={notificacion.empleador.nombre}
                                                className="w-30 h-30 rounded-full object-cover border-2 border-blue-200 mx-auto mb-3"
                                            />
                                            <div className="bg-blue-50 rounded-xl p-4">
                                                <p className="font-semibold text-blue-900">{notificacion.empleador.nombre}</p>


                                                <div className="flex flex-col items-center justify-center text-sm text-blue-700">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
                                                        <span>Empleador</span>
                                                    </div>

                                                    <div className="flex items-center gap-1 mt-1">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="gold"
                                                            className="w-4 h-4"
                                                        >
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                        <p>{notificacion.empleador.calificacion || "0.00"}</p>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-blue-600 mt-2">{notificacion.notificacionEmpleador}</p>

                                                {/* Botón ver comentarios del empleador */}
                                                <Link
                                                    href={`/comentarios`}
                                                    onClick={() => handleVerComentarios(notificacion.empleador._id)}
                                                    className="mt-3 w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    Ver comentarios de {notificacion.empleador.nombre}
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {isEmpleador && (
                                        <div className="text-center mb-4">
                                            <img
                                                src={notificacion.empleado.avatar || "/assets/RedOficiosLogo.png"}
                                                alt={notificacion.empleado.nombre}
                                                className="w-30 h-30 rounded-full object-cover border-2 border-blue-200 mx-auto mb-3"
                                            />
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <p className="font-semibold text-gray-900">{notificacion.empleado.nombre}</p>
                                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                                    <Users className="w-4 h-4" />
                                                    <span>Empleado</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2">{notificacion.notificacionEmpleado}</p>

                                                {/* Botón ver comentarios del empleado */}
                                                <Link
                                                    href={`/comentarios`}
                                                    onClick={() => handleVerComentarios(notificacion.empleado._id)}
                                                    className="mt-3 w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    Ver comentarios de {notificacion.empleador.nombre}
                                                </Link>

                                            </div>
                                        </div>
                                    )}

                                    {/* Fecha */}
                                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">
                                        <span>📅</span>
                                        <span>
                                            {new Date(notificacion.fecha).toLocaleString("es-AR", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>

                                    {/* Botones según el rol */}
                                    <div className="w-full space-y-2">
                                        {isEmpleado && notificacion.estado.toLowerCase() === "pendiente" ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAceptarTrabajo(notificacion._id)}
                                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <Check className="w-5 h-5" />
                                                    Aceptar
                                                </button>
                                                <button
                                                    onClick={() => handleRechazarTrabajo(notificacion._id)}
                                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                    Rechazar
                                                </button>
                                            </div>
                                        ) : notificacion.estado.toLowerCase() === "aceptado" ? (
                                            <div className="space-y-2">
                                                {/* Botón WhatsApp para empleador */}
                                                {isEmpleador && (
                                                    <button
                                                        onClick={() => handleWhatsAppClick(notificacion)}
                                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2"
                                                    >
                                                        <MessageCircle className="w-5 h-5" />
                                                        Contactar por WhatsApp
                                                    </button>
                                                )}

                                                {/* Botón de calificación para ambos roles */}
                                                <button
                                                    onClick={() => handleCalificarClick(notificacion)}
                                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2"
                                                >
                                                    <Star className="w-5 h-5" />
                                                    {isEmpleado ? "Calificar Empleador" : "Calificar Empleado"}
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <button
                                                    disabled
                                                    className="w-full bg-gray-300 text-gray-500 font-semibold py-3 px-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    {isEmpleado ? (
                                                        <>
                                                            <Clock className="w-5 h-5" />
                                                            {notificacion.estado === "aceptado" ? "Trabajo aceptado" :
                                                                notificacion.estado === "rechazado" ? "Trabajo rechazado" : "Pendiente"}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MessageCircle className="w-5 h-5" />
                                                            WhatsApp no disponible
                                                        </>
                                                    )}
                                                </button>
                                                <p className="text-xs text-gray-500 text-center mt-1">
                                                    {isEmpleado ? (
                                                        notificacion.estado === "aceptado" ? (
                                                            "Se te contactará por WhatsApp - recordá pasar el código que recibiste en el correo"
                                                        ) : notificacion.estado === "rechazado" ? (
                                                            "Has rechazado este trabajo"
                                                        ) : (
                                                            "Respuesta pendiente"
                                                        )
                                                    ) : notificacion.estado.toLowerCase() === "pendiente" ? (
                                                        "Esperando aceptación del empleado"
                                                    ) : (
                                                        <span>
                                                            El empleado rechazó el trabajo.{" "}
                                                            <a
                                                                href="/empleo"
                                                                className="text-blue-600 hover:underline font-semibold"
                                                            >
                                                                Contratar a otro
                                                            </a>
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>



                {/* Footer informativo */}
                <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
                    <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
                        Estados de Contratación
                    </h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <div className="bg-amber-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                <Clock className="w-8 h-8 text-amber-600" />
                            </div>
                            <h4 className="font-semibold text-amber-800 mb-2">Pendiente</h4>
                            <p className="text-sm text-amber-700">
                                {isEmpleado ? "Puedes aceptar o rechazar este trabajo" : "En espera de respuesta del empleado"}
                            </p>
                        </div>

                        <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <div className="bg-emerald-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h4 className="font-semibold text-emerald-800 mb-2">Aceptado</h4>
                            <p className="text-sm text-emerald-700">
                                {isEmpleado ? "Has aceptado este trabajo" : "Trabajo confirmado - WhatsApp habilitado"}
                            </p>
                        </div>

                        <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                            <div className="bg-red-100 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-3">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h4 className="font-semibold text-red-800 mb-2">Rechazado</h4>
                            <p className="text-sm text-red-700">
                                {isEmpleado ? "Has rechazado este trabajo" : "Contratación declinada por el empleado"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
