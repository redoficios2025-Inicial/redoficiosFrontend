// Genera el link de WhatsApp (para el link en la UI)
export const generarEnlaceWhatsApp = (telefono: string, nombre: string) => {
  const nro = telefono.replace(/\D/g, ""); // quita símbolos
  const mensaje = `Hola ${nombre}, vi tu perfil en RedOficios y me interesa coordinar un servicio.`;
  return `https://api.whatsapp.com/send?phone=${nro}&text=${encodeURIComponent(mensaje)}`;
};

// Función para generar el texto que se envía por WhatsApp
export const obtenerTextoTarjeta = (usuario: any) => {
  let texto = `✨ *${usuario.perfil.nombre}*\n`;
  
  if (usuario.perfil.profesion) texto += `💼 ${usuario.perfil.profesion}\n`;
  if (usuario.perfil.localidad) texto += `📍 ${usuario.perfil.localidad}\n`;
  texto += `👤 Rol: ${usuario.rol}\n`;
  
  if (usuario.perfil.calificacion)
    texto += `⭐ Calificación: ${usuario.perfil.calificacion.toFixed(1)}/5\n`;
  if (usuario.perfil.precio)
    texto += `💰 Precio: $${usuario.perfil.precio.toLocaleString("es-AR")}\n`;
  if (usuario.perfil.etiquetas?.length > 0)
    texto += `🏷️ Especialidades: ${usuario.perfil.etiquetas.join(", ")}\n`;
  
  // ✅ Mostrar el número como link de WhatsApp
  if (usuario.perfil.telefono) {
    const numeroLimpio = usuario.perfil.telefono.replace(/\D/g, "");
    texto += `\n📞 Contactame: https://wa.me/${numeroLimpio}`;
  }
  
  return texto;
};

// Función para abrir WhatsApp (envía el texto con el link)
export const compartirPerfilPorWhatsApp = (usuario: any) => {
  const texto = obtenerTextoTarjeta(usuario);
  const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank");
};

// Componente React para mostrar el número clickeable en la UI
export const ContactarWhatsApp = ({ telefono, nombre }: { telefono: string; nombre: string }) => {
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