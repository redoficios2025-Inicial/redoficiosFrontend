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
  return (
    <div className="w-full max-w-2xl rounded-2xl shadow-lg p-2 sm:p-3 bg-white/80 backdrop-blur border border-black/5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por profesión, especialidad o etiqueta"
          className="flex-1 bg-transparent outline-none px-3 py-2 text-base min-w-0"
        />
        <button
          onClick={() => onSearch(q)}
          className="rounded-xl px-4 py-2 bg-black text-white hover:bg-neutral-800 transition shadow whitespace-nowrap"
        >
          Buscar
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {["Limpieza", "Electricidad", "Plomería", "Jardinería"].map((item) => (
          <button
            key={item}
            onClick={() => { setQ(item); onSearch(item); }}
            className="px-2 py-1 rounded-full border border-black/10 hover:bg-black/5"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [listaPerfiles, setListaPerfiles] = useState<Perfil[]>([]);
  const [todosLosPerfiles, setTodosLosPerfiles] = useState<Perfil[]>([]);
  const [query, setQuery] = useState("");
  const [showScroll, setShowScroll] = useState(false);
  const [localidad, setLocalidad] = useState("");
  const [loading, setLoading] = useState(false);

  // Determinar si mostrar datos del backend o de prueba
  const showBackendData = user && (user.rol === "empleador" || user.rol === "empleado");
  const showDemoData = !user || user.rol === "visitante";

  const MySwal = withReactContent(Swal);

  // Función para obtener perfil del usuario logueado
  const obtenerTodosLosPerfiles = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No hay token, usuario no logueado");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/perfil/obtener/todos`, {
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
        // ✅ Guardar todos los perfiles en un estado (ej: lista)
        setListaPerfiles(data.usuarios); // <-- este estado debería existir en tu componente
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

  // Filtrar perfiles del usuario por búsqueda
  const shouldShowUserProfile =
    listaPerfiles.length > 0 &&
    listaPerfiles[0].rol === "empleado" &&
    (query === "" || (
      (
        listaPerfiles[0].perfil.nombre + " " +
        listaPerfiles[0].perfil.profesion + " " +
        (listaPerfiles[0].perfil.etiquetas?.join(" ") || "") + " " +
        (listaPerfiles[0].perfil.experiencia || "") + " " + // ✅ experiencia (numérico convertido a string)
        (listaPerfiles[0].perfil.localidad || "") // ✅ localidad (string)
      ).toLowerCase().includes(query.toLowerCase())
    ));

  // Filtrar todos los perfiles por búsqueda (para empleadores)
  const filteredAllProfiles = listaPerfiles.filter((perfil) => {
    if (!query && !localidad) return true; // si no hay filtros, mostrar todos

    const haystack = (
      perfil.perfil.nombre + " " +
      perfil.perfil.profesion + " " +
      (perfil.perfil.etiquetas?.join(" ") || "") + " " +
      perfil.perfil.localidad
    ).toLowerCase();

    return haystack.includes(query.toLowerCase()) && haystack.includes(localidad.toLowerCase());
  }).sort((a, b) => b.perfil.calificacion - a.perfil.calificacion);

  const shouldShowAllProfiles = user && user.rol === "empleador" && filteredAllProfiles.length > 0;

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Cargando perfil...</p>
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
            {showBackendData && (
              <div className="mt-6 flex justify-center lg:justify-start">
                <SearchBar onSearch={setQuery} />
              </div>
            )}
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

      {/* PERFIL DEL USUARIO - Solo para usuarios logueados */}
      {shouldShowUserProfile && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Perfiles destacados</h2>
              <p className="text-neutral-600 text-sm sm:text-base">Reservá con confianza. Verificamos identidad y referencias.</p>
            </div>
            <a href="/search" className="text-sm hover:underline mx-auto sm:mx-0">Ver todos →</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {listaPerfiles.length > 0 ? (
              listaPerfiles.map((perfil, index) => (
                <article
                  key={index}
                  className="group rounded-3xl border border-black/5 bg-white hover:shadow-xl transition overflow-hidden"
                >
                  <div className="relative h-40 sm:h-48 w-full">
                    <Image
                      src={"/assets/1mujer.jpg"}
                      alt={perfil.perfil.nombre}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition"
                    />
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{perfil.perfil.nombre}</h3>
                        <p className="text-xs sm:text-sm text-neutral-600 truncate">{perfil.perfil.localidad || "No especificada"} • {perfil.perfil.experiencia || 0} años</p>
                      </div>
                      <span className="text-xs sm:text-sm font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg whitespace-nowrap"> 
                        ${perfil.perfil.precio.toLocaleString()}/hora
                      </span>
                    </div>

                    <Stars rating={perfil.perfil.calificacion} />
                    <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                      {perfil.perfil.etiquetas?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-black/5 truncate"
                        >
                          {tag}
                        </span>
                      ))}
                      {perfil.perfil.etiquetas && perfil.perfil.etiquetas.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-black/5">
                          +{perfil.perfil.etiquetas.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <a
                        href={`/profile/${perfil._id}`}
                        className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 text-center"
                      >
                        Ver perfil
                      </a>
                      <button
                        onClick={() => handleWhatsAppBackend(perfil)}
                        className="px-3 py-2 rounded-xl bg-green-600 text-white text-sm hover:bg-green-700 text-center truncate"
                      >
                        WhatsApp
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-neutral-600">No hay perfiles disponibles</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* PERFILES DE PRUEBA - Solo para visitantes */}
      {showDemoData && (
        <section id="destacadas" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">Perfiles destacados</h2>
              <p className="text-neutral-600 text-sm sm:text-base">Reservá con confianza. Verificamos identidad y referencias.</p>
            </div>
            <a href="/search" className="text-sm hover:underline mx-auto sm:mx-0">Ver todos →</a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTestWorkers.map((w) => (
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
                    <a href={`/profile/${w.id}`} className="px-3 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 text-center">Ver perfil</a>
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
        </section>
      )}

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
                <a href="/pro/register" className="px-4 sm:px-5 py-3 rounded-2xl border border-white/60 hover:bg-white/10 text-center text-sm sm:text-base">Soy profesional</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Botón Ir arriba */}
      {showScroll && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-10 sm:right-10 p-2 sm:p-3 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-900 transition text-sm sm:text-base"
          aria-label="Ir arriba"
        >
          ↑
        </button>
      )}
    </div>
  );
}