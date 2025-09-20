"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  _id: string;
  nombre: string;
  avatar: string;
  rol: string;
}

interface Notificacion {
  _id: string;
  estado: string;
  fecha: string;
  empleador: User;
  empleado: User;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;

  // notificaciones
  notificaciones: Notificacion[];
  notificacionesFiltradas: Notificacion[];
  setNotificaciones: React.Dispatch<React.SetStateAction<Notificacion[]>>;
  setNotificacionesFiltradas: React.Dispatch<React.SetStateAction<Notificacion[]>>;
  loadingNotificaciones: boolean;

  // nuevas funcionalidades
  nuevasNotificaciones: number;
  resetNuevasNotificaciones: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [notificacionesFiltradas, setNotificacionesFiltradas] = useState<Notificacion[]>([]);
  const [loadingNotificaciones, setLoadingNotificaciones] = useState(true);

  // --- Contador de nuevas notificaciones ---
  const [nuevasNotificaciones, setNuevasNotificaciones] = useState<number>(0);
  const [lastSeenIds, setLastSeenIds] = useState<Set<string>>(new Set());

  // --- Manejo de inactividad (logout tras 5 minutos) ---
  useEffect(() => {
    let logoutTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        logout();
      }, 5 * 60 * 1000); // 5 minutos
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(logoutTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, []);

  // Obtener perfil de usuario
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (token && userId) {
      fetch(`https://redoficios-back.vercel.app/api/perfil/obtener/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.usuario) {
            const perfil = data.usuario.perfil || {};
            setUser({
              _id: data.usuario._id || userId,
              nombre: perfil.nombre || "Sin nombre",
              avatar: perfil.avatar
                ? `https://redoficios-back.vercel.app/${perfil.avatar.replace(/\\/g, "/")}`
                : "/assets/default-avatar.png",
              rol: data.usuario.rol || "visitante",
            });
          }
        })
        .catch(() => setUser(null));
    }
  }, []);

  // Traer notificaciones
  useEffect(() => {
    if (!user?._id) return;
    setLoadingNotificaciones(true);

    fetch("https://redoficios-back.vercel.app/api/contratacion/notificaciones")
      .then((res) => res.json())
      .then((data) => {
        const todas: Notificacion[] = data.data || [];
        setNotificaciones(todas);

        // Filtrar según rol
        const filtradas = todas.filter((n: Notificacion) => {
          if (user.rol.toLowerCase() === "empleado") return n.empleado._id === user._id;
          if (user.rol.toLowerCase() === "empleador") return n.empleador._id === user._id;
          return false;
        });
        setNotificacionesFiltradas(filtradas);

        // --- Contador de nuevas ---
        const nuevas = filtradas.filter((n) => !lastSeenIds.has(n._id));
        if (nuevas.length > 0) {
          setNuevasNotificaciones((prev) => prev + nuevas.length);
        }
      })
      .catch((err) => {
        console.error("Error al obtener notificaciones:", err);
      })
      .finally(() => setLoadingNotificaciones(false));
  }, [user]);

  // Marcar notificaciones como leídas
  const resetNuevasNotificaciones = () => {
    setNuevasNotificaciones(0);
    setLastSeenIds(new Set(notificacionesFiltradas.map((n) => n._id)));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("perfilId");
    setUser(null);
    setNotificaciones([]);
    setNotificacionesFiltradas([]);
    setNuevasNotificaciones(0);
    setLastSeenIds(new Set());
    window.location.href = "/";
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        notificaciones,
        notificacionesFiltradas,
        setNotificaciones,
        loadingNotificaciones,
        setNotificacionesFiltradas,
        nuevasNotificaciones,
        resetNuevasNotificaciones,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser debe usarse dentro de un UserProvider");
  return context;
};
