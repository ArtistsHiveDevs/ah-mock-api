/**
 * Italian (it) - Italiano
 */
module.exports = {
  common: {
    hello: "Ciao",
    hi: "Ciao",
    dear: "Gentile",
    viewDetails: "Vedi dettagli",
    learnMore: "Scopri di più",
    getStarted: "Inizia",
    contactUs: "Contattaci",
    support: {
      question: "Hai domande? Scrivici a",
      orVisit: "o visita il nostro",
      helpCenter: "centro assistenza",
    },
  },

  footer: {
    copyright: "Tutti i diritti riservati.",
    terms: "Termini di utilizzo",
    privacy: "Informativa sulla privacy",
    unsubscribe: "Annulla iscrizione",
    autoMessage: "Questo è un messaggio automatico di Artist Hive®. Per favore non rispondere direttamente a questa email.",
  },

  emails: {
    welcome: {
      subject: "Benvenuto su Artist Hive®",
      title: "Benvenuto su Artist Hive®!",
      intro: "Siamo entusiasti che tu faccia parte della community di Artist Hive®. Ora hai accesso alla piattaforma che collega artisti e organizzatori di eventi in tutta l'America Latina.",
      whatCanYouDo: "Cosa puoi fare adesso?",
      cta: "Esplora artisti",
      features: {
        discover: {
          title: "Scopri artisti",
          description: "Esplora migliaia di artisti di tutti i generi e trova quello perfetto per il tuo evento.",
        },
        book: {
          title: "Prenota facilmente",
          description: "Invia pre-prenotazioni e gestisci tutte le tue prenotazioni da un unico posto.",
        },
        pay: {
          title: "Paga in sicurezza",
          description: "Transazioni protette e pagamenti sicuri per te e per l'artista.",
        },
        rate: {
          title: "Valuta e recensisci",
          description: "Condividi la tua esperienza e aiuta gli altri a prendere decisioni migliori.",
        },
      },
      tips: {
        title: "Primi passi consigliati",
        items: [
          "Completa il tuo profilo per un'esperienza migliore",
          "Esplora artisti per genere o posizione",
          "Salva i tuoi artisti preferiti per trovarli facilmente",
          "Attiva le notifiche per non perderti nulla",
        ],
      },
    },

    prebooking: {
      fields: {
        artist: "Artista",
        eventDate: "Data dell'evento",
        time: "Ora",
        location: "Luogo",
        eventType: "Tipo di evento",
        budget: "Budget",
        code: "Codice prenotazione",
      },

      security: {
        title: "Proteggi la tua sicurezza",
        message: "Per motivi di sicurezza, non condividere mai i tuoi dati personali o informazioni di pagamento al di fuori della piattaforma Artist Hive®.",
      },

      confirmation: {
        subject: "La tua pre-prenotazione è confermata - Artist Hive®",
        title: "La tua pre-prenotazione è confermata!",
        detailsTitle: "Dettagli della tua pre-prenotazione",
        cta: "Vedi la mia pre-prenotazione",
        checklist: {
          registered: "La tua pre-prenotazione è stata registrata con successo",
          artistReview: "L'artista ha fino a 72 ore per rispondere",
          canCancel: "Puoi cancellare gratuitamente fino alla conferma dell'artista",
        },
      },

      allAccepted: {
        subject: "Tutti gli artisti hanno accettato! - Artist Hive®",
        title: "Ottime notizie! Tutti gli artisti hanno accettato la tua pre-prenotazione",
        intro: "Tutti gli artisti che hai contattato hanno accettato la tua richiesta di pre-prenotazione. Ora puoi procedere alla fase di negoziazione.",
        cta: "Inizia la negoziazione",
      },

      expired: {
        subject: "La tua richiesta di pre-prenotazione è scaduta - Artist Hive®",
        title: "La tua richiesta di pre-prenotazione è scaduta",
        intro: "Purtroppo l'artista non ha risposto entro il tempo consentito. Puoi provare a contattare altri artisti o inviare una nuova richiesta.",
        cta: "Crea nuova pre-prenotazione",
      },

      confirmed: {
        subject: "Prenotazione confermata! - Artist Hive®",
        title: "La tua prenotazione è confermata!",
        intro: "Il tuo pagamento è stato ricevuto e la tua prenotazione è ora confermata. L'artista è stato notificato.",
        cta: "Vedi dettagli prenotazione",
      },
    },

    user: {
      passwordReset: {
        subject: "Reimposta la tua password - Artist Hive®",
        title: "Reimposta la tua password",
        intro: "Abbiamo ricevuto una richiesta di reimpostazione della tua password. Clicca il pulsante qui sotto per creare una nuova password.",
        cta: "Reimposta password",
        expiry: "Questo link scadrà tra 24 ore.",
        ignore: "Se non hai richiesto questo, puoi ignorare questa email in sicurezza.",
      },

      verification: {
        subject: "Verifica la tua email - Artist Hive®",
        title: "Verifica il tuo indirizzo email",
        intro: "Grazie per esserti registrato! Per favore verifica il tuo indirizzo email per completare la registrazione.",
        cta: "Verifica email",
        expiry: "Questo link scadrà tra 48 ore.",
      },

      profileAssignment: {
        assigned: {
          subject: "Sei stato assegnato a un profilo - Artist Hive®",
          title: "Sei stato assegnato a un profilo!",
          intro: "Sei stato assegnato come membro del team al seguente profilo:",
          profileName: "Profilo",
          profileType: "Tipo",
          role: "Il tuo ruolo",
          assignedBy: "Assegnato da",
          cta: "Vedi profilo",
          note: "Ora puoi gestire questo profilo in base ai permessi assegnati.",
        },

        roleUpdated: {
          subject: "Il tuo ruolo nel profilo è stato aggiornato - Artist Hive®",
          title: "Il tuo ruolo è stato aggiornato",
          intro: "Il tuo ruolo nel seguente profilo è stato aggiornato:",
          previousRole: "Ruolo precedente",
          newRole: "Nuovo ruolo",
          cta: "Vedi profilo",
        },

        removed: {
          subject: "Sei stato rimosso da un profilo - Artist Hive®",
          title: "Sei stato rimosso da un profilo",
          intro: "Non sei più membro del team del seguente profilo:",
          cta: "Vai a Artist Hive®",
          note: "Se ritieni che sia stato un errore, contatta il proprietario del profilo.",
        },

        invitation: {
          subject: "Sei stato invitato a unirti a un profilo - Artist Hive®",
          title: "Sei stato invitato a unirti a un team!",
          intro: "Sei stato invitato a unirti al seguente profilo come membro del team:",
          invitedBy: "Invitato da",
          proposedRole: "Ruolo proposto",
          ctaAccept: "Accetta invito",
          ctaDecline: "Rifiuta",
          expiry: "Questo invito scadrà tra 7 giorni.",
          note: "Accettando, potrai gestire questo profilo in base ai permessi assegnati.",
        },

        invitationAccepted: {
          subject: "Invito al team accettato - Artist Hive®",
          title: "Il tuo invito è stato accettato!",
          intro: "ha accettato il tuo invito a unirti a:",
          cta: "Vedi team",
        },

        invitationDeclined: {
          subject: "Invito al team rifiutato - Artist Hive®",
          title: "Il tuo invito è stato rifiutato",
          intro: "ha rifiutato il tuo invito a unirti a:",
          cta: "Invita qualcun altro",
        },

        roles: {
          owner: "Proprietario",
          admin: "Amministratore",
          editor: "Editor",
          viewer: "Visualizzatore",
          manager: "Manager",
          collaborator: "Collaboratore",
        },

        entityTypes: {
          artist: "Artista",
          place: "Luogo",
          event: "Evento",
          academy: "Accademia",
          band: "Band",
        },
      },
    },
  },
};
