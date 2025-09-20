"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    user,
    logout,
    nuevasNotificaciones,
    resetNuevasNotificaciones,
  } = useUser();

  // Color del botón según notificaciones
  const botonColor = "bg-orange-500 hover:bg-orange-600 text-white";

  // Texto dinámico del botón
  const textoNotificaciones = nuevasNotificaciones > 0 ? "Activas" : "Notificaciones";
  const textoNotificacionesMobile = nuevasNotificaciones > 0 ? "🔔 Activas" : "🔔 Notificaciones";

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Contenedor principal - Desktop */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/assets/RedOficiosLogo.png"
              alt="logo"
              width={120}
              height={120}
              className="w-20 h-auto sm:w-24 md:w-28 lg:w-32"
            />
          </Link>

          {/* Menú Desktop */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm font-medium tracking-wide text-neutral-700">
            <Link href="/" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              Inicio
            </Link>
            <Link href="/mejores-mes" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              Mejores del mes
            </Link>
            <Link href="/novedades" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
              Novedades
            </Link>
            {user?.rol === "empleador" && (
              <Link href="/calificar" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
                Calificar
              </Link>
            )}
          </nav>

          {/* Usuario o login - Desktop */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3">
            {!user ? (
              <>
                <Link href="/login" className="text-sm px-3 py-2 rounded-xl hover:bg-black/5 whitespace-nowrap">
                  Ingresar
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition whitespace-nowrap"
                >
                  Crear cuenta
                </Link>
              </>
            ) : (
              <>
                <Link href="/empleo" className="hover:text-emerald-600 transition-colors whitespace-nowrap">
                  Empleo
                </Link>
                <span className="text-gray-300">|</span>

                {/* Avatar + Nombre + Dashboard */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate max-w-[100px]">{user.nombre}</span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">({user.rol})</span>
                </div>

                <Link
                  href="/dashboard"
                  className="text-sm px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 whitespace-nowrap"
                >
                  Dashboard
                </Link>

                {/* Notificaciones Desktop */}
                <Link
                  href="/notificaciones"
                  className={`relative text-sm px-3 py-2 rounded-xl flex items-center gap-1 transition-colors whitespace-nowrap ${botonColor}`}
                  onClick={() => {
                    resetNuevasNotificaciones(); // ✅ reset contador
                  }}
                >
                  🔔 {textoNotificaciones}
                  {nuevasNotificaciones > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {nuevasNotificaciones}
                    </span>
                  )}
                </Link>

                <button
                  onClick={logout}
                  className="text-sm px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition whitespace-nowrap"
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>

          {/* Información del usuario móvil */}
          {user && (
            <div className="flex lg:hidden items-center gap-2 mr-2">
              <span className="text-xs sm:text-sm font-semibold truncate max-w-[80px] sm:max-w-[120px]">{user.nombre}</span>
              <span className="text-xs text-gray-500">({user.rol})</span>
            </div>
          )}

          {/* Botón hamburguesa */}
          <button
            className="lg:hidden flex flex-col justify-center items-center w-8 h-8 border border-gray-300 rounded transition-all hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-5 h-0.5 bg-gray-600 transition-all ${
                menuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            ></span>
            <span
              className={`block w-5 h-0.5 bg-gray-600 transition-all mt-1 ${
                menuOpen ? "opacity-0" : ""
              }`}
            ></span>
            <span
              className={`block w-5 h-0.5 bg-gray-600 transition-all mt-1 ${
                menuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            ></span>
          </button>
        </div>

        {/* Menú Mobile - Desplegable */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out ${
            menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          } overflow-hidden`}
        >
          <nav className="pt-4 pb-2 border-t border-gray-200 mt-3">
            <div className="flex flex-col space-y-3">
              {/* Links de navegación */}
              <Link
                href="/"
                className="text-sm font-medium text-neutral-700 hover:text-emerald-600 transition-colors py-2 px-2 rounded-lg hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/mejores-mes"
                className="text-sm font-medium text-neutral-700 hover:text-emerald-600 transition-colors py-2 px-2 rounded-lg hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                Mejores del mes
              </Link>
              <Link
                href="/novedades"
                className="text-sm font-medium text-neutral-700 hover:text-emerald-600 transition-colors py-2 px-2 rounded-lg hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                Novedades
              </Link>

              {/* Separador si está logueado */}
              {user && <hr className="border-gray-200" />}

              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-neutral-700 hover:bg-black/5 py-2 px-2 rounded-lg transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition py-2 px-2 rounded-lg text-center"
                    onClick={() => setMenuOpen(false)}
                  >
                    Crear cuenta
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/empleo"
                    className="text-sm font-medium text-neutral-700 hover:text-emerald-600 transition-colors py-2 px-2 rounded-lg hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Empleo
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 py-2 px-2 rounded-lg text-center transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>

                  {/* Notificaciones móvil */}
                  <Link
                    href="/notificaciones"
                    className={`relative text-sm font-medium py-2 px-2 rounded-lg text-center transition-colors ${botonColor} flex items-center justify-center gap-1`}
                    onClick={() => {
                      resetNuevasNotificaciones(); // ✅ reset contador
                      setMenuOpen(false);
                    }}
                  >
                    {textoNotificacionesMobile}
                    {nuevasNotificaciones > 0 && (
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {nuevasNotificaciones}
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition py-2 px-2 rounded-lg text-center"
                  >
                    Cerrar sesión
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}