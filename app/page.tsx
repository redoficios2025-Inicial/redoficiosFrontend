"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useUser } from "./contexts/UserContext";

type Perfil = {
  _id: string;
  rol: "empleado" | "empleador" | "visitante";
  perfil: {
    localidad: string;
    nombre: string;
    correo: string;
    telefono?: string;
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

type Worker = {
  id: string;
  name: string;
  rating: number;
  experience: string;
  location: string;
  price: string;
  specialties: string[];
  photo: string;
};

// Tipo para los perfiles que vienen del endpoint sin rol
type PerfilSinRol = {
  _id: string;
  rol: "empleado" | "empleador" | "visitante";
  localidad: string;
  nombre: string;
  correo: string;
  telefono?: string;
  profesion?: string;
  aceptaTerminos: boolean;
  calificacion: number;
  precio: number;
  experiencia: number;
  avatar?: string;
  cv?: string;
  oficios?: string[];
  etiquetas?: string[];
};

// Tipo para la respuesta del backend
type BackendResponse = {
  usuarios: Array<{
    _id: string;
    rol: "empleado" | "empleador" | "visitante";
    perfil: {
      localidad: string;
      nombre: string;
      correo: string;
      telefono?: string;
      profesion?: string;
      aceptaTerminos: boolean;
      calificacion: number;
      precio: number;
      experiencia: number;
      avatar?: string;
      cv?: string;
      etiquetas?: string[];
    };
  }>;
  temporal?: boolean;
  msg?: string;
};

// Tipo para la respuesta del endpoint sin rol
type BackendResponseSinRol = {
  usuarios: Array<{
    _id: string;
    rol: "empleado" | "empleador" | "visitante";
    perfil: {
      localidad: string;
      nombre: string;
      correo: string;
      telefono?: string;
      profesion?: string;
      aceptaTerminos: boolean;
      calificacion: number;
      precio: number;
      experiencia: number;
      avatar?: string;
      cv?: string;
      oficios?: string[];
      etiquetas?: string[];
    };
  }>;
};

// Tipo para el contexto de usuario
type UserProfile = {
  _id?: string;
  nombre: string;
  localidad: string;
  precio?: number;
  calificacion?: number;
  avatar?: string;
  oficios?: string[];
};

type User = {
  rol: "empleado" | "empleador" | "visitante";
  perfiles?: UserProfile[];
};

const featuredWorkers: Worker[] = [
  {
    id: "1",
    name: "Mariela S.",
    rating: 4.9,
    experience: "6 años",
    location: "Alcorta, Santa Fe",
    price: "$7.500 / hora",
    specialties: ["Limpieza profunda", "Organización de espacios"],
    photo: "/assets/1mujer.jpg",
  },
  {
    id: "2",
    name: "Rosa L.",
    rating: 4.8,
    experience: "4 años",
    location: "Máximo Paz",
    price: "$6.800 / hora",
    specialties: ["Lavado y planchado", "Cuidado de niños"],
    photo: "/assets/2mujer.jpg",
  },
  {
    id: "3",
    name: "Narela B.",
    rating: 5.0,
    experience: "8 años",
    location: "Firmat",
    price: "$8.200 / hora",
    specialties: ["Limpieza semanal", "Cocina básica"],
    photo: "/assets/3mujer.jpg",
  },
];

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating}`}>
      {/* Estrellas llenas */}
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f-${i}`} className="text-yellow-400">★</span>
      ))}

      {/* Media estrella */}
      {half && <span className="text-yellow-300">★</span>}

      {/* Estrellas vacías */}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e-${i}`} className="text-gray-300">★</span>
      ))}

      <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
    </div>
  );
}

function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState("");

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch(q);
    }
  };

  const handleFilterClick = (item: string) => {
    const value = item === "Todos" ? "" : item; // Si es Todos, limpiamos filtro
    setQ(value);
    onSearch(value);
  };

  return (
    <div className="w-full max-w-2xl rounded-2xl shadow-lg p-2 sm:p-3 bg-white/80 backdrop-blur border border-black/5">
      <div>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Coloca una etiqueta"
          className="flex-1 bg-transparent outline-none px-3 py-2 text-base min-w-0"
        />

        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {[
            "Limpieza",
            "Electricidad",
            "Reparación General",
            "Jardinería",
            "Cocina",
            "Cuidado de niños",
            "Todos",
          ].map((item) => (
            <button
              key={item}
              onClick={() => handleFilterClick(item)}
              className={`px-2 py-1 rounded-full border border-black/10 hover:bg-black/5 transition ${(item === "Todos" && q === "") || q === item
                ? "bg-blue-500 text-white"
                : ""
                }`}
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => onSearch(q)}
            className="rounded-xl px-4 py-2 bg-black text-white hover:bg-neutral-800 transition shadow whitespace-nowrap"
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, setUser } = useUser() as { user: User | null; setUser: (user: User | null) => void };
  const [listaPerfiles, setListaPerfiles] = useState<PerfilSinRol[]>([]);
  const [todosLosPerfiles, setTodosLosPerfiles] = useState<Perfil[]>([]);
  const [perfilesFiltrados, setPerfilesFiltrados] = useState<Perfil[]>([]);
  const [query, setQuery] = useState("");
  const [showScroll, setShowScroll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  // Determinar si mostrar datos del backend o de prueba
  const showBackendData = user && (user.rol === "empleador" || user.rol === "empleado");
  const showDemoData = !user || user.rol === "visitante";

  const MySwal = withReactContent(Swal);

  // Función para obtener todos los perfiles del backend
  const obtenerTodosLosPerfiles = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No hay token, usuario no logueado");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`https://redoficios-back.vercel.app/api/perfil/obtener/todos`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: BackendResponse = await res.json();
      console.log("DATA DEL BACKEND:", data);

      if (!res.ok) {
        Swal.fire("Error", data.msg || "No se pudo cargar los perfiles", "error");
        setLoading(false);
        return;
      }

      if (Array.isArray(data.usuarios)) {
        // Filtrar solo empleados y ordenar por calificación
        const perfilesEmpleados = data.usuarios
          .filter((perfil: Perfil) => perfil.rol === "empleado")
          .sort((a: Perfil, b: Perfil) => b.perfil.calificacion - a.perfil.calificacion);

        setTodosLosPerfiles(perfilesEmpleados);
        setPerfilesFiltrados(perfilesEmpleados);
      } else {
        console.warn("No hay usuarios para mostrar");
      }

      if (data.temporal) {
        Swal.fire("Aviso", "Usuario temporal cargado", "info");
      }

    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo conectar al servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar perfiles por etiquetas y características
  const buscarPerfilesPorEtiquetas = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setPerfilesFiltrados(todosLosPerfiles);
      setCurrentProfileIndex(0);
      return;
    }

    const queryLower = searchQuery.toLowerCase().trim();

    // Buscar en etiquetas, profesión, nombre y localidad
    const perfilesFiltradosResult = todosLosPerfiles.filter((perfil) => {
      const etiquetas = perfil.perfil.etiquetas?.map(tag => tag.toLowerCase()) || [];
      const profesion = perfil.perfil.profesion?.toLowerCase() || "";
      const nombre = perfil.perfil.nombre?.toLowerCase() || "";
      const localidad = perfil.perfil.localidad?.toLowerCase() || "";

      // Verificar si la búsqueda coincide con alguna etiqueta, profesión, nombre o localidad
      return etiquetas.some(tag => tag.includes(queryLower)) ||
        profesion.includes(queryLower) ||
        nombre.includes(queryLower) ||
        localidad.includes(queryLower);
    });

    setPerfilesFiltrados(perfilesFiltradosResult);
    setCurrentProfileIndex(0); // Resetear el índice cuando se hace una nueva búsqueda
  };

  // Función para obtener 3 perfiles rotatorios
  const obtenerPerfilesRotatorios = (perfiles: Perfil[]) => {
    if (perfiles.length === 0) return [];
    if (perfiles.length <= 3) return perfiles;

    // Crear grupos de 3 perfiles
    const grupos: Perfil[][] = [];
    for (let i = 0; i < perfiles.length; i += 3) {
      grupos.push(perfiles.slice(i, i + 3));
    }

    // Si el último grupo tiene menos de 3, completar con perfiles del inicio
    const ultimoGrupo = grupos[grupos.length - 1];
    if (ultimoGrupo.length < 3) {
      const faltantes = 3 - ultimoGrupo.length;
      const perfilesExtra = perfiles.slice(0, faltantes);
      grupos[grupos.length - 1] = [...ultimoGrupo, ...perfilesExtra];
    }

    // Alternar el orden de los grupos para crear variación
    const grupoIndex = Math.floor(currentProfileIndex / 3) % grupos.length;
    let grupoActual = grupos[grupoIndex];

    // Crear diferentes patrones de alternancia basados en el tiempo
    const patronIndex = Math.floor(Date.now() / (3 * 60 * 1000)) % 4; // Cambia cada 3 minutos

    switch (patronIndex) {
      case 1:
        grupoActual = [grupoActual[2], grupoActual[0], grupoActual[1]]; // 3-1-2
        break;
      case 2:
        grupoActual = [grupoActual[1], grupoActual[2], grupoActual[0]]; // 2-3-1
        break;
      case 3:
        grupoActual = [grupoActual[2], grupoActual[1], grupoActual[0]]; // 3-2-1
        break;
      default:
        // Mantener orden original 1-2-3
        break;
    }

    return grupoActual;
  };

  // Manejar la búsqueda
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    buscarPerfilesPorEtiquetas(searchQuery);
  };

  // Efecto para la rotación automática cada 3 minutos
  useEffect(() => {
    if (todosLosPerfiles.length > 3 && !query) {
      const interval = setInterval(() => {
        setCurrentProfileIndex(prev => prev + 3);
      }, 3 * 60 * 1000); // 3 minutos

      return () => clearInterval(interval);
    }
  }, [todosLosPerfiles.length, query]);

  useEffect(() => {
    if (user && (user.rol === "empleador" || user.rol === "empleado")) {
      obtenerTodosLosPerfiles();
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Obtener perfiles a mostrar (con rotación si no hay búsqueda)
  const perfilesAMostrar = query ? perfilesFiltrados : obtenerPerfilesRotatorios(perfilesFiltrados);

  // Verificar si debe mostrar perfiles del usuario
  const shouldShowUserProfiles = showBackendData && todosLosPerfiles.length > 0;

  // Filtrar workers de prueba solo para visitantes
  const filteredTestWorkers = showDemoData
    ? featuredWorkers.filter((w) => {
      if (!query) return true;
      const haystack = (w.name + " " + w.location + " " + w.experience + " " + w.specialties.join(" ")).toLowerCase();
      return haystack.includes(query.toLowerCase());
    })
    : [];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchPerfiles = async () => {
    try {
      const response = await fetch("https://redoficios-back.vercel.app/api/perfil/obtener/todos/sin-rol");
      if (!response.ok) {
        throw new Error(`Error al traer los perfiles: ${response.status} ${response.statusText}`);
      }

      const data: BackendResponseSinRol = await response.json();

      // Verificamos que la propiedad 'usuarios' exista y sea un array
      if (!Array.isArray(data.usuarios)) {
        console.error("Error: la respuesta del backend no contiene un array 'usuarios'", data);
        return;
      }

      // Extraemos solo los perfiles de cada usuario
      const perfiles: PerfilSinRol[] = data.usuarios.map((usuario) => ({
        ...usuario.perfil,
        _id: usuario._id,
        rol: usuario.rol
      }));

      setListaPerfiles(perfiles);

      console.log("Perfiles obtenidos:", JSON.stringify(perfiles, null, 2));

    } catch (error) {
      console.error("Error al cargar perfiles:", error);
    }
  };

  // Llamar a la API cuando se monta el componente
  useEffect(() => {
    fetchPerfiles();
  }, []);

  // Manejar WhatsApp para perfil del backend
  const handleWhatsAppBackend = (perfil: Perfil) => {
    if (!user || user.rol === "visitante") {
      MySwal.fire({
        title: "Acceso restringido",
        text: "Debes iniciar sesión como empleador para contactar profesionales",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ir a Login",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/login");
        }
      });
      return;
    }

    let nro = perfil.perfil.telefono || "";
    nro = nro.replace(/\D/g, "");

    if (!nro) {
      MySwal.fire({
        title: "Número no disponible",
        text: "Este perfil no tiene número de WhatsApp disponible.",
        icon: "info",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    const url = `https://api.whatsapp.com/send?phone=${nro}&text=${encodeURIComponent(
      `Hola ${perfil.perfil.nombre}, vi tu perfil en RedOficios y me interesa coordinar un servicio.`
    )}`;
    window.open(url, "_blank");
  };

  // Manejar acción para workers de prueba
  const handleTestWorkerAction = (worker: Worker) => {
    MySwal.fire({
      title: "Inicia sesión",
      text: "Debes iniciar sesión para contactar con los profesionales",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Iniciar sesión",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/login");
      }
    });
  };

  // Función para recomendar perfiles similares
  const recomendarPerfiles = () => {
    MySwal.fire({
      title: "¿Quieres recomendar a alguien?",
      text: "Puedes sugerir profesionales que conozcas para ampliar nuestra red",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Recomendar por WhatsApp",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Mensaje para recomendar RedOficios
        const mensaje = encodeURIComponent(
          "Vi esta web que se llama RedOficios, te puede interesar. Mirá: https://redoficios.com.ar/register"
        );

        // Abrir WhatsApp con el mensaje predefinido
        const whatsappUrl = `https://api.whatsapp.com/send?text=${mensaje}`;
        window.open(whatsappUrl, "_blank");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Cargando perfiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-neutral-900">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-20">
          <Image src="/assets/hero.jpg" alt="Hogar limpio" fill className="object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24 grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-[-0.02em]">
              Encontrá tu asistente de limpieza <span className="text-emerald-600">cerca tuyo</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-neutral-700 max-w-lg mx-auto lg:mx-0">
              Publicá tu necesidad, compará perfiles verificados y reservá en minutos.
            </p>

            <div className="mt-4 text-xs sm:text-sm text-neutral-600 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-1"><span className="text-emerald-600">●</span> Perfiles verificados</span>
              <span className="inline-flex items-center gap-1"><span className="text-emerald-600">●</span> Pagos seguros</span>
              <span className="inline-flex items-center gap-1"><span className="text-emerald-600">●</span> Opiniones reales</span>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {user ? (
                <a href="/dashboard" className="px-5 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow text-center">
                  Acceder a mi panel
                </a>
              ) : (
                <a href="/login" className="px-5 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow text-center">
                  Iniciar sesión
                </a>
              )}
              <a href="#destacadas" className="px-5 py-3 rounded-2xl border border-black/10 hover:bg-black/5 text-center">
                Ver perfiles
              </a>
            </div>
          </div>
          <div className="relative block mt-8 lg:mt-0">
            <div className="relative aspect-[4/3] w-full max-w-md mx-auto lg:max-w-none rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
              <Image src="/assets/hero.jpg" alt="Antes y después" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* PERFILES DEL BACKEND - Solo para usuarios logueados */}
      {shouldShowUserProfiles && (
        <section id="destacadas" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                {query ? "Resultados de búsqueda" : "Perfiles destacados"}
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base">
                {query ? `Buscando: "${query}"` : "Reservá con confianza. Verificamos identidad y referencias."}
              </p>
              {!query && todosLosPerfiles.length > 5 && (
                <p className="text-xs text-emerald-600 mt-1">
                  Los perfiles se actualizan cada 3 minutos • Mostrando {perfilesAMostrar.length} de {todosLosPerfiles.length}
                </p>
              )}
            </div>
            <a
              href="/empleo"
              className="text-sm font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors mx-auto sm:mx-0"
            >
              Ver todos →
            </a>
          </div>

          {perfilesAMostrar.length > 0 ? (
            <>
              <div className="mt-6 flex justify-center lg:justify-start">
                <SearchBar onSearch={handleSearch} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {perfilesAMostrar.map((perfil, index) => (
                  <article key={`${perfil._id}-${index}-${currentProfileIndex}`}
                    className="group rounded-3xl border border-black/5 bg-white hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-40 sm:h-48 w-full">
                      <img
                        src={perfil.perfil.avatar || "/assets/1mujer.jpg"}
                        alt={perfil.perfil.nombre}
                        className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        ★ {perfil.perfil.calificacion.toFixed(1)}
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base sm:text-lg truncate">{perfil.perfil.nombre}</h3>
                          <p className="text-xs sm:text-sm text-neutral-600 truncate">
                            {perfil.perfil.localidad || "No especificada"} • {perfil.perfil.experiencia || 0} años
                          </p>
                          {perfil.perfil.profesion && (
                            <p className="text-xs text-emerald-600 font-medium">{perfil.perfil.profesion}</p>
                          )}
                        </div>
                        <span className="text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg whitespace-nowrap">
                          ${perfil.perfil.precio.toLocaleString()}/hora
                        </span>
                      </div>

                      <Stars rating={perfil.perfil.calificacion} />
                      {perfil.perfil.etiquetas && perfil.perfil.etiquetas.length > 0 ? (
                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                          {perfil.perfil.etiquetas.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 truncate"
                            >
                              {tag}
                            </span>
                          ))}
                          {perfil.perfil.etiquetas.length > 3 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              +{perfil.perfil.etiquetas.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 truncate">No hay etiquetas</span>
                      )}

                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <a
                          href={`/contratar/${perfil._id}`}
                          className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 text-center transition-colors"
                          onClick={() => {
                            // Guardamos el perfil seleccionado en localStorage
                            localStorage.setItem("perfilSeleccionado", JSON.stringify(perfil));
                          }}
                        >
                          Ver perfil
                        </a>

                        <button
                          onClick={recomendarPerfiles}
                          className="px-3 py-2 rounded-xl bg-orange-500 text-white text-sm hover:bg-orange-600 text-center transition-colors"
                        >
                          Recomendar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : query ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay perfiles con esas características
              </h3>
              <p className="text-gray-600 mb-6">
                No encontramos profesionales que coincidan con tu búsqueda <strong>{query}</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  onClick={() => handleSearch("")}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  Ver todos los perfiles
                </button>
                <button
                  onClick={recomendarPerfiles}
                  className="px-4 py-2 rounded-xl border border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  ¿Quieres recomendar a alguien?
                </button>
              </div>
            </div>
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-neutral-600">No hay perfiles disponibles</p>
            </div>
          )}
        </section>
      )}

      <section id="destacadas" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {user ? (
            // 🔑 Si está logueado muestro SOLO los perfiles vinculados al usuario
            (user.perfiles || []).map((p, i) => (
              <article
                key={p._id || i}
                className="group rounded-3xl border border-black/5 bg-white hover:shadow-xl transition overflow-hidden"
              >
                <div className="relative h-40 sm:h-48 w-full">
                  <img
                    src={p.avatar || "/assets/RedOficiosLogo.png"}
                    alt={p.nombre || "Trabajador"}
                    className="object-cover w-full h-full group-hover:scale-[1.03] transition"
                  />
                </div>
                <div className="p-4 sm:p-5 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg truncate">
                        {p.nombre}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 truncate">
                        {p.localidad}
                      </p>
                    </div>
                    <span className="text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg whitespace-nowrap">
                      {p.precio ? `${p.precio}` : ""}
                    </span>
                  </div>
                  <Stars rating={p.calificacion || 0} />
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                    {(p.oficios || []).slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-black/5 truncate"
                      >
                        {tag}
                      </span>
                    ))}
                    {(p.oficios?.length || 0) > 2 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-black/5">
                        +{(p.oficios?.length || 0) - 2}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            // 🔑 Si NO está logueado muestro tal cual lo que trae fetchPerfiles (máximo 3 empleados)
            listaPerfiles
              .filter((p) => p.rol === "empleado")
              .slice(0, 3)
              .map((p, i) => (
                <article
                  key={p._id || i}
                  className="group rounded-3xl border border-black/5 bg-white hover:shadow-xl transition overflow-hidden"
                >
                  <div className="relative h-40 sm:h-48 w-full">
                    <img
                      src={p.avatar || "/assets/RedOficiosLogo.png"}
                      alt={p.nombre || "Trabajador"}
                      className="object-cover w-full h-full group-hover:scale-[1.03] transition"
                    />
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg truncate">
                          {p.nombre}
                        </h3>
                        <p className="text-xs sm:text-sm text-neutral-600 truncate">
                          {p.localidad}
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg whitespace-nowrap">
                        {p.precio ? `${p.precio}` : ""}
                      </span>
                    </div>
                    <Stars rating={p.calificacion || 0} />
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                      {(p.oficios || []).slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-black/5 truncate"
                        >
                          {tag}
                        </span>
                      ))}
                      {(p.oficios?.length || 0) > 2 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-black/5">
                          +{(p.oficios?.length || 0) - 2}
                        </span>
                      )}
                    </div>
                    <a
                      href={`/login`}
                      className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-sm hover:bg-indigo-700 text-center transition-colors"
                    >
                      Iniciar Sesion
                    </a>
                  </div>
                </article>
              ))
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="bg-emerald-50/60 border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Publicá tu necesidad", desc: "Indicá fecha, horario y tareas. Es gratis.", icon: "📝" },
            { title: "Elegí el perfil", desc: "Compará precios, reseñas y experiencia.", icon: "🔍" },
            { title: "Reservá y pagá seguro", desc: "Coordiná por chat y pagá protegido.", icon: "✅" },
          ].map((s, i) => (
            <div key={i} className="rounded-3xl bg-white p-4 sm:p-6 border border-black/5 shadow-sm text-center md:text-left">
              <div className="text-2xl sm:text-3xl">{s.icon}</div>
              <h3 className="mt-3 font-semibold text-base sm:text-lg">{s.title}</h3>
              <p className="text-neutral-600 mt-1 text-sm sm:text-base">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST & SAFETY */}
      <section id="seguridad" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          <div className="relative h-48 sm:h-64 lg:h-80 rounded-3xl overflow-hidden ring-1 ring-black/5 shadow-xl order-2 lg:order-1">
            <Image src="/assets/trust.jpg" alt="Seguridad" fill className="object-cover" />
          </div>
          <div className="text-center lg:text-left order-1 lg:order-2">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Tu seguridad es prioridad</h2>
            <ul className="mt-4 space-y-2 text-neutral-700 text-sm sm:text-base list-disc list-inside text-left max-w-md mx-auto lg:mx-0">
              <li>Verificación de identidad y referencias.</li>
              <li>Mensajería y pagos con protección.</li>
              <li>Soporte ante cualquier inconveniente.</li>
            </ul>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a href="/register" className="px-5 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow text-center">Crear cuenta</a>
              <a href="/learn-more" className="px-5 py-3 rounded-2xl border border-black/10 hover:bg-black/5 text-center">Saber más</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-6 sm:p-8 lg:p-10 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-6 items-center text-center md:text-left">
              <div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">¿Lista para empezar?</h3>
                <p className="mt-2 text-emerald-50 text-sm sm:text-base">Publicá tu pedido o registrate como profesional y empezá a trabajar hoy.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
                <a href="/post" className="px-4 sm:px-5 py-3 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 text-center text-sm sm:text-base">Publicar un pedido</a>
                <a href="/register" className="px-4 sm:px-5 py-3 rounded-2xl border border-white/60 hover:bg-white/10 text-center text-sm sm:text-base">Soy profesional</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Botón Ir arriba */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-10 sm:right-10 p-2 sm:p-3 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-900 transition text-sm sm:text-base z-50"
          aria-label="Ir arriba"
        >
          ↑
        </button>
      )}
    </div>
  );
}




// if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center px-4">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-emerald-600"></div>
//           <p className="mt-4 text-gray-600 text-sm sm:text-base">Cargando perfiles...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white text-neutral-900">
//       {/* HERO */}
//       <section className="relative overflow-hidden">
//         <div className="absolute inset-0 -z-10 opacity-20">
//           <Image src="/assets/hero.jpg" alt="Hogar limpio" fill className="object-cover" />
//         </div>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-24 grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
//           <div className="text-center lg:text-left">
//             <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-[-0.02em]">
//               Encontrá tu asistente de limpieza <span className="text-emerald-600">cerca tuyo</span>
//             </h1>
//             <p className="mt-4 text-sm sm:text-base md:text-lg text-neutral-700 max-w-lg mx-auto lg:mx-0">
//               Publicá tu necesidad, compará perfiles verificados y reservá en minutos.
//             </p>

//             <div className="mt-4 text-xs sm:text-sm text-neutral-600 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-3">
//               <span className="inline-flex items-center gap-1"><span className="text-emerald-600">●</span> Perfiles verificados</span>
//               <span className="inline-flex items-center gap-1"><span className="text-emerald-600">●</span> Pagos seguros</span>
//               <span className="inline-flex items-center gap-1"><span className="text-emerald-600">●</span> Opiniones reales</span>
//             </div>
//             <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
//               {user ? (
//                 <a href="/dashboard" className="px-4 sm:px-5 py-2 sm:py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow text-center text-sm sm:text-base">
//                   Acceder a mi panel
//                 </a>
//               ) : (
//                 <a href="/login" className="px-4 sm:px-5 py-2 sm:py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow text-center text-sm sm:text-base">
//                   Iniciar sesión
//                 </a>
//               )}
//               <a href="#destacadas" className="px-4 sm:px-5 py-2 sm:py-3 rounded-2xl border border-black/10 hover:bg-black/5 text-center text-sm sm:text-base">
//                 Ver perfiles
//               </a>
//             </div>
//           </div>
//           <div className="relative block mt-8 lg:mt-0">
//             <div className="relative aspect-[4/3] w-full max-w-md mx-auto lg:max-w-none rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/5">
//               <Image src="/assets/hero.jpg" alt="Antes y después" fill className="object-cover" />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* PERFILES DEL BACKEND - Solo para usuarios logueados */}
//       {shouldShowUserProfiles && (
//         <section id="destacadas" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
//           <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
//             <div className="text-center sm:text-left w-full sm:w-auto">
//               <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
//                 {query ? "Resultados de búsqueda" : "Perfiles destacados"}
//               </h2>
//               <p className="text-neutral-600 text-sm sm:text-base">
//                 {query ? `Buscando: "${query}"` : "Reservá con confianza. Verificamos identidad y referencias."}
//               </p>
//               {!query && todosLosPerfiles.length > 5 && (
//                 <p className="text-xs text-emerald-600 mt-1">
//                   Los perfiles se actualizan cada 3 minutos • Mostrando {perfilesAMostrar.length} de {todosLosPerfiles.length}
//                 </p>
//               )}
//             </div>
//             <a
//               href="/empleo"
//               className="text-sm font-bold text-white bg-indigo-600 px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors mx-auto sm:mx-0 whitespace-nowrap"
//             >
//               Ver todos →
//             </a>
//           </div>

//           {perfilesAMostrar.length > 0 ? (
//             <>
//               <div className="mt-6 flex justify-center lg:justify-start">
//                 <SearchBar onSearch={handleSearch} />
//               </div>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-8">
//                 {perfilesAMostrar.map((perfil, index) => (
//                   <article key={`${perfil._id}-${index}-${currentProfileIndex}`}
//                     className="group rounded-2xl sm:rounded-3xl border border-black/5 bg-white hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
//                   >
//                     <div className="relative h-40 sm:h-44 md:h-48 w-full overflow-hidden flex-shrink-0">
//                       <img
//                         src={perfil.perfil.avatar || "/assets/1mujer.jpg"}
//                         alt={perfil.perfil.nombre}
//                         className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-300"
//                       />
//                       <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
//                         ★ {perfil.perfil.calificacion.toFixed(1)}
//                       </div>
//                     </div>
//                     <div className="p-3 sm:p-4 md:p-5 flex flex-col gap-2 flex-grow">
//                       <div className="flex items-start justify-between gap-2">
//                         <div className="min-w-0 flex-1">
//                           <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">{perfil.perfil.nombre}</h3>
//                           <p className="text-xs sm:text-sm text-neutral-600 truncate">
//                             {perfil.perfil.localidad || "No especificada"} • {perfil.perfil.experiencia || 0} años
//                           </p>
//                           {perfil.perfil.profesion && (
//                             <p className="text-xs text-emerald-600 font-medium truncate">{perfil.perfil.profesion}</p>
//                           )}
//                         </div>
//                         <span className="text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
//                           ${perfil.perfil.precio.toLocaleString()}/h
//                         </span>
//                       </div>

//                       <Stars rating={perfil.perfil.calificacion} />
//                       {perfil.perfil.etiquetas && perfil.perfil.etiquetas.length > 0 ? (
//                         <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
//                           {perfil.perfil.etiquetas.slice(0, 2).map((tag) => (
//                             <span
//                               key={tag}
//                               className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 truncate max-w-[80px]"
//                               title={tag}
//                             >
//                               {tag}
//                             </span>
//                           ))}
//                           {perfil.perfil.etiquetas.length > 2 && (
//                             <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 flex-shrink-0">
//                               +{perfil.perfil.etiquetas.length - 2}
//                             </span>
//                           )}
//                         </div>
//                       ) : (
//                         <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 truncate">No hay etiquetas</span>
//                       )}

//                       <div className="mt-auto pt-3 flex flex-col gap-2">
//                         <a
//                           href={`/contratar/${perfil._id}`}
//                           className="w-full px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm hover:bg-indigo-700 text-center transition-colors"
//                           onClick={() => {
//                             localStorage.setItem("perfilSeleccionado", JSON.stringify(perfil));
//                           }}
//                         >
//                           Ver perfil
//                         </a>
//                         <button
//                           onClick={recomendarPerfiles}
//                           className="w-full px-3 py-2 rounded-xl bg-orange-500 text-white text-xs sm:text-sm hover:bg-orange-600 text-center transition-colors"
//                         >
//                           Recomendar
//                         </button>
//                       </div>
//                     </div>
//                   </article>
//                 ))}
//               </div>
//             </>
//           ) : query ? (
//             <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
//               <div className="text-4xl sm:text-6xl mb-4">🔍</div>
//               <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
//                 No hay perfiles con esas características
//               </h3>
//               <p className="text-gray-600 mb-6 text-sm sm:text-base px-4">
//                 No encontramos profesionales que coincidan con tu búsqueda <strong>{query}</strong>
//               </p>
//               <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4">
//                 <button
//                   onClick={() => handleSearch("")}
//                   className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm"
//                 >
//                   Ver todos los perfiles
//                 </button>
//                 <button
//                   onClick={recomendarPerfiles}
//                   className="w-full sm:w-auto px-4 py-2 rounded-xl border border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-colors text-sm"
//                 >
//                   ¿Quieres recomendar a alguien?
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="col-span-full text-center py-8">
//               <p className="text-neutral-600 text-sm sm:text-base">No hay perfiles disponibles</p>
//             </div>
//           )}
//         </section>
//       )}

//       <section id="destacadas" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
//           {user ? (
//             // 🔑 Si está logueado muestro SOLO los perfiles vinculados al usuario
//             (user.perfiles || []).map((p, i) => (
//               <article
//                 key={p._id || i}
//                 className="group rounded-2xl sm:rounded-3xl border border-black/5 bg-white hover:shadow-xl transition overflow-hidden flex flex-col"
//               >
//                 <div className="relative h-40 sm:h-44 md:h-48 w-full overflow-hidden flex-shrink-0">
//                   <img
//                     src={p.avatar || "/assets/RedOficiosLogo.png"}
//                     alt={p.nombre || "Trabajador"}
//                     className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition"
//                   />
//                 </div>
//                 <div className="p-3 sm:p-4 md:p-5 flex flex-col gap-2 flex-grow">
//                   <div className="flex items-start justify-between gap-2">
//                     <div className="min-w-0 flex-1">
//                       <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">
//                         {p.nombre}
//                       </h3>
//                       <p className="text-xs sm:text-sm text-neutral-600 truncate">
//                         {p.localidad}
//                       </p>
//                     </div>
//                     <span className="text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
//                       {p.precio ? `$${p.precio}` : ""}
//                     </span>
//                   </div>
//                   <Stars rating={p.calificacion || 0} />
//                   <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
//                     {(p.oficios || []).slice(0, 2).map((tag: string) => (
//                       <span
//                         key={tag}
//                         className="text-xs px-2 py-1 rounded-full bg-black/5 truncate max-w-[80px]"
//                         title={tag}
//                       >
//                         {tag}
//                       </span>
//                     ))}
//                     {(p.oficios?.length || 0) > 2 && (
//                       <span className="text-xs px-2 py-1 rounded-full bg-black/5 flex-shrink-0">
//                         +{(p.oficios?.length || 0) - 2}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </article>
//             ))
//           ) : (
//             // 🔑 Si NO está logueado muestro tal cual lo que trae fetchPerfiles (máximo 3 empleados)
//             listaPerfiles
//               .filter((p) => p.rol === "empleado")
//               .slice(0, 3)
//               .map((p, i) => (
//                 <article
//                   key={p._id || i}
//                   className="group rounded-2xl sm:rounded-3xl border border-black/5 bg-white hover:shadow-xl transition overflow-hidden flex flex-col"
//                 >
//                   <div className="relative h-40 sm:h-44 md:h-48 w-full overflow-hidden flex-shrink-0">
//                     <img
//                       src={p.avatar || "/assets/RedOficiosLogo.png"}
//                       alt={p.nombre || "Trabajador"}
//                       className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition"
//                     />
//                   </div>
//                   <div className="p-3 sm:p-4 md:p-5 flex flex-col gap-2 flex-grow">
//                     <div className="flex items-start justify-between gap-2">
//                       <div className="min-w-0 flex-1">
//                         <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">
//                           {p.nombre}
//                         </h3>
//                         <p className="text-xs sm:text-sm text-neutral-600 truncate">
//                           {p.localidad}
//                         </p>
//                       </div>
//                       <span className="text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
//                         {p.precio ? `$${p.precio}` : ""}
//                       </span>
//                     </div>
//                     <Stars rating={p.calificacion || 0} />
//                     <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 mb-3">
//                       {(p.oficios || []).slice(0, 2).map((tag: string) => (
//                         <span
//                           key={tag}
//                           className="text-xs px-2 py-1 rounded-full bg-black/5 truncate max-w-[80px]"
//                           title={tag}
//                         >
//                           {tag}
//                         </span>
//                       ))}
//                       {(p.oficios?.length || 0) > 2 && (
//                         <span className="text-xs px-2 py-1 rounded-full bg-black/5 flex-shrink-0">
//                           +{(p.oficios?.length || 0) - 2}
//                         </span>
//                       )}
//                     </div>
//                     <div className="mt-auto">
//                       <a
//                         href={`/login`}
//                         className="w-full block px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm hover:bg-indigo-700 text-center transition-colors"
//                       >
//                         Iniciar Sesión
//                       </a>
//                     </div>
//                   </div>
//                 </article>
//               ))
//           )}
//         </div>
//       </section>

//       {/* HOW IT WORKS */}
//       <section id="como-funciona" className="bg-emerald-50/60 border-y border-black/5">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
//           {[
//             { title: "Publicá tu necesidad", desc: "Indicá fecha, horario y tareas. Es gratis.", icon: "📝" },
//             { title: "Elegí el perfil", desc: "Compará precios, reseñas y experiencia.", icon: "🔍" },
//             { title: "Reservá y pagá seguro", desc: "Coordiná por chat y pagá protegido.", icon: "✅" },
//           ].map((s, i) => (
//             <div key={i} className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 border border-black/5 shadow-sm text-center md:text-left">
//               <div className="text-2xl sm:text-3xl">{s.icon}</div>
//               <h3 className="mt-3 font-semibold text-base sm:text-lg">{s.title}</h3>
//               <p className="text-neutral-600 mt-1 text-sm sm:text-base">{s.desc}</p>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* TRUST & SAFETY */}
//       <section id="seguridad" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
//         <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
//           <div className="relative h-48 sm:h-64 lg:h-80 rounded-2xl sm:rounded-3xl overflow-hidden ring-1 ring-black/5 shadow-xl order-2 lg:order-1">
//             <Image src="/assets/trust.jpg" alt="Seguridad" fill className="object-cover" />
//           </div>
//           <div className="text-center lg:text-left order-1 lg:order-2">
//             <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Tu seguridad es prioridad</h2>
//             <ul className="mt-4 space-y-2 text-neutral-700 text-sm sm:text-base list-disc list-inside text-left max-w-md mx-auto lg:mx-0">
//               <li>Verificación de identidad y referencias.</li>
//               <li>Mensajería y pagos con protección.</li>
//               <li>Soporte ante cualquier inconveniente.</li>
//             </ul>
//             <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
//               <a href="/register" className="px-4 sm:px-5 py-2 sm:py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 shadow text-center text-sm sm:text-base">Crear cuenta</a>
//               <a href="/learn-more" className="px-4 sm:px-5 py-2 sm:py-3 rounded-2xl border border-black/10 hover:bg-black/5 text-center text-sm sm:text-base">Saber más</a>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="py-8 sm:py-14">
//         <div className="max-w-5xl mx-auto px-4 sm:px-6">
//           <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-6 sm:p-8 lg:p-10 shadow-2xl">
//             <div className="grid md:grid-cols-2 gap-6 items-center text-center md:text-left">
//               <div>
//                 <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">¿Lista para empezar?</h3>
//                 <p className="mt-2 text-emerald-50 text-sm sm:text-base">Publicá tu pedido o registrate como profesional y empezá a trabajar hoy.</p>
//               </div>
//               <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
//                 <a href="/post" className="px-4 sm:px-5 py-2 sm:py-3 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 text-center text-sm sm:text-base">Publicar un pedido</a>
//                 <a href="/register" className="px-4 sm:px-5 py-2 sm:py-3 rounded-2xl border border-white/60 hover:bg-white/10 text-center text-sm sm:text-base">Soy profesional</a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Botón Ir arriba */}
//       {showScroll && (
//         <button
//           onClick={scrollToTop}
//           className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 lg:bottom-10 lg:right-10 p-2 sm:p-3 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-900 transition text-sm sm:text-base z-50"
//           aria-label="Ir arriba"
//         >
//           ↑
//         </button>
//       )}
//     </div>
//   );
// }

