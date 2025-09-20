"use client";

import React from "react";

// ----------------------
// Tipos TypeScript
// ----------------------
interface Perfil {
  nombre: string;
  profesion?: string;
  localidad?: string;
  calificacion?: number;
  precio?: number;
  etiquetas?: string[];
  telefono?: string;
}

interface Usuario {
  perfil: Perfil;
  rol: string;
}

interface ContactarWhatsAppProps {
  telefono?: string; // ahora opcional
  nombre?: string;   // ahora opcional
}

// ----------------------
// Funciones de WhatsApp
// ----------------------

// Genera el link de WhatsApp (para el link en la UI)
export const generarEnlaceWhatsApp = (telefono?: string, nombre?: string): string => {
  const nro = (telefono || "").replace(/\D/g, "");
  const mensaje = `Hola ${nombre || "usuario"}, vi tu perfil en RedOficios y me interesa coordinar un servicio.`;
  return `https://api.whatsapp.com/send?phone=${nro}&text=${encodeURIComponent(mensaje)}`;
};

// Genera el texto que se envía por WhatsApp
export const obtenerTextoTarjeta = (usuario: Usuario): string => {
  let texto = `✨ *${usuario.perfil.nombre || "Sin nombre"}*\n`;
  
  if (usuario.perfil.profesion) texto += `💼 ${usuario.perfil.profesion}\n`;
  if (usuario.perfil.localidad) texto += `📍 ${usuario.perfil.localidad}\n`;
  texto += `👤 Rol: ${usuario.rol || "Sin rol"}\n`;
  
  if (usuario.perfil.calificacion !== undefined) {
    texto += `⭐ Calificación: ${usuario.perfil.calificacion.toFixed(1)}/5\n`;
  }
  
  if (usuario.perfil.precio !== undefined) {
    texto += `💰 Precio: $${usuario.perfil.precio.toLocaleString("es-AR")}\n`;
  }
  
  if (usuario.perfil.etiquetas && usuario.perfil.etiquetas.length > 0) {
    texto += `🏷️ Especialidades: ${usuario.perfil.etiquetas.join(", ")}\n`;
  }
  
  if (usuario.perfil.telefono) {
    const numeroLimpio = usuario.perfil.telefono.replace(/\D/g, "");
    texto += `\n📞 Contactame: https://wa.me/${numeroLimpio}`;
  }
  
  return texto;
};

// Función para abrir WhatsApp (envía el texto con el link)
export const compartirPerfilPorWhatsApp = (usuario: Usuario): void => {
  const texto = obtenerTextoTarjeta(usuario);
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");
};

// Componente React para mostrar el número clickeable en la UI
export const ContactarWhatsApp: React.FC<ContactarWhatsAppProps> = ({ 
  telefono = "", 
  nombre = "Usuario" 
}) => {
  const link = generarEnlaceWhatsApp(telefono, nombre);
  
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-600 hover:text-green-700 font-semibold underline transition-colors duration-200"
    >
      {telefono || "Sin número"}
    </a>
  );
};

// ----------------------
// Componente de página
// ----------------------
const GenerarWhatsappPage: React.FC = () => {
  // Ejemplo de usuario
  const usuarioEjemplo: Usuario = {
    rol: "empleado",
    perfil: {
      nombre: "Juan Pérez",
      telefono: "3412345678",
      profesion: "Plomero",
      localidad: "Rosario",
      calificacion: 4.5,
      precio: 3500,
      etiquetas: ["Fontanería", "Reparaciones"],
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Perfil de contacto</h1>
      <p>Haz clic para contactar por WhatsApp:</p>
      <ContactarWhatsApp 
        telefono={usuarioEjemplo.perfil.telefono} 
        nombre={usuarioEjemplo.perfil.nombre} 
      />
      <div className="mt-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          onClick={() => compartirPerfilPorWhatsApp(usuarioEjemplo)}
        >
          Compartir perfil completo por WhatsApp
        </button>
      </div>
    </div>
  );
};

// Obligatorio para Next.js App Router
export default GenerarWhatsappPage;
