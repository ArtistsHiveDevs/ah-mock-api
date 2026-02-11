/**
 * Spanish (es) - Español
 * Extends from base (en)
 */
module.exports = {
  common: {
    hello: "Hola",
    hi: "Hola",
    dear: "Estimado/a",
    viewDetails: "Ver detalles",
    learnMore: "Saber más",
    getStarted: "Comenzar",
    contactUs: "Contáctanos",
    support: {
      question: "¿Tienes preguntas? Escríbenos a",
      orVisit: "o visita nuestro",
      helpCenter: "centro de ayuda",
    },
  },

  footer: {
    copyright: "Todos los derechos reservados.",
    terms: "Términos de uso",
    privacy: "Política de privacidad",
    unsubscribe: "Cancelar suscripción",
    autoMessage: "Este es un mensaje automático enviado desde Artist Hive®. Por favor no respondas directamente a este correo.",
  },

  emails: {
    welcome: {
      subject: "Bienvenido a Artist Hive®",
      title: "¡Bienvenido a Artist Hive®!",
      intro: "Nos emociona que formes parte de la comunidad de Artist Hive®. Ahora tienes acceso a la plataforma que conecta a artistas con organizadores de eventos en toda Latinoamérica.",
      whatCanYouDo: "¿Qué puedes hacer ahora?",
      cta: "Explorar artistas",
      features: {
        discover: {
          title: "Descubre artistas",
          description: "Explora miles de artistas de todos los géneros y encuentra el perfecto para tu evento.",
        },
        book: {
          title: "Reserva fácilmente",
          description: "Envía pre-reservas y gestiona todas tus contrataciones desde un solo lugar.",
        },
        pay: {
          title: "Paga con seguridad",
          description: "Transacciones protegidas y pagos seguros para ti y para el artista.",
        },
        rate: {
          title: "Califica y opina",
          description: "Comparte tu experiencia y ayuda a otros a tomar mejores decisiones.",
        },
      },
      tips: {
        title: "Primeros pasos recomendados",
        items: [
          "Completa tu perfil para una mejor experiencia",
          "Explora artistas por género o ubicación",
          "Guarda tus artistas favoritos para encontrarlos fácilmente",
          "Activa las notificaciones para no perderte nada",
        ],
      },
    },

    prebooking: {
      fields: {
        artist: "Artista",
        eventDate: "Fecha del evento",
        time: "Hora",
        location: "Lugar",
        eventType: "Tipo de evento",
        budget: "Presupuesto",
        code: "Código de reserva",
      },

      security: {
        title: "Garantiza tu seguridad",
        message: "Por motivos de seguridad, nunca compartas tus datos personales ni información de pago fuera de la plataforma Artist Hive®.",
      },

      confirmation: {
        subject: "Tu pre-reserva está confirmada - Artist Hive®",
        title: "¡Tu pre-reserva está confirmada!",
        detailsTitle: "Detalles de tu pre-reserva",
        cta: "Ver mi pre-reserva",
        checklist: {
          registered: "Tu pre-reserva ha sido registrada correctamente",
          artistReview: "El artista tiene hasta 72 horas para responder",
          canCancel: "Puedes cancelar sin costo hasta que el artista confirme",
        },
      },

      allAccepted: {
        subject: "¡Todos los artistas aceptaron! - Artist Hive®",
        title: "¡Excelentes noticias! Todos los artistas aceptaron tu pre-reserva",
        intro: "Todos los artistas que contactaste han aceptado tu solicitud de pre-reserva. Ahora puedes pasar a la etapa de negociación.",
        cta: "Iniciar negociación",
      },

      partialAccepted: {
        subject: "Algunos artistas respondieron a tu pre-reserva - Artist Hive®",
        title: "Algunos artistas han respondido",
        intro: "Algunos de los artistas que contactaste han respondido a tu solicitud de pre-reserva.",
        accepted: "Aceptado",
        rejected: "No disponible",
        pending: "Pendiente de respuesta",
        cta: "Ver respuestas",
      },

      negotiationStarted: {
        subject: "Tu pre-reserva pasó a negociación - Artist Hive®",
        title: "¡Negociemos los detalles!",
        intro: "Tu pre-reserva ha pasado a la etapa de negociación. Ahora puedes discutir los detalles con el artista.",
        cta: "Ir a negociación",
      },

      artistRejected: {
        subject: "Actualización de tu pre-reserva - Artist Hive®",
        title: "El artista no pudo aceptar tu solicitud",
        intro: "Lamentablemente, el artista no está disponible para la fecha de tu evento. ¡No te preocupes, hay muchos otros artistas increíbles en la plataforma!",
        cta: "Explorar otros artistas",
      },

      expired: {
        subject: "Tu solicitud de pre-reserva expiró - Artist Hive®",
        title: "Tu solicitud de pre-reserva ha expirado",
        intro: "Lamentablemente, el artista no respondió dentro del tiempo permitido. Puedes intentar contactar a otros artistas o enviar una nueva solicitud.",
        cta: "Crear nueva pre-reserva",
      },

      noInterest: {
        subject: "Actualización de tu pre-reserva - Artist Hive®",
        title: "Sin respuesta del artista",
        intro: "El artista no ha mostrado interés en tu solicitud de pre-reserva. Te recomendamos explorar otros artistas que puedan ser más adecuados.",
        cta: "Explorar otros artistas",
      },

      cancelledByUser: {
        subject: "Pre-reserva cancelada - Artist Hive®",
        title: "Tu pre-reserva ha sido cancelada",
        intro: "Has cancelado exitosamente tu solicitud de pre-reserva. No se realizó ningún cargo.",
        cta: "Crear nueva pre-reserva",
      },

      expiringReminder: {
        subject: "Tu pre-reserva está por vencer - Artist Hive®",
        title: "¡Tu pre-reserva está por vencer!",
        intro: "El plazo de respuesta de tu pre-reserva se está agotando. Si el artista no responde a tiempo, la solicitud expirará automáticamente.",
        timeRemaining: "Tiempo restante",
        cta: "Ver pre-reserva",
      },

      pendingPayment: {
        subject: "Completa tu pago - Artist Hive®",
        title: "Completa tu pago para confirmar",
        intro: "¡El artista ha aceptado tu pre-reserva! Completa el pago para confirmar y asegurar tu reserva.",
        cta: "Completar pago",
        deadline: "Fecha límite de pago",
      },

      confirmed: {
        subject: "¡Reserva confirmada! - Artist Hive®",
        title: "¡Tu reserva está confirmada!",
        intro: "Tu pago ha sido recibido y tu reserva está confirmada. El artista ha sido notificado.",
        cta: "Ver detalles de la reserva",
      },
    },

    eventReminder: {
      subject: "Recordatorio: Tu evento se acerca - Artist Hive®",
      title: "¡Tu evento se acerca!",
      intro: "Este es un recordatorio amigable de que tu evento está programado para:",
      cta: "Ver detalles del evento",
      daysRemaining: "días restantes",
    },

    user: {
      passwordReset: {
        subject: "Restablece tu contraseña - Artist Hive®",
        title: "Restablece tu contraseña",
        intro: "Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para crear una nueva contraseña.",
        cta: "Restablecer contraseña",
        expiry: "Este enlace expirará en 24 horas.",
        ignore: "Si no solicitaste esto, puedes ignorar este correo de forma segura.",
      },

      verification: {
        subject: "Verifica tu correo - Artist Hive®",
        title: "Verifica tu correo electrónico",
        intro: "¡Gracias por registrarte! Por favor verifica tu correo electrónico para completar tu registro.",
        cta: "Verificar correo",
        expiry: "Este enlace expirará en 48 horas.",
      },

      profileAssignment: {
        assigned: {
          subject: "Te han asignado a un perfil - Artist Hive®",
          title: "¡Te han asignado a un perfil!",
          intro: "Has sido asignado como miembro del equipo al siguiente perfil:",
          profileName: "Perfil",
          profileType: "Tipo",
          role: "Tu rol",
          assignedBy: "Asignado por",
          cta: "Ver perfil",
          note: "Ahora puedes gestionar este perfil de acuerdo con los permisos asignados.",
        },

        roleUpdated: {
          subject: "Tu rol en el perfil ha sido actualizado - Artist Hive®",
          title: "Tu rol ha sido actualizado",
          intro: "Tu rol en el siguiente perfil ha sido actualizado:",
          previousRole: "Rol anterior",
          newRole: "Nuevo rol",
          cta: "Ver perfil",
        },

        removed: {
          subject: "Has sido removido de un perfil - Artist Hive®",
          title: "Has sido removido de un perfil",
          intro: "Ya no eres miembro del equipo del siguiente perfil:",
          cta: "Ir a Artist Hive®",
          note: "Si crees que esto fue un error, por favor contacta al propietario del perfil.",
        },

        invitation: {
          subject: "Te han invitado a unirte a un perfil - Artist Hive®",
          title: "¡Te han invitado a unirte a un equipo!",
          intro: "Has sido invitado a unirte al siguiente perfil como miembro del equipo:",
          invitedBy: "Invitado por",
          proposedRole: "Rol propuesto",
          ctaAccept: "Aceptar invitación",
          ctaDecline: "Rechazar",
          expiry: "Esta invitación expirará en 7 días.",
          note: "Al aceptar, podrás gestionar este perfil de acuerdo con los permisos asignados.",
        },

        invitationAccepted: {
          subject: "Invitación al equipo aceptada - Artist Hive®",
          title: "¡Tu invitación fue aceptada!",
          intro: "ha aceptado tu invitación para unirse a:",
          cta: "Ver equipo",
        },

        invitationDeclined: {
          subject: "Invitación al equipo rechazada - Artist Hive®",
          title: "Tu invitación fue rechazada",
          intro: "ha rechazado tu invitación para unirse a:",
          cta: "Invitar a alguien más",
        },

        roles: {
          owner: "Propietario",
          admin: "Administrador",
          editor: "Editor",
          viewer: "Visualizador",
          manager: "Manager",
          collaborator: "Colaborador",
        },

        entityTypes: {
          artist: "Artista",
          place: "Lugar",
          event: "Evento",
          academy: "Academia",
          band: "Banda",
        },
      },
    },
  },
};
