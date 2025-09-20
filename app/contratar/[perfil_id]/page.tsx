"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import Image from "next/image";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useParams, useRouter } from "next/navigation";
import { FileText } from "lucide-react"; // icono bonito

type Perfil = {
  _id: string;
  rol: "empleado" | "empleador" | "visitante";
  perfil: {
    localidad: string;
    correo: string;
    nombre: string;
    profesion?: string;
    aceptaTerminos: boolean;
    calificacion: number;
    precio: number;
    experiencia: number;
    avatar?: string;
    cv?: string;
    etiquetas?: string[];
  };
};

type Contratacion = {
  _id: string;
  empleadorId: string;
  empleadoId: string;
  estado: string;
  fechaCreacion: string;
  empleadorDatos: Perfil;
  empleadoDatos: Perfil;
};

type ContratacionResponse = {
  contrataciones: Contratacion[];
  message?: string;
};

type ContratarResponse = {
  estado: string;
  message?: string;
};

const MySwal = withReactContent(Swal);

export default function ContratarPage() {
  const { user } = useUser();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [contrataciones, setContrataciones] = useState<Contratacion[]>([]);
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);

  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const loadContrataciones = async (): Promise<void> => {
      const data = await fetchContrataciones();
      setContrataciones(data);
    };
    loadContrataciones();
  }, [user]);

  useEffect(() => {
    const fetchPerfil = async (): Promise<void> => {
      setLoading(true);

      const data = localStorage.getItem("perfilSeleccionado");
      if (data) {
        const perfilData: Perfil = JSON.parse(data);
        if (perfilData._id === params.perfil_id) {
          setPerfil(perfilData);
          setLoading(false);
          return;
        }
      }

      try {
        const res = await fetch(`https://redoficios-back.vercel.app/api/perfiles/${params.perfil_id}`);
        if (!res.ok) throw new Error("Perfil no encontrado");
        const perfilData: Perfil = await res.json();
        setPerfil(perfilData);
        localStorage.setItem("userId", JSON.stringify(perfilData));
      } catch (error) {
        console.error(error);
        setPerfil(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [params.perfil_id]);

  const handleAceptarTerminos = async (): Promise<void> => {
    const { value: accept } = await MySwal.fire({
      title: "Términos y condiciones",
      html: `
        <div style="text-align:left; font-size:15px; line-height:1.6; color:#333;">
  <p style="margin-bottom:12px;">
    Debes aceptar los <strong>términos y condiciones</strong> antes de contratar.
  </p>
  <label for="check" 
         style="display:flex; align-items:center; gap:10px; cursor:pointer; font-size:14px; padding:8px 0;">
    <input type="checkbox" id="check" 
           style="width:18px; height:18px; cursor:pointer;" />
    <span>Acepto los términos y condiciones</span>
  </label>
</div>`,
      confirmButtonText: "Confirmar",
      preConfirm: () => {
        const checkbox = document.getElementById("check") as HTMLInputElement;
        if (!checkbox || !checkbox.checked) {
          Swal.showValidationMessage("Debes aceptar los términos para continuar");
          return false;
        }
        return true;
      },
      showCancelButton: true,
    });

    if (accept) setTerminosAceptados(true);
  };

  const handleContratar = async (): Promise<void> => {
    if (!perfil || !user || enviandoSolicitud) return;
    
    setEnviandoSolicitud(true);
    
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("No se encontró el userId en localStorage");

      const empleadoData = localStorage.getItem("perfilSeleccionado");
      if (!empleadoData) throw new Error("No se encontró el perfil del empleado");

      const empleadoPerfil: Perfil = JSON.parse(empleadoData);

      const response = await fetch(
        `https://redoficios-back.vercel.app/api/contratacion/${params.perfil_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            empleadorId: userId,
            empleadoId: empleadoPerfil._id,
            empleadorDatos: user,
            empleadoDatos: empleadoPerfil
          }),
        }
      );

      const data: ContratarResponse = await response.json();

      if (!response.ok)
        throw new Error(data.message || "Error al enviar la solicitud");

      await MySwal.fire({
        title: "Solicitud enviada",
        html: `
          <p>Se ha contactado a ${perfil.perfil.nombre}. Ahora espera su respuesta.</p>
          <p><strong>Estado:</strong> ${data.estado}</p>
        `,
        icon: "success",
      });

      window.location.href = "/notificaciones";
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un problema al contratar";
      console.error("Error fetch:", error);
      await MySwal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  const handleGoToDashboard = (): void => {
    router.push("/dashboard");
  };

  const fetchContrataciones = async (): Promise<Contratacion[]> => {
    if (!user) return [];
    try {
      const response = await fetch(`https://redoficios-back.vercel.app/api/contratacion/${user._id}`);
      const data: ContratacionResponse = await response.json();
      if (!response.ok) throw new Error(data.message || "Error al obtener contrataciones");
      return data.contrataciones;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      console.error("Error al obtener contrataciones:", errorMessage);
      return [];
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Cargando perfil...</div>;
  if (!perfil) return <div className="p-6 text-center text-red-500">Perfil no encontrado</div>;
  if (!user) return <div className="p-6 text-center text-red-500">Debes iniciar sesión para contratar</div>;

  const esEmpleador = user.rol === "empleador";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-3xl max-w-3xl w-full flex flex-col md:flex-row overflow-hidden">
        <div className="relative w-full md:w-1/3 h-64 md:h-auto">
          <img
            src={perfil.perfil.avatar || "/assets/1mujer.jpg"}
            alt={perfil.perfil.nombre}
            className="object-cover w-full h-full"
          />
          <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
            ★ {perfil.perfil.calificacion.toFixed(1)}
          </div>
        </div>

        <div className="p-6 flex flex-col justify-between w-full md:w-2/3">
          <div>
            <h2 className="text-2xl font-bold mb-1">{perfil.perfil.nombre}</h2>
            <p className="text-sm text-gray-600 mb-2">{perfil.perfil.localidad}</p>
            {perfil.perfil.profesion && (
              <p className="text-indigo-600 font-medium mb-2">{perfil.perfil.profesion}</p>
            )}
            {perfil.perfil.cv && (
              <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center gap-4">
                <div className="flex-shrink-0">
                  <FileText className="text-indigo-600 w-8 h-8" />
                </div>
                <div className="flex-1">
                  <a
                    href={`https://redoficios-back.vercel.app/${perfil.perfil.cv.replace(/\\/g, "/")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
                  >
                    Descargar CV
                  </a>
                </div>
              </div>
            )}
            <p className="text-gray-700 mb-1">Experiencia: {perfil.perfil.experiencia} años</p>
            <p className="text-gray-700 mb-2">Precio: ${perfil.perfil.precio.toLocaleString()}/hora</p>

            {perfil.perfil.etiquetas && perfil.perfil.etiquetas.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {perfil.perfil.etiquetas.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-1">Tus datos</h3>
            <p className="text-gray-700">Nombre: {user.nombre}</p>
            <p className="text-gray-700">Rol: {user.rol}</p>
          </div>

          {!esEmpleador ? (
            <div className="mt-6">
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <p className="text-yellow-700 text-center font-medium">
                  Para contratar debes cambiar a empleador
                </p>
              </div>
              <button
                className="w-full py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition font-medium"
                onClick={handleGoToDashboard}
              >
                Ir al Dashboard
              </button>
            </div>
          ) : (
            <>
              {!terminosAceptados ? (
                <button
                  className="mt-6 w-full py-3 bg-gray-400 text-white rounded-2xl cursor-pointer font-medium hover:bg-gray-500 transition"
                  onClick={handleAceptarTerminos}
                >
                  Aceptar términos y condiciones
                </button>
              ) : (
                <button
                  className={`mt-6 w-full py-3 text-white rounded-2xl font-medium transition ${
                    enviandoSolicitud 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                  }`}
                  onClick={handleContratar}
                  disabled={enviandoSolicitud}
                >
                  {enviandoSolicitud ? 'Enviando...' : 'Contratar'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
