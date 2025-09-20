"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Image from "next/image";

type Props = {
  contratacionId: string;
  onSuccess?: () => void;
};

interface CalificacionExistente {
  _id: string;
  puntaje: number;
  comentario: string;
  puedeEditar: boolean;
  editado: boolean;
  fecha: string;
}

interface DatosCalificacion {
  contratacionId: string;
  persona: {
    _id: string;
    nombre: string;
    profesion: string;
    avatar: string;
  };
  rol: string;
}

interface CalificacionResponse {
  calificacion?: CalificacionExistente;
  yaCalificado?: boolean;
  message?: string;
}

interface ApiResponse {
  message?: string;
}

export default function CalificacionForm({ contratacionId, onSuccess }: Props): JSX.Element {
  const [calificacion, setCalificacion] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificandoCalificacion, setVerificandoCalificacion] = useState(true);
  const [calificacionExistente, setCalificacionExistente] = useState<CalificacionExistente | null>(null);
  const [puedeCalificar, setPuedeCalificar] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosCalificacion, setDatosCalificacion] = useState<DatosCalificacion | null>(null);

  // ============  useEffect para cargar calificación ============
  useEffect(() => {
    const cargarCalificacion = async (): Promise<void> => {
      try {
        const datosString = sessionStorage.getItem("datosCalificacion");
        if (!datosString) throw new Error("No hay datos de calificación");

        const datos = JSON.parse(datosString) as DatosCalificacion;
        setDatosCalificacion(datos);

        const calificadorId = localStorage.getItem("userId");
        const empleadoId = datos.persona._id;
        const contratacionIdToUse = datos.contratacionId;

        // 🔹 CAMBIO: Agregar contratacionId al request
        const res = await fetch(`https://redoficios-back.vercel.app/api/calificacion/obtenerCalificacion`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            calificadorId,
            empleadoId,
            contratacionId: contratacionIdToUse // 🔹 NUEVO: incluir contratacionId
          }),
        });

        const data: CalificacionResponse = await res.json();

        if (res.ok && data.calificacion) {
          const calificacionCompleta: CalificacionExistente = {
            _id: data.calificacion._id,
            puntaje: data.calificacion.puntaje,
            comentario: data.calificacion.comentario,
            puedeEditar: data.calificacion.puedeEditar || false,
            editado: data.calificacion.editado || false,
            fecha: data.calificacion.fecha || (data.calificacion as CalificacionExistente & { createdAt?: string }).createdAt || ""
          };

          setCalificacionExistente(calificacionCompleta);
          setCalificacion(calificacionCompleta.puntaje);
          setComentario(calificacionCompleta.comentario);
          setPuedeCalificar(false);
        } else {
          setPuedeCalificar(true);
        }
      } catch (error) {
        console.error("Error al obtener calificación:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la calificación desde el servidor."
        });
      } finally {
        setVerificandoCalificacion(false);
      }
    };

    cargarCalificacion();
  }, []);

  // Cargar datos desde sessionStorage (pasados desde notificaciones)
  useEffect(() => {
    try {
      const datosString = sessionStorage.getItem("datosCalificacion");
      if (datosString) {
        const datos = JSON.parse(datosString) as DatosCalificacion;
        setDatosCalificacion(datos);
        console.log("Datos de calificación cargados:", datos);
      } else {
        console.error("No se encontraron datos de calificación en sessionStorage");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se encontraron los datos necesarios para calificar."
        });
      }
    } catch (error) {
      console.error("Error al parsear datosCalificacion:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al cargar los datos de calificación."
      });
    }
  }, []);

  // Verificar calificación cuando se cargan los datos
  useEffect(() => {
    if (datosCalificacion) {
      verificarPuedeCalificar();
    }
  }, [datosCalificacion]);

  const verificarPuedeCalificar = async (): Promise<void> => {
    if (!datosCalificacion) return;

    try {
      setVerificandoCalificacion(true);
      const calificadorId = localStorage.getItem("userId");
      const empleadoId = datosCalificacion.persona._id;
      const contratacionIdToUse = datosCalificacion.contratacionId;

      const res = await fetch(`https://redoficios-back.vercel.app/api/calificacion/puede-calificar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calificadorId,
          empleadoId,
          contratacionId: contratacionIdToUse
        }),
      });

      const data: CalificacionResponse = await res.json();
      console.log("Respuesta del servidor:", data);

      if (data.yaCalificado && data.calificacion) {
        setCalificacionExistente(data.calificacion);
        setCalificacion(data.calificacion.puntaje);
        setComentario(data.calificacion.comentario);
        setPuedeCalificar(false);
        setModoEdicion(false);
      } else {
        setPuedeCalificar(true);
      }
    } catch (error) {
      console.error("Error al verificar calificación:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo verificar el estado de la calificación."
      });
    } finally {
      setVerificandoCalificacion(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!calificacion || comentario.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Completa todos los campos antes de enviar."
      });
      return;
    }

    if (!datosCalificacion) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontraron los datos necesarios para enviar la calificación."
      });
      return;
    }

    setLoading(true);

    try {
      const calificadorId = localStorage.getItem("userId");
      const empleadoId = datosCalificacion.persona._id;

      let url: string;
      let method: string;

      if (modoEdicion && calificacionExistente) {
        url = `https://redoficios-back.vercel.app/api/calificacion/editar/${calificacionExistente._id}`;
        method = "PUT";
      } else {
        url = `https://redoficios-back.vercel.app/api/calificacion`;
        method = "POST";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calificadorId,
          empleadoId,
          puntaje: calificacion,
          comentario,
          contratacionId: datosCalificacion.contratacionId
        }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al procesar calificación");

      Swal.fire({
        icon: "success",
        title: modoEdicion ? "Calificación actualizada" : "Calificación enviada",
        text: modoEdicion ? "Tu calificación ha sido actualizada." : "¡Gracias por dejar tu opinión!",
      }).then(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          verificarPuedeCalificar();
        }
        setModoEdicion(false);
        // Limpiar sessionStorage después del envío exitoso
        sessionStorage.removeItem("datosCalificacion");
        window.location.href = "/dashboard";
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo procesar la calificación.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (): Promise<void> => {
    if (!calificacionExistente) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await fetch(`https://redoficios-back.vercel.app/api/calificacion/eliminar/${calificacionExistente._id}`, {
        method: "DELETE"
      });
      const data: ApiResponse = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al eliminar calificación");

      Swal.fire({
        icon: "success",
        title: "Calificación eliminada",
        text: "La calificación ha sido eliminada."
      }).then(() => {
        setCalificacionExistente(null);
        setPuedeCalificar(true);
        setCalificacion(null);
        setComentario("");
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo eliminar la calificación.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarEdicion = (): void => {
    setModoEdicion(false);
    setCalificacion(calificacionExistente?.puntaje || null);
    setComentario(calificacionExistente?.comentario || "");
  };

  const handleVolverAtras = (): void => {
    window.history.back();
  };

  if (verificandoCalificacion) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!datosCalificacion) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg text-center text-red-600">
        <p>No se pudieron cargar los datos para calificar.</p>
        <p className="text-sm text-gray-500 mt-1">Verifica que hayas seleccionado correctamente desde las notificaciones.</p>
        <button
          onClick={handleVolverAtras}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          {calificacionExistente && !modoEdicion ? "Tu calificación" : modoEdicion ? "Editar calificación" : "Calificar trabajo"}
        </h3>

        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center space-x-3 text-left">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 mb-2">
                  <img
                    src={datosCalificacion.persona.avatar || "/assets/RedOficiosLogo.png"}
                    alt={datosCalificacion.persona.nombre}
                    className="object-contain rounded-full bg-gray-100 w-full h-full"
                  />
                </div>
                <p className="font-medium text-gray-800">{datosCalificacion.persona.nombre}</p>
                <p className="text-sm text-gray-600">{datosCalificacion.persona.profesion}</p>
                <p className="text-xs text-blue-600 font-medium">
                  Calificar como {datosCalificacion.rol}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {calificacionExistente && !modoEdicion ? (
        <div className="space-y-4">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={`text-3xl ${calificacionExistente.puntaje >= star ? "text-yellow-400" : "text-gray-300"}`}>★</span>
            ))}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700">{calificacionExistente.comentario}</p>
          </div>
          <div className="text-sm text-gray-500 text-center">
            {calificacionExistente.editado && <p>✏️ Editado</p>}
            <p>Fecha: {new Date(calificacionExistente.fecha).toLocaleDateString()}</p>
          </div>
          {calificacionExistente.puedeEditar && (
            <div className="flex space-x-3">
              <button onClick={() => setModoEdicion(true)} className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition" disabled={loading}>Editar</button>
              <button onClick={handleEliminar} className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition" disabled={loading}>Eliminar</button>
            </div>
          )}
          {!calificacionExistente.puedeEditar && (
            <p className="text-sm text-gray-500 text-center">⏰ Ya no puedes editar esta calificación (límite: 3 días)</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button type="button" key={star} onClick={() => setCalificacion(star)} disabled={loading} className={`text-3xl transition-colors ${calificacion && calificacion >= star ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"} ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>★</button>
            ))}
          </div>
          <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Escribe un comentario sobre el trabajo realizado..." className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" rows={4} disabled={loading} maxLength={500} />
          <p className="text-sm text-gray-500 text-right">{comentario.length}/500</p>

          <div className="space-y-2">
            <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition">
              {loading ? "Procesando..." : modoEdicion ? "Actualizar Calificación" : "Enviar Calificación"}
            </button>
            {modoEdicion && (
              <button type="button" onClick={handleCancelarEdicion} className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition" disabled={loading}>Cancelar</button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}