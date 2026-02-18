/**
 * German (de) - Deutsch
 */
module.exports = {
  common: {
    hello: "Hallo",
    hi: "Hallo",
    dear: "Sehr geehrte/r",
    viewDetails: "Details anzeigen",
    learnMore: "Mehr erfahren",
    getStarted: "Loslegen",
    contactUs: "Kontaktieren Sie uns",
    support: {
      question: "Haben Sie Fragen? Schreiben Sie uns an",
      orVisit: "oder besuchen Sie unser",
      helpCenter: "Hilfezentrum",
    },
  },

  footer: {
    copyright: "Alle Rechte vorbehalten.",
    terms: "Nutzungsbedingungen",
    privacy: "Datenschutzrichtlinie",
    unsubscribe: "Abmelden",
    autoMessage: "Dies ist eine automatische Nachricht von Artist Hive®. Bitte antworten Sie nicht direkt auf diese E-Mail.",
  },

  emails: {
    welcome: {
      subject: "Willkommen bei Artist Hive®",
      title: "Willkommen bei Artist Hive®!",
      intro: "Wir freuen uns, dass Sie Teil der Artist Hive® Community sind. Sie haben jetzt Zugang zur Plattform, die Künstler mit Veranstaltern in ganz Lateinamerika verbindet.",
      whatCanYouDo: "Was können Sie jetzt tun?",
      cta: "Künstler entdecken",
      features: {
        discover: {
          title: "Künstler entdecken",
          description: "Entdecken Sie Tausende von Künstlern aller Genres und finden Sie den perfekten für Ihre Veranstaltung.",
        },
        book: {
          title: "Einfach buchen",
          description: "Senden Sie Vorbuchungen und verwalten Sie alle Ihre Buchungen von einem Ort aus.",
        },
        pay: {
          title: "Sicher bezahlen",
          description: "Geschützte Transaktionen und sichere Zahlungen für Sie und den Künstler.",
        },
        rate: {
          title: "Bewerten und rezensieren",
          description: "Teilen Sie Ihre Erfahrung und helfen Sie anderen, bessere Entscheidungen zu treffen.",
        },
      },
      tips: {
        title: "Empfohlene erste Schritte",
        items: [
          "Vervollständigen Sie Ihr Profil für ein besseres Erlebnis",
          "Entdecken Sie Künstler nach Genre oder Standort",
          "Speichern Sie Ihre Lieblingskünstler, um sie leicht zu finden",
          "Aktivieren Sie Benachrichtigungen, um nichts zu verpassen",
        ],
      },
    },

    prebooking: {
      fields: {
        artist: "Künstler",
        eventDate: "Veranstaltungsdatum",
        time: "Zeit",
        location: "Ort",
        eventType: "Veranstaltungstyp",
        budget: "Budget",
        code: "Buchungscode",
      },

      security: {
        title: "Schützen Sie Ihre Sicherheit",
        message: "Aus Sicherheitsgründen teilen Sie niemals Ihre persönlichen Daten oder Zahlungsinformationen außerhalb der Artist Hive® Plattform.",
      },

      confirmation: {
        subject: "Ihre Vorbuchung ist bestätigt - Artist Hive®",
        title: "Ihre Vorbuchung ist bestätigt!",
        detailsTitle: "Details Ihrer Vorbuchung",
        cta: "Meine Vorbuchung anzeigen",
        checklist: {
          registered: "Ihre Vorbuchung wurde erfolgreich registriert",
          artistReview: "Der Künstler hat bis zu 72 Stunden Zeit zu antworten",
          canCancel: "Sie können kostenlos stornieren, bis der Künstler bestätigt",
        },
      },

      allAccepted: {
        subject: "Alle Künstler haben akzeptiert! - Artist Hive®",
        title: "Tolle Neuigkeiten! Alle Künstler haben Ihre Vorbuchung akzeptiert",
        intro: "Alle Künstler, die Sie kontaktiert haben, haben Ihre Vorbuchungsanfrage akzeptiert. Sie können jetzt zur Verhandlungsphase übergehen.",
        cta: "Verhandlung starten",
      },

      partialAccepted: {
        subject: "Einige Künstler haben auf Ihre Vorbuchung geantwortet - Artist Hive®",
        title: "Einige Künstler haben geantwortet",
        intro: "Einige der Künstler, die Sie kontaktiert haben, haben auf Ihre Vorbuchungsanfrage geantwortet.",
        accepted: "Akzeptiert",
        rejected: "Nicht verfügbar",
        pending: "Antwort ausstehend",
        cta: "Antworten anzeigen",
      },

      negotiationStarted: {
        subject: "Ihre Vorbuchung ist in der Verhandlungsphase - Artist Hive®",
        title: "Lassen Sie uns die Details verhandeln!",
        intro: "Ihre Vorbuchung ist in die Verhandlungsphase übergegangen. Sie können jetzt die Details mit dem Künstler besprechen.",
        cta: "Zur Verhandlung gehen",
      },

      artistRejected: {
        subject: "Update zu Ihrer Vorbuchung - Artist Hive®",
        title: "Der Künstler konnte Ihre Anfrage nicht annehmen",
        intro: "Leider ist der Künstler an Ihrem Veranstaltungstermin nicht verfügbar. Keine Sorge, es gibt viele andere großartige Künstler auf der Plattform!",
        cta: "Andere Künstler entdecken",
      },

      expired: {
        subject: "Ihre Vorbuchungsanfrage ist abgelaufen - Artist Hive®",
        title: "Ihre Vorbuchungsanfrage ist abgelaufen",
        intro: "Leider hat der Künstler nicht innerhalb der erlaubten Zeit geantwortet. Sie können versuchen, andere Künstler zu kontaktieren oder eine neue Anfrage zu senden.",
        cta: "Neue Vorbuchung erstellen",
      },

      noInterest: {
        subject: "Update zu Ihrer Vorbuchung - Artist Hive®",
        title: "Keine Antwort vom Künstler",
        intro: "Der Künstler hat kein Interesse an Ihrer Vorbuchungsanfrage gezeigt. Wir empfehlen, andere Künstler zu erkunden, die besser passen könnten.",
        cta: "Andere Künstler entdecken",
      },

      cancelledByUser: {
        subject: "Vorbuchung storniert - Artist Hive®",
        title: "Ihre Vorbuchung wurde storniert",
        intro: "Sie haben Ihre Vorbuchungsanfrage erfolgreich storniert. Es wurden keine Gebühren erhoben.",
        cta: "Neue Vorbuchung erstellen",
      },

      expiringReminder: {
        subject: "Ihre Vorbuchung läuft bald ab - Artist Hive®",
        title: "Ihre Vorbuchung läuft bald ab!",
        intro: "Die Antwortfrist für Ihre Vorbuchung nähert sich. Wenn der Künstler nicht rechtzeitig antwortet, läuft die Anfrage automatisch ab.",
        timeRemaining: "Verbleibende Zeit",
        cta: "Vorbuchung anzeigen",
      },

      pendingPayment: {
        subject: "Zahlung abschließen - Artist Hive®",
        title: "Schließen Sie Ihre Zahlung ab, um zu bestätigen",
        intro: "Der Künstler hat Ihre Vorbuchung akzeptiert! Schließen Sie die Zahlung ab, um Ihre Buchung zu bestätigen und zu sichern.",
        cta: "Zahlung abschließen",
        deadline: "Zahlungsfrist",
      },

      confirmed: {
        subject: "Buchung bestätigt! - Artist Hive®",
        title: "Ihre Buchung ist bestätigt!",
        intro: "Ihre Zahlung wurde empfangen und Ihre Buchung ist nun bestätigt. Der Künstler wurde benachrichtigt.",
        cta: "Buchungsdetails anzeigen",
      },
    },

    eventReminder: {
      subject: "Erinnerung: Ihre Veranstaltung steht bevor - Artist Hive®",
      title: "Ihre Veranstaltung steht bevor!",
      intro: "Dies ist eine freundliche Erinnerung, dass Ihre Veranstaltung geplant ist für:",
      cta: "Veranstaltungsdetails anzeigen",
      daysRemaining: "Tage verbleibend",
    },

    user: {
      passwordReset: {
        subject: "Passwort zurücksetzen - Artist Hive®",
        title: "Setzen Sie Ihr Passwort zurück",
        intro: "Wir haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten. Klicken Sie auf die Schaltfläche unten, um ein neues Passwort zu erstellen.",
        cta: "Passwort zurücksetzen",
        expiry: "Dieser Link läuft in 24 Stunden ab.",
        ignore: "Wenn Sie dies nicht angefordert haben, können Sie diese E-Mail sicher ignorieren.",
      },

      verification: {
        subject: "E-Mail bestätigen - Artist Hive®",
        title: "Bestätigen Sie Ihre E-Mail-Adresse",
        intro: "Danke für Ihre Anmeldung! Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihre Registrierung abzuschließen.",
        cta: "E-Mail bestätigen",
        expiry: "Dieser Link läuft in 48 Stunden ab.",
      },

      profileAssignment: {
        assigned: {
          subject: "Sie wurden einem Profil zugewiesen - Artist Hive®",
          title: "Sie wurden einem Profil zugewiesen!",
          intro: "Sie wurden als Teammitglied dem folgenden Profil zugewiesen:",
          profileName: "Profil",
          profileType: "Typ",
          role: "Ihre Rolle",
          assignedBy: "Zugewiesen von",
          cta: "Profil anzeigen",
          note: "Sie können dieses Profil jetzt gemäß Ihren zugewiesenen Berechtigungen verwalten.",
        },

        roleUpdated: {
          subject: "Ihre Profilrolle wurde aktualisiert - Artist Hive®",
          title: "Ihre Rolle wurde aktualisiert",
          intro: "Ihre Rolle im folgenden Profil wurde aktualisiert:",
          previousRole: "Vorherige Rolle",
          newRole: "Neue Rolle",
          cta: "Profil anzeigen",
        },

        removed: {
          subject: "Sie wurden von einem Profil entfernt - Artist Hive®",
          title: "Sie wurden von einem Profil entfernt",
          intro: "Sie sind kein Teammitglied mehr des folgenden Profils:",
          cta: "Zu Artist Hive® gehen",
          note: "Wenn Sie glauben, dass dies ein Fehler war, kontaktieren Sie bitte den Profilinhaber.",
        },

        invitation: {
          subject: "Sie wurden eingeladen, einem Profil beizutreten - Artist Hive®",
          title: "Sie wurden eingeladen, einem Team beizutreten!",
          intro: "Sie wurden eingeladen, dem folgenden Profil als Teammitglied beizutreten:",
          invitedBy: "Eingeladen von",
          proposedRole: "Vorgeschlagene Rolle",
          ctaAccept: "Einladung annehmen",
          ctaDecline: "Ablehnen",
          expiry: "Diese Einladung läuft in 7 Tagen ab.",
          note: "Durch die Annahme können Sie dieses Profil gemäß den zugewiesenen Berechtigungen verwalten.",
        },

        invitationAccepted: {
          subject: "Teameinladung angenommen - Artist Hive®",
          title: "Ihre Einladung wurde angenommen!",
          intro: "hat Ihre Einladung angenommen, beizutreten:",
          cta: "Team anzeigen",
        },

        invitationDeclined: {
          subject: "Teameinladung abgelehnt - Artist Hive®",
          title: "Ihre Einladung wurde abgelehnt",
          intro: "hat Ihre Einladung abgelehnt, beizutreten:",
          cta: "Jemand anderen einladen",
        },

        roles: {
          owner: "Eigentümer",
          admin: "Administrator",
          editor: "Editor",
          viewer: "Betrachter",
          manager: "Manager",
          collaborator: "Mitarbeiter",
        },

        entityTypes: {
          artist: "Künstler",
          place: "Ort",
          event: "Veranstaltung",
          academy: "Akademie",
          band: "Band",
        },
      },
    },
  },
};
