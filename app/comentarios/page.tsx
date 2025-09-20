"use client";
import { useEffect, useState } from "react";

interface Comentario {
  _id: string;
  comentario: string;
  calificacion: number;
  fechaCreacion: string;
  autorNombre: string;
  autorAvatar: string | null;
  perfilId: string | null;
  rol?: string;
  profesion?: string;
}

export default function Comentarios() {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [comentarioId, setComentarioId] = useState<string>("");
  const [mensaje, setMensaje] = useState<string>("");

  useEffect(() => {
    const data = localStorage.getItem("comentariosData");
    if (data) {
      const { id } = JSON.parse(data);
      setComentarioId(id);
      fetchComentarios(id);
    } else {
      setMensaje("No hay ID guardado en localStorage");
    }
  }, []);

  const fetchComentarios = async (id: string) => {
    try {
      const res = await fetch(`https://redoficios-back.vercel.app/api/comentarios/${id}`);
      if (!res.ok) throw new Error("Error al obtener comentarios");

      const data = await res.json();

      if (!data.comentarios || data.comentarios.length === 0) {
        setMensaje(`No hay comentarios para el ID: ${id}`);
      } else {
        setComentarios(data.comentarios);
        setMensaje(data.message || "Comentarios cargados correctamente");
      }
    } catch (error) {
      console.error(error);
      setMensaje(`Error al obtener comentarios para el ID: ${id}`);
    }
  };

  const renderStars = (puntaje: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= puntaje ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Comentarios</h2>

      {comentarioId && (
        <p className="mb-2 text-gray-700">
          ID de comentarios: <span className="font-mono">{comentarioId}</span>
        </p>
      )}

      {mensaje && <p className="mb-4 text-red-500">{mensaje}</p>}

      {comentarios.length > 0 ? (
        <div className="space-y-4">
          {comentarios.map((c) => (
            <div
              key={c._id}
              className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-md border"
            >
              <img
                src={c.autorAvatar || "/default-avatar.png"}
                alt={c.autorNombre}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{c.autorNombre}</span>
                  <span>{renderStars(c.calificacion)}</span>
                </div>
                <p className="text-gray-800">{c.comentario}</p>
                <div className="flex justify-between text-gray-500 text-sm mt-1">
                  <span>{new Date(c.fechaCreacion).toLocaleDateString()}</span>
                  {c.perfilId && <span>ID Perfil: {c.perfilId}</span>}
                </div>
                {c.rol && c.profesion && (
                  <div className="text-gray-600 text-sm mt-1">
                    Rol: {c.rol} | Profesión: {c.profesion}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No hay comentarios para mostrar.</p>
      )}
    </div>
  );
}
