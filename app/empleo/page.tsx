// Main component

"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useUser } from "../contexts/UserContext";

type Perfil = {
  _id: string;
  rol: "empleado" | "empleador" | "visitante";
  perfil: {
    localidad: string;
    nombre: string;
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

type PaginatedData<T> = {
  items: T[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
  {
    id: "4",
    name: "Mariela S.",
    rating: 4.9,
    experience: "6 años",
    location: "Alcorta, Santa Fe",
    price: "$7.500 / hora",
    specialties: ["Limpieza profunda", "Organización de espacios"],
    photo: "/assets/1mujer.jpg",
  },
  {
    id: "5",
    name: "Rosa L.",
    rating: 4.8,
    experience: "4 años",
    location: "Máximo Paz",
    price: "$6.800 / hora",
    specialties: ["Lavado y planchado", "Cuidado de niños"],
    photo: "/assets/2mujer.jpg",
  },
  {
    id: "6",
    name: "Narela B.",
    rating: 5.0,
    experience: "8 años",
    location: "Firmat",
    price: "$8.200 / hora",
    specialties: ["Limpieza semanal", "Cocina básica"],
    photo: "/assets/3mujer.jpg",
  },
  {
    id: "7",
    name: "Mariela S.",
    rating: 4.9,
    experience: "6 años",
    location: "Alcorta, Santa Fe",
    price: "$7.500 / hora",
    specialties: ["Limpieza profunda", "Organización de espacios"],
    photo: "/assets/1mujer.jpg",
  },
  {
    id: "8",
    name: "Rosa L.",
    rating: 4.8,
    experience: "4 años",
    location: "Máximo Paz",
    price: "$6.800 / hora",
    specialties: ["Lavado y planchado", "Cuidado de niños"],
    photo: "/assets/2mujer.jpg",
  },
  {
    id: "9",
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

// Componente de Paginación
function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getVisiblePages = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Si hay 7 páginas o menos, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Siempre mostrar primera página
      pages.push(1);

      if (currentPage > 4) {
        pages.push('...');
      }

      // Páginas alrededor de la actual
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push('...');
      }

      // Siempre mostrar última página
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
      {/* Botón Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        ← Anterior
      </button>

      {/* Números de página */}
      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={typeof page === 'string'}
          className={`px-3 py-2 rounded-lg text-sm transition-colors ${page === currentPage
            ? 'bg-emerald-600 text-white'
            : typeof page === 'string'
              ? 'bg-transparent text-gray-400 cursor-default'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          {page}
        </button>
      ))}

      {/* Botón Siguiente */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        Siguiente →
      </button>
    </div>
  );
}

export default function EmpleoComponent() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [listaPerfiles, setListaPerfiles] = useState<Perfil[]>([]);
  const [todosLosPerfiles, setTodosLosPerfiles] = useState<Perfil[]>([]);
  const [perfilesFiltrados, setPerfilesFiltrados] = useState<Perfil[]>([]);
  const [query, setQuery] = useState("");
  const [showScroll, setShowScroll] = useState(false);
  const [localidad, setLocalidad] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Determinar si mostrar datos del backend o de prueba
  const showBackendData = user && (user.rol === "empleador" || user.rol === "empleado");
  const showDemoData = !user || user.rol === "visitante";

  const MySwal = withReactContent(Swal);

  // Función para obtener todos los perfiles del backend
  const obtenerTodosLosPerfiles = async (): Promise<void> => {
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

      const data = await res.json();
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
        setListaPerfiles(perfilesEmpleados);
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
  const buscarPerfilesPorEtiquetas = (searchQuery: string): void => {
    if (!searchQuery.trim()) {
      setPerfilesFiltrados(todosLosPerfiles);
      setCurrentPage(1); // Reset página al buscar
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
    setCurrentPage(1); // Reset página al buscar
  };

  // Manejar la búsqueda
  const handleSearch = (searchQuery: string): void => {
    setQuery(searchQuery);
    buscarPerfilesPorEtiquetas(searchQuery);
  };

  // Manejar cambio de página
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    // Scroll suave hacia arriba al cambiar de página
    document.getElementById('destacadas')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Calcular datos de paginación
  const getPaginatedData = <T,>(data: T[]): PaginatedData<T> => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = data.slice(startIndex, endIndex);

    return {
      items: paginatedItems,
      totalPages,
      totalItems,
      currentPage,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  };

  useEffect(() => {
    if (user && (user.rol === "empleador" || user.rol === "empleado")) {
      obtenerTodosLosPerfiles();
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = (): void => setShowScroll(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Obtener datos paginados
  const backendPaginatedData = getPaginatedData(perfilesFiltrados);
  const demoPaginatedData = getPaginatedData(
    showDemoData
      ? featuredWorkers.filter((w) => {
        if (!query) return true;
        const haystack = (w.name + " " + w.location + " " + w.experience + " " + w.specialties.join(" ")).toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
      : []
  );

  // Verificar si debe mostrar perfiles del usuario
  const shouldShowUserProfiles = showBackendData && todosLosPerfiles.length > 0;

  const scrollToTop = (): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Manejar WhatsApp para perfil del backend
  const handleWhatsAppBackend = (perfil: Perfil): void => {
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
  const handleTestWorkerAction = (worker: Worker): void => {
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
  const recomendarPerfiles = (): void => {
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
      {/* PERFILES DEL BACKEND - Solo para usuarios logueados */}
      {shouldShowUserProfiles && (
        <section id="destacadas" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                {query ? "Resultados de búsqueda" : "Perfil ideal"}
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base">
                {query ? `Buscando: "${query}"` : "Reservá con confianza. Verificamos identidad."}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Mostrando {backendPaginatedData.items.length} de {backendPaginatedData.totalItems} perfiles • Página {currentPage} de {backendPaginatedData.totalPages}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center lg:justify-start">
            <SearchBar onSearch={handleSearch} />
          </div>

          {backendPaginatedData.items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">

                {backendPaginatedData.items.map((perfil, index) => (
                  <article
                    key={`${perfil._id}-${index}-${currentPage}`}
                    className="group rounded-3xl border border-black/5 bg-white hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-40 sm:h-48 w-full">
                      <img
                        src={perfil.perfil.avatar || "/assets/1mujer.jpg"}
                        alt={perfil.perfil.nombre}
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-300 w-full h-full"
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

              {/* Paginación */}
              <Pagination
                currentPage={currentPage}
                totalPages={backendPaginatedData.totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : query ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-sm mt-8">
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
            <div className="col-span-full text-center py-8 mt-8">
              <p className="text-neutral-600">No hay perfiles disponibles</p>
            </div>
          )}
        </section>
      )}

      {/* PERFILES DE PRUEBA - Solo para visitantes */}
      {showDemoData && (

        <section id="destacadas" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Encontra el Perfil ideal</h2>
              <p className="text-xs text-emerald-600 mt-1">
                Mostrando {demoPaginatedData.items.length} de {demoPaginatedData.totalItems} perfiles • Página {currentPage} de {demoPaginatedData.totalPages}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center lg:justify-start">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
            {demoPaginatedData.items.map((w) => (
              <article key={w.id} className="group rounded-3xl border border-black/5 bg-white hover:shadow-xl transition overflow-hidden">
                <div className="relative h-40 sm:h-48 w-full">
                  <Image src={w.photo} alt={w.name} fill className="object-cover group-hover:scale-[1.03] transition" />
                </div>
                <div className="p-4 sm:p-5 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{w.name}</h3>
                      <p className="text-xs sm:text-sm text-neutral-600 truncate">{w.location} • {w.experience}</p>
                    </div>
                    <span className="text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg whitespace-nowrap">{w.price}</span>
                  </div>
                  <Stars rating={w.rating} />
                  <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                    {w.specialties.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full bg-black/5 truncate">{tag}</span>
                    ))}
                    {w.specialties.length > 2 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-black/5">
                        +{w.specialties.length - 2}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <a href={`/login`} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 text-center">Ver perfil</a>
                    <button
                      onClick={() => handleTestWorkerAction(w)}
                      className="px-3 py-2 rounded-xl bg-green-600 text-white text-sm hover:bg-green-700 text-center"
                    >
                      Iniciar sesión
                    </button>

                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Paginación para datos demo */}
          <Pagination
            currentPage={currentPage}
            totalPages={demoPaginatedData.totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      )}

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