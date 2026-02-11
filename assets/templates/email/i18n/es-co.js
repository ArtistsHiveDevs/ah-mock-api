/**
 * Colombian Spanish (es-co) - Español Colombiano
 * Extends from es with local expressions
 */
const es = require("./es");

module.exports = {
  ...es,

  common: {
    ...es.common,
    hello: "Hola",
    hi: "Hola",
    dear: "Estimado/a",
  },

  emails: {
    ...es.emails,

    welcome: {
      ...es.emails.welcome,
      intro: "Nos emociona que hagas parte de la comunidad de Artist Hive®. Ahora tienes acceso a la plataforma que conecta a artistas con organizadores de eventos en toda Latinoamérica.",
      tips: {
        title: "Primeros pasos recomendados",
        items: [
          "Completa tu perfil para una mejor experiencia",
          "Explora artistas por género o ubicación",
          "Guarda tus artistas favoritos para encontrarlos fácilmente",
          "Activa las notificaciones para que no te pierdas de nada",
        ],
      },
    },

    prebooking: {
      ...es.emails.prebooking,

      confirmation: {
        ...es.emails.prebooking.confirmation,
        checklist: {
          registered: "Tu pre-reserva ha sido registrada correctamente",
          artistReview: "El artista tiene hasta 72 horas para responder",
          canCancel: "Puedes cancelar sin costo hasta que el artista confirme",
        },
      },

      allAccepted: {
        ...es.emails.prebooking.allAccepted,
        title: "¡Qué chimba! Todos los artistas aceptaron tu pre-reserva",
        intro: "Todos los artistas que contactaste han aceptado tu solicitud de pre-reserva. Ahora puedes pasar a la etapa de negociación.",
      },

      expiringReminder: {
        ...es.emails.prebooking.expiringReminder,
        title: "¡Pilas! Tu pre-reserva está por vencer",
        intro: "El plazo de respuesta de tu pre-reserva se está agotando. Si el artista no responde a tiempo, la solicitud expirará automáticamente.",
      },
    },
  },
};
