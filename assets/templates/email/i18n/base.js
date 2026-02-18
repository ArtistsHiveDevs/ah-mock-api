/**
 * English (en) - Base translations
 * All other languages extend from this
 *
 * Structure:
 * - common: Shared across all emails
 * - footer: Footer section
 * - emails: Each email type with all its variations
 */
module.exports = {
  // ============================================
  // COMMON - Shared across all emails
  // ============================================
  common: {
    hello: "Hello",
    hi: "Hi",
    dear: "Dear",
    viewDetails: "View details",
    learnMore: "Learn more",
    getStarted: "Get started",
    contactUs: "Contact us",
    support: {
      question: "Have questions? Write to us at",
      orVisit: "or visit our",
      helpCenter: "help center",
    },
  },

  // ============================================
  // FOOTER - Footer section
  // ============================================
  footer: {
    copyright: "All rights reserved.",
    terms: "Terms of use",
    privacy: "Privacy policy",
    unsubscribe: "Unsubscribe",
    autoMessage: "This is an automated message from Artist Hive®. Please do not reply directly to this email.",
  },

  // ============================================
  // EMAILS
  // ============================================
  emails: {
    // ========================================
    // WELCOME
    // ========================================
    welcome: {
      subject: "Welcome to Artist Hive®",
      title: "Welcome to Artist Hive®!",
      intro: "We're excited that you're part of the Artist Hive® community. You now have access to the platform that connects artists with event organizers throughout Latin America.",
      whatCanYouDo: "What can you do now?",
      cta: "Explore artists",
      features: {
        discover: {
          title: "Discover artists",
          description: "Explore thousands of artists from all genres and find the perfect one for your event.",
        },
        book: {
          title: "Book easily",
          description: "Send pre-bookings and manage all your bookings from one place.",
        },
        pay: {
          title: "Pay securely",
          description: "Protected transactions and secure payments for you and the artist.",
        },
        rate: {
          title: "Rate and review",
          description: "Share your experience and help others make better decisions.",
        },
      },
      tips: {
        title: "Recommended first steps",
        items: [
          "Complete your profile for a better experience",
          "Explore artists by genre or location",
          "Save your favorite artists to find them easily",
          "Enable notifications so you don't miss anything",
        ],
      },
    },

    // ========================================
    // PREBOOKING
    // ========================================
    prebooking: {
      // Common fields for all prebooking emails
      fields: {
        artist: "Artist",
        eventDate: "Event date",
        time: "Time",
        location: "Location",
        eventType: "Event type",
        budget: "Budget",
        code: "Booking code",
      },

      security: {
        title: "Protect your security",
        message: "For security reasons, never share your personal data or payment information outside the Artist Hive® platform.",
      },

      // ----------------------------------------
      // Confirmation (initial request sent)
      // ----------------------------------------
      confirmation: {
        subject: "Your pre-booking is confirmed - Artist Hive®",
        title: "Your pre-booking is confirmed!",
        detailsTitle: "Your pre-booking details",
        cta: "View my pre-booking",
        checklist: {
          registered: "Your pre-booking has been successfully registered",
          artistReview: "The artist has up to 72 hours to respond",
          canCancel: "You can cancel for free until the artist confirms",
        },
      },

      // ----------------------------------------
      // Status: All artists accepted
      // ----------------------------------------
      allAccepted: {
        subject: "All artists accepted! - Artist Hive®",
        title: "Great news! All artists accepted your pre-booking",
        intro: "All the artists you contacted have accepted your pre-booking request. You can now proceed to the negotiation stage.",
        cta: "Start negotiation",
      },

      // ----------------------------------------
      // Status: Partial acceptance
      // ----------------------------------------
      partialAccepted: {
        subject: "Some artists responded to your pre-booking - Artist Hive®",
        title: "Some artists have responded",
        intro: "Some of the artists you contacted have responded to your pre-booking request.",
        accepted: "Accepted",
        rejected: "Not available",
        pending: "Pending response",
        cta: "View responses",
      },

      // ----------------------------------------
      // Status: Moved to negotiation
      // ----------------------------------------
      negotiationStarted: {
        subject: "Your pre-booking moved to negotiation - Artist Hive®",
        title: "Let's negotiate the details!",
        intro: "Your pre-booking has moved to the negotiation stage. You can now discuss the details with the artist.",
        cta: "Go to negotiation",
      },

      // ----------------------------------------
      // Status: Artist rejected
      // ----------------------------------------
      artistRejected: {
        subject: "Update on your pre-booking - Artist Hive®",
        title: "The artist couldn't accept your request",
        intro: "Unfortunately, the artist is not available for your event date. Don't worry, there are many other great artists on the platform!",
        cta: "Explore other artists",
      },

      // ----------------------------------------
      // Status: Request expired (no response)
      // ----------------------------------------
      expired: {
        subject: "Your pre-booking request expired - Artist Hive®",
        title: "Your pre-booking request has expired",
        intro: "Unfortunately, the artist didn't respond within the allowed time. You can try contacting other artists or send a new request.",
        cta: "Create new pre-booking",
      },

      // ----------------------------------------
      // Status: No interest (artist didn't respond)
      // ----------------------------------------
      noInterest: {
        subject: "Update on your pre-booking - Artist Hive®",
        title: "No response from the artist",
        intro: "The artist hasn't shown interest in your pre-booking request. We recommend exploring other artists who might be a better fit.",
        cta: "Explore other artists",
      },

      // ----------------------------------------
      // Status: User cancelled
      // ----------------------------------------
      cancelledByUser: {
        subject: "Pre-booking cancelled - Artist Hive®",
        title: "Your pre-booking has been cancelled",
        intro: "You have successfully cancelled your pre-booking request. No charges were made.",
        cta: "Create new pre-booking",
      },

      // ----------------------------------------
      // Notification: New request (sent to artist)
      // ----------------------------------------
      newRequest: {
        subject: "New pre-booking request - Artist Hive®",
        title: "You have a new pre-booking request!",
        intro: "has sent you a new pre-booking request:",
        cta: "View request",
      },

      // ----------------------------------------
      // Notification: Response (sent to requester)
      // ----------------------------------------
      response: {
        accepted: {
          subject: "An artist accepted your pre-booking! - Artist Hive®",
          title: "Great news!",
          intro: "has accepted your pre-booking request for:",
          cta: "View pre-booking",
        },
        rejected: {
          subject: "Update on your pre-booking - Artist Hive®",
          title: "Update on your request",
          intro: "is not available for your pre-booking:",
          cta: "View pre-booking",
        },
        viewed: {
          subject: "Your pre-booking was viewed - Artist Hive®",
          title: "Your request was viewed",
          intro: "has viewed your pre-booking request:",
          cta: "View pre-booking",
        },
      },

      // ----------------------------------------
      // Reminder: Expiring soon
      // ----------------------------------------
      expiringReminder: {
        subject: "Your pre-booking is about to expire - Artist Hive®",
        title: "Your pre-booking is expiring soon!",
        intro: "The response deadline for your pre-booking is approaching. If the artist doesn't respond in time, the request will expire automatically.",
        timeRemaining: "Time remaining",
        cta: "View pre-booking",
      },

      // ----------------------------------------
      // Reminder: Pending payment
      // ----------------------------------------
      pendingPayment: {
        subject: "Complete your payment - Artist Hive®",
        title: "Complete your payment to confirm",
        intro: "The artist has accepted your pre-booking! Complete the payment to confirm and secure your booking.",
        cta: "Complete payment",
        deadline: "Payment deadline",
      },

      // ----------------------------------------
      // Confirmed (payment received)
      // ----------------------------------------
      confirmed: {
        subject: "Booking confirmed! - Artist Hive®",
        title: "Your booking is confirmed!",
        intro: "Your payment has been received and your booking is now confirmed. The artist has been notified.",
        cta: "View booking details",
      },
    },

    // ========================================
    // EVENT REMINDER
    // ========================================
    eventReminder: {
      subject: "Reminder: Your event is coming up - Artist Hive®",
      title: "Your event is coming up!",
      intro: "This is a friendly reminder that your event is scheduled for:",
      cta: "View event details",
      daysRemaining: "days remaining",
    },

    // ========================================
    // USER - User account related emails
    // ========================================
    user: {
      // ----------------------------------------
      // Password Reset
      // ----------------------------------------
      passwordReset: {
        subject: "Reset your password - Artist Hive®",
        title: "Reset your password",
        intro: "We received a request to reset your password. Click the button below to create a new password.",
        cta: "Reset password",
        expiry: "This link will expire in 24 hours.",
        ignore: "If you didn't request this, you can safely ignore this email.",
      },

      // ----------------------------------------
      // Account Verification
      // ----------------------------------------
      verification: {
        subject: "Verify your email - Artist Hive®",
        title: "Verify your email address",
        intro: "Thanks for signing up! Please verify your email address to complete your registration.",
        cta: "Verify email",
        expiry: "This link will expire in 48 hours.",
      },

      // ----------------------------------------
      // Profile Assignment
      // ----------------------------------------
      profileAssignment: {
        assigned: {
          subject: "You've been assigned to a profile - Artist Hive®",
          title: "You've been assigned to a profile!",
          intro: "You have been assigned as a team member to the following profile:",
          profileName: "Profile",
          profileType: "Type",
          role: "Your role",
          assignedBy: "Assigned by",
          cta: "View profile",
          note: "You can now manage this profile according to your assigned permissions.",
        },

        roleUpdated: {
          subject: "Your profile role has been updated - Artist Hive®",
          title: "Your role has been updated",
          intro: "Your role in the following profile has been updated:",
          previousRole: "Previous role",
          newRole: "New role",
          cta: "View profile",
        },

        removed: {
          subject: "You've been removed from a profile - Artist Hive®",
          title: "You've been removed from a profile",
          intro: "You are no longer a team member of the following profile:",
          cta: "Go to Artist Hive®",
          note: "If you believe this was a mistake, please contact the profile owner.",
        },

        invitation: {
          subject: "You've been invited to join a profile - Artist Hive®",
          title: "You've been invited to join a team!",
          intro: "You have been invited to join the following profile as a team member:",
          invitedBy: "Invited by",
          proposedRole: "Proposed role",
          ctaAccept: "Accept invitation",
          ctaDecline: "Decline",
          expiry: "This invitation will expire in 7 days.",
          note: "By accepting, you'll be able to manage this profile according to the assigned permissions.",
        },

        invitationAccepted: {
          subject: "Team invitation accepted - Artist Hive®",
          title: "Your invitation was accepted!",
          intro: "has accepted your invitation to join:",
          cta: "View team",
        },

        invitationDeclined: {
          subject: "Team invitation declined - Artist Hive®",
          title: "Your invitation was declined",
          intro: "has declined your invitation to join:",
          cta: "Invite someone else",
        },

        roles: {
          owner: "Owner",
          admin: "Administrator",
          editor: "Editor",
          viewer: "Viewer",
          manager: "Manager",
          collaborator: "Collaborator",
        },

        entityTypes: {
          artist: "Artist",
          place: "Place",
          event: "Event",
          academy: "Academy",
          band: "Band",
        },
      },
    },
  },
};
