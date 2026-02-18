/**
 * French (fr) - Français
 */
module.exports = {
  common: {
    hello: "Bonjour",
    hi: "Salut",
    dear: "Cher/Chère",
    viewDetails: "Voir les détails",
    learnMore: "En savoir plus",
    getStarted: "Commencer",
    contactUs: "Contactez-nous",
    support: {
      question: "Vous avez des questions? Écrivez-nous à",
      orVisit: "ou visitez notre",
      helpCenter: "centre d'aide",
    },
  },

  footer: {
    copyright: "Tous droits réservés.",
    terms: "Conditions d'utilisation",
    privacy: "Politique de confidentialité",
    unsubscribe: "Se désabonner",
    autoMessage: "Ceci est un message automatique d'Artist Hive®. Veuillez ne pas répondre directement à cet e-mail.",
  },

  emails: {
    welcome: {
      subject: "Bienvenue sur Artist Hive®",
      title: "Bienvenue sur Artist Hive®!",
      intro: "Nous sommes ravis que vous fassiez partie de la communauté Artist Hive®. Vous avez maintenant accès à la plateforme qui connecte les artistes aux organisateurs d'événements dans toute l'Amérique latine.",
      whatCanYouDo: "Que pouvez-vous faire maintenant?",
      cta: "Explorer les artistes",
      features: {
        discover: {
          title: "Découvrir des artistes",
          description: "Explorez des milliers d'artistes de tous les genres et trouvez le parfait pour votre événement.",
        },
        book: {
          title: "Réserver facilement",
          description: "Envoyez des pré-réservations et gérez toutes vos réservations depuis un seul endroit.",
        },
        pay: {
          title: "Payer en toute sécurité",
          description: "Transactions protégées et paiements sécurisés pour vous et l'artiste.",
        },
        rate: {
          title: "Noter et commenter",
          description: "Partagez votre expérience et aidez les autres à prendre de meilleures décisions.",
        },
      },
      tips: {
        title: "Premières étapes recommandées",
        items: [
          "Complétez votre profil pour une meilleure expérience",
          "Explorez les artistes par genre ou lieu",
          "Enregistrez vos artistes favoris pour les retrouver facilement",
          "Activez les notifications pour ne rien manquer",
        ],
      },
    },

    prebooking: {
      fields: {
        artist: "Artiste",
        eventDate: "Date de l'événement",
        time: "Heure",
        location: "Lieu",
        eventType: "Type d'événement",
        budget: "Budget",
        code: "Code de réservation",
      },

      security: {
        title: "Protégez votre sécurité",
        message: "Pour des raisons de sécurité, ne partagez jamais vos données personnelles ou informations de paiement en dehors de la plateforme Artist Hive®.",
      },

      confirmation: {
        subject: "Votre pré-réservation est confirmée - Artist Hive®",
        title: "Votre pré-réservation est confirmée!",
        detailsTitle: "Détails de votre pré-réservation",
        cta: "Voir ma pré-réservation",
        checklist: {
          registered: "Votre pré-réservation a été enregistrée avec succès",
          artistReview: "L'artiste a jusqu'à 72 heures pour répondre",
          canCancel: "Vous pouvez annuler gratuitement jusqu'à ce que l'artiste confirme",
        },
      },

      allAccepted: {
        subject: "Tous les artistes ont accepté! - Artist Hive®",
        title: "Excellente nouvelle! Tous les artistes ont accepté votre pré-réservation",
        intro: "Tous les artistes que vous avez contactés ont accepté votre demande de pré-réservation. Vous pouvez maintenant passer à l'étape de négociation.",
        cta: "Commencer la négociation",
      },

      expired: {
        subject: "Votre demande de pré-réservation a expiré - Artist Hive®",
        title: "Votre demande de pré-réservation a expiré",
        intro: "Malheureusement, l'artiste n'a pas répondu dans le délai imparti. Vous pouvez essayer de contacter d'autres artistes ou envoyer une nouvelle demande.",
        cta: "Créer une nouvelle pré-réservation",
      },

      confirmed: {
        subject: "Réservation confirmée! - Artist Hive®",
        title: "Votre réservation est confirmée!",
        intro: "Votre paiement a été reçu et votre réservation est maintenant confirmée. L'artiste a été notifié.",
        cta: "Voir les détails de la réservation",
      },
    },

    user: {
      passwordReset: {
        subject: "Réinitialiser votre mot de passe - Artist Hive®",
        title: "Réinitialisez votre mot de passe",
        intro: "Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.",
        cta: "Réinitialiser le mot de passe",
        expiry: "Ce lien expirera dans 24 heures.",
        ignore: "Si vous n'avez pas demandé cela, vous pouvez ignorer cet e-mail en toute sécurité.",
      },

      verification: {
        subject: "Vérifiez votre e-mail - Artist Hive®",
        title: "Vérifiez votre adresse e-mail",
        intro: "Merci de vous être inscrit! Veuillez vérifier votre adresse e-mail pour terminer votre inscription.",
        cta: "Vérifier l'e-mail",
        expiry: "Ce lien expirera dans 48 heures.",
      },

      profileAssignment: {
        assigned: {
          subject: "Vous avez été assigné à un profil - Artist Hive®",
          title: "Vous avez été assigné à un profil!",
          intro: "Vous avez été assigné en tant que membre de l'équipe au profil suivant:",
          profileName: "Profil",
          profileType: "Type",
          role: "Votre rôle",
          assignedBy: "Assigné par",
          cta: "Voir le profil",
          note: "Vous pouvez maintenant gérer ce profil selon les permissions qui vous ont été attribuées.",
        },

        roleUpdated: {
          subject: "Votre rôle dans le profil a été mis à jour - Artist Hive®",
          title: "Votre rôle a été mis à jour",
          intro: "Votre rôle dans le profil suivant a été mis à jour:",
          previousRole: "Rôle précédent",
          newRole: "Nouveau rôle",
          cta: "Voir le profil",
        },

        removed: {
          subject: "Vous avez été retiré d'un profil - Artist Hive®",
          title: "Vous avez été retiré d'un profil",
          intro: "Vous n'êtes plus membre de l'équipe du profil suivant:",
          cta: "Aller à Artist Hive®",
          note: "Si vous pensez qu'il s'agit d'une erreur, veuillez contacter le propriétaire du profil.",
        },

        invitation: {
          subject: "Vous avez été invité à rejoindre un profil - Artist Hive®",
          title: "Vous avez été invité à rejoindre une équipe!",
          intro: "Vous avez été invité à rejoindre le profil suivant en tant que membre de l'équipe:",
          invitedBy: "Invité par",
          proposedRole: "Rôle proposé",
          ctaAccept: "Accepter l'invitation",
          ctaDecline: "Refuser",
          expiry: "Cette invitation expirera dans 7 jours.",
          note: "En acceptant, vous pourrez gérer ce profil selon les permissions attribuées.",
        },

        invitationAccepted: {
          subject: "Invitation à l'équipe acceptée - Artist Hive®",
          title: "Votre invitation a été acceptée!",
          intro: "a accepté votre invitation à rejoindre:",
          cta: "Voir l'équipe",
        },

        invitationDeclined: {
          subject: "Invitation à l'équipe refusée - Artist Hive®",
          title: "Votre invitation a été refusée",
          intro: "a refusé votre invitation à rejoindre:",
          cta: "Inviter quelqu'un d'autre",
        },

        roles: {
          owner: "Propriétaire",
          admin: "Administrateur",
          editor: "Éditeur",
          viewer: "Observateur",
          manager: "Gestionnaire",
          collaborator: "Collaborateur",
        },

        entityTypes: {
          artist: "Artiste",
          place: "Lieu",
          event: "Événement",
          academy: "Académie",
          band: "Groupe",
        },
      },
    },
  },
};
