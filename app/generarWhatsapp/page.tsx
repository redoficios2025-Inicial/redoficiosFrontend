// app/generarWhatsapp/page.tsx
"use client";

import React from "react";

// Tipos TypeScript
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
  telefono: string;
  nombre: string;
}

// Genera el link de WhatsApp (para el link en la UI)
export const generarEnlaceWhatsApp = (telefono: string, nombre: string): string => {
  const nro = telefono.replace(/\D/g, ""); // quita símbolos
  const mensaje = `Hola ${nombre}, vi tu perfil en RedOficios y me interesa coordinar un servicio.`;
  return `https://api.whatsapp.com/send?phone=${nro}&text=${encodeURIComponent(mensaje)}`;
};

// Función para generar el texto que se envía por WhatsApp
export const obtenerTextoTarjeta = (usuario: Usuario): string => {
  let texto = `✨ *${usuario.perfil.nombre}*\n`;

  if (usuario.perfil.profesion) texto += `💼 ${usuario.perfil.profesion}\n`;
  if (usuario.perfil.localidad) texto += `📍 ${usuario.perfil.localidad}\n`;
  texto += `👤 Rol: ${usuario.rol}\n`;

  if (usuario.perfil.calificacion) {
    texto += `⭐ Calificación: ${usuario.perfil.calificacion.toFixed(1)}/5\n`;
  }

  if (usuario.perfil.precio) {
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
export const ContactarWhatsApp: React.FC<ContactarWhatsAppProps> = ({ telefono, nombre }) => {
  const link = generarEnlaceWhatsApp(telefono, nombre);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-600 hover:text-green-700 font-semibold underline transition-colors duration-200"
    >
      {telefono}
    </a>
  );
};

// --- Componente de página por defecto ---
export default function GenerarWhatsappPage() {
  const ejemploUsuario: Usuario = {
    perfil: {
      nombre: "Lucas Bassi",
      profesion: "Mecánico",
      localidad: "Alcorta",
      calificacion: 4.7,
      precio: 1500,
      etiquetas: ["Reparación", "Motos"],
      telefono: "+5493412345678",
    },
    rol: "empleador",
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Generar WhatsApp</h1>
      <p className="mb-2">Click en el número para enviar mensaje:</p>
      <ContactarWhatsApp
        telefono={ejemploUsuario.perfil.telefono}
        nombre={ejemploUsuario.perfil.nombre}
      />
      <button
        onClick={() => compartirPerfilPorWhatsApp(ejemploUsuario)}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
      >
        Enviar mensaje completo
      </button>
    </div>
  );
}
