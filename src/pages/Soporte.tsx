import React, { useState } from 'react';
import '../styles/SoporteStyles.css';

const SOPORTE_TELEFONO = '921963029';
const SOPORTE_NOMBRE = 'Thimo Sabino Gonzales';

const faqs = [
  {
    icon: '🏢',
    question: '¿Cómo registro mi empresa?',
    answer:
      'Ve a Mi Empresa y, si no tienes una asociada, aparecerá el formulario de registro. Completa los campos y guarda.',
    bullets: [
      'Completa los datos obligatorios (nombre, RUC, correo).',
      'Al guardar, tu usuario queda asociado a la empresa.',
      'Si no se refleja, usa “Actualizar” o recarga la página.'
    ],
  },
  {
    icon: '📦',
    question: '¿Cómo agrego productos al inventario?',
    answer:
      'En Inventario, usa el botón “Agregar Producto”. Completa nombre, precio y stock, y guarda para crear el producto.',
    bullets: [
      'Usa nombres claros y únicos.',
      'El stock puede editarse luego desde “Editar”.',
      'Puedes eliminar productos cuando sea necesario.'
    ],
  },
  {
    icon: '💰',
    question: '¿Cómo registro una venta?',
    answer:
      'Ve a Ventas → Nueva Venta, selecciona los productos, método de pago y confirma para registrar la venta.',
    bullets: [
      'Verifica cantidades y precios antes de confirmar.',
      'Puedes ver el detalle en el modal y eliminar si es necesario.',
      'Las ganancias del mes se muestran en Mi Empresa.'
    ],
  },
  {
    icon: '🔁',
    question: '¿Por qué al recargar aparece Not Found?',
    answer:
      'En producción usamos una SPA. Render redirige con _redirects a index.html para que React Router maneje la ruta.',
    bullets: [
      'Asegúrate de tener el archivo /public/_redirects con “/* /index.html 200”.',
      'En Render, configura Redirects & Rewrites si es necesario.'
    ],
  },
  {
    icon: '🧭',
    question: '¿No veo mis cambios después de editar la empresa?',
    answer:
      'Tras guardar, la página recarga para reflejar los cambios. Si no, realiza un hard refresh (Ctrl+F5 en PC).',
    bullets: [
      'Verifica conexión estable antes de editar.',
      'Si persiste, cierra sesión y vuelve a entrar.'
    ],
  },
  {
    icon: '🗂️',
    question: '¿No cargan mis productos en el móvil pero sí en PC?',
    answer:
      'Este es un problema de caché del navegador. Necesitas limpiar la caché en tu móvil.',
    bullets: [
      'Android (Chrome): Ajustes → Privacidad y seguridad → Borrar datos de navegación → Marca "Imágenes y archivos en caché" → Borrar datos.',
      'iOS (Safari): Ajustes → Safari → Borrar historial y datos de sitios web.',
      'Alternativa: Usa el modo incógnito/privado para acceder sin caché.',
      'También puedes cerrar completamente el navegador y volver a abrirlo.'
    ],
  },
  {
    icon: '🟢',
    question: '¿Cómo contacto soporte?',
    answer:
      'Presiona "Escribir por WhatsApp" para abrir un chat directo con el personal de soporte.',
    bullets: [
      'Incluye un mensaje con tu problema y captura si es posible.',
      'Indica tu correo y RUC de la empresa para agilizar.'
    ],
  },
];

const Soporte: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  // Enviar mensaje incluyendo nombre de empresa si está disponible
  let companyName = '';
  try {
    // Evitar dependencia circular importando useAuth; tomamos del localStorage si está serializado
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      const parsed = JSON.parse(userStr);
      companyName = parsed?.companyNombre || '';
    }
  } catch (e) {}
  const defaultMsg = `Hola ${SOPORTE_NOMBRE}, necesito soporte con SIGEV-PYME.${companyName ? ' Empresa: ' + companyName : ''}.`;
  const whatsappHref = `https://wa.me/51${SOPORTE_TELEFONO}?text=${encodeURIComponent(defaultMsg)}`;

  return (
    <div className="soporte-container">
      <header className="soporte-header">
        <h2 className="soporte-title">Centro de Soporte</h2>
        <div className="soporte-contact-card">
          <div className="soporte-avatar" aria-hidden>
            {SOPORTE_NOMBRE.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div className="soporte-contact-info">
            <div className="soporte-contact-name">{SOPORTE_NOMBRE}</div>
            <div className="soporte-contact-phone">📞 921 963 029</div>
          </div>
          <a
            className="whatsapp-chip"
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            title="Escribir por WhatsApp"
          >
            WhatsApp
          </a>
        </div>
      </header>

      <section className="soporte-actions">
        <a
          className="whatsapp-button"
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Escribir por WhatsApp
        </a>
      </section>

      <section className="faqs-section">
        <h3 className="section-title">Preguntas Frecuentes</h3>
        <div className="faq-list">
          {faqs.map((item, idx) => (
            <div key={idx} className={`faq-item ${openIndex === idx ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => toggle(idx)}>
                <div className="faq-left">
                  <span className="faq-icon" aria-hidden>{item.icon}</span>
                  <span className="faq-question-text">{item.question}</span>
                </div>
                <span className={`chevron ${openIndex === idx ? 'up' : 'down'}`}>▾</span>
              </button>
              {openIndex === idx && (
                <div className="faq-answer">
                  <div className="faq-answer-grid">
                    <div className="faq-answer-text">
                      <p>{item.answer}</p>
                      {item.bullets && (
                        <ul className="faq-bullets">
                          {item.bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="faq-illustration" aria-hidden>
                      <div className="faq-illustration-card">
                        <span className="faq-illustration-icon">{item.icon}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Soporte;


