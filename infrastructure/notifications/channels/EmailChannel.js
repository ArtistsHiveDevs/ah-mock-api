const emailService = require("../../../helpers/emailService");
const { getChannelConfig } = require("../notificationConfig");
const { t, ARTIST_HIVE_SOCIAL } = require("../../../assets/templates/email/i18n");

const LOGO_URL = "https://npcarlos.co/artistsHive_mocks/logo.png";
const APP_URL = process.env.FRONTEND_URL || "https://artist-hive.com";
const CURRENT_YEAR = new Date().getFullYear();

/**
 * Handler del canal de Email
 * Responsable de enviar notificaciones por correo electrónico
 */
class EmailChannel {
  constructor() {
    this.config = getChannelConfig("EMAIL");
  }

  /**
   * Genera el HTML base con estilos del design system de Artist Hive
   * @param {Object} options
   * @param {string} options.subject - Asunto del email (para <title>)
   * @param {string} options.contentHtml - HTML del contenido principal
   * @param {Object} [options.statusBanner] - Banner de estado opcional
   * @param {string} [options.statusBanner.type] - success|warning|error|info
   * @param {string} [options.statusBanner.title] - Título del banner
   * @param {string} [options.statusBanner.subtitle] - Subtítulo opcional
   * @param {string} [options.lang] - Código de idioma
   * @returns {string} HTML completo
   */
  renderBaseLayout({ subject, contentHtml, statusBanner, lang = "es" }) {
    const footer = t("footer", lang);

    const statusBannerHtml = statusBanner ? `
          <tr>
            <td class="status-banner ${statusBanner.type}">
              <h2>${statusBanner.title}</h2>
              ${statusBanner.subtitle ? `<p>${statusBanner.subtitle}</p>` : ""}
            </td>
          </tr>` : "";

    return `
<!DOCTYPE html>
<html lang="${lang}" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table{border-collapse:collapse !important;mso-table-lspace:0pt;mso-table-rspace:0pt}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    body{margin:0 !important;padding:0 !important;width:100% !important;background-color:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased}
    .email-wrapper{width:100%;background-color:#F5F5F5;padding:32px 16px}
    .email-container{width:100%;max-width:600px;margin:0 auto;background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)}
    .header{background-color:#000000;padding:28px 24px;text-align:center}
    .header img{max-width:160px;height:auto}
    .status-banner{padding:20px 24px;text-align:center}
    .status-banner.success{background:linear-gradient(135deg,#00C853 0%,#00E676 100%)}
    .status-banner.warning{background:linear-gradient(135deg,#FF9800 0%,#FFB74D 100%)}
    .status-banner.error{background:linear-gradient(135deg,#F44336 0%,#EF5350 100%)}
    .status-banner.info{background:linear-gradient(135deg,#2196F3 0%,#42A5F5 100%)}
    .status-banner h2{color:#FFFFFF;font-size:20px;font-weight:600;margin:0;text-shadow:0 1px 2px rgba(0,0,0,0.1)}
    .status-banner p{color:rgba(255,255,255,0.95);font-size:14px;margin-top:6px}
    .content{padding:32px 28px;color:#4A4A4A;font-size:15px;line-height:1.7}
    .content h1{margin:0 0 16px 0;font-size:24px;font-weight:700;color:#1A1A1A}
    .content h2{margin:24px 0 12px 0;font-size:18px;font-weight:600;color:#2A2A2A}
    .content p{margin:0 0 16px 0}
    .content a{color:#00C853;text-decoration:none;font-weight:500}
    .info-box{background-color:#F8F9FA;border-left:4px solid #00C853;padding:16px 20px;margin:20px 0;border-radius:0 8px 8px 0}
    .info-box.warning{border-left-color:#FF9800;background-color:#FFF8E1}
    .info-box.security{border-left-color:#2196F3;background-color:#E3F2FD}
    .info-box h3{font-size:14px;font-weight:600;color:#1A1A1A;margin:0 0 8px 0}
    .info-box p{font-size:13px;color:#5A5A5A;margin:0;line-height:1.5}
    .details-table{width:100%;margin:20px 0;border-collapse:collapse}
    .details-table tr{border-bottom:1px solid #EEEEEE}
    .details-table tr:last-child{border-bottom:none}
    .details-table td{padding:12px 0;font-size:14px;vertical-align:top}
    .details-table td:first-child{color:#777777;width:40%;font-weight:500}
    .details-table td:last-child{color:#1A1A1A}
    .btn{display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;text-align:center}
    .btn-primary{background-color:#00C853;color:#FFFFFF !important}
    .btn-secondary{background-color:#1A1A1A;color:#FFFFFF !important}
    .btn-outline{background-color:transparent;color:#00C853 !important;border:2px solid #00C853}
    .btn-muted{background-color:#E0E0E0;color:#666666 !important}
    .btn-container{text-align:center;margin:28px 0}
    .btn-container .btn{margin:0 8px}
    .features{margin:24px 0}
    .feature{display:table;width:100%;margin-bottom:20px}
    .feature-icon{display:table-cell;width:48px;vertical-align:top;padding-right:16px}
    .feature-icon span{display:inline-block;width:40px;height:40px;background-color:#E8F5E9;border-radius:50%;text-align:center;line-height:40px;font-size:18px}
    .feature-text{display:table-cell;vertical-align:top}
    .feature-text h4{font-size:15px;font-weight:600;color:#1A1A1A;margin:0 0 4px 0}
    .feature-text p{font-size:13px;color:#666666;margin:0}
    .tips-section{background-color:#FAFAFA;padding:24px;border-radius:8px;margin:24px 0}
    .tips-section h3{font-size:16px;font-weight:600;color:#1A1A1A;margin:0 0 16px 0}
    .tip{margin-bottom:12px;padding-left:24px;position:relative;font-size:14px;color:#555555}
    .tip:last-child{margin-bottom:0}
    .check-list{list-style:none;padding:0;margin:20px 0}
    .check-list li{padding:8px 0 8px 28px;position:relative;font-size:14px;color:#4A4A4A;border-bottom:1px solid #F0F0F0}
    .check-list li:last-child{border-bottom:none}
    .divider{height:1px;background-color:#EEEEEE;margin:28px 0}
    .footer{background-color:#FAFAFA;padding:28px 24px;text-align:center;border-top:1px solid #EEEEEE}
    .social-links{margin-bottom:20px}
    .social-links a{display:inline-block;margin:0 10px;text-decoration:none}
    .social-links img{width:28px;height:28px;opacity:0.7}
    .footer-brand{font-size:13px;color:#777777;margin-bottom:12px}
    .footer-links{font-size:12px;margin-bottom:16px}
    .footer-links a{color:#666666;text-decoration:none;margin:0 8px}
    .footer-note{font-size:11px;color:#999999;line-height:1.5}
    @media (prefers-color-scheme:dark){
      body,.email-wrapper{background-color:#121212 !important}
      .email-container{background-color:#1E1E1E !important;box-shadow:0 2px 8px rgba(0,0,0,0.3) !important}
      .content{color:#E0E0E0 !important}
      .content h1,.content h2{color:#FFFFFF !important}
      .content a{color:#69F0AE !important}
      .info-box{background-color:#2A2A2A !important}
      .info-box.warning{background-color:#3D3020 !important}
      .info-box h3{color:#FFFFFF !important}
      .info-box p{color:#BBBBBB !important}
      .details-table tr{border-bottom-color:#333333 !important}
      .details-table td:first-child{color:#AAAAAA !important}
      .details-table td:last-child{color:#FFFFFF !important}
      .divider{background-color:#333333 !important}
      .footer{background-color:#151515 !important;border-top-color:#333333 !important}
      .footer-brand,.footer-links a{color:#AAAAAA !important}
      .footer-note{color:#777777 !important}
      .social-links img{filter:invert(1) !important}
      .feature-icon span{background-color:#1B3D1B !important}
      .feature-text h4{color:#FFFFFF !important}
      .feature-text p{color:#AAAAAA !important}
      .tips-section{background-color:#2A2A2A !important}
      .tips-section h3{color:#FFFFFF !important}
      .tip{color:#BBBBBB !important}
      .check-list li{color:#BBBBBB !important;border-bottom-color:#333333 !important}
    }
    @media only screen and (max-width:600px){
      .email-wrapper{padding:16px 8px !important}
      .email-container{border-radius:8px !important}
      .header{padding:20px 16px !important}
      .status-banner{padding:16px 20px !important}
      .status-banner h2{font-size:18px !important}
      .content{padding:24px 20px !important}
      .content h1{font-size:20px !important}
      .btn{display:block !important;padding:16px 24px !important}
      .footer{padding:24px 16px !important}
      .details-table td{display:block !important;width:100% !important;padding:4px 0 !important}
      .details-table td:first-child{padding-top:12px !important;font-weight:600 !important}
    }
  </style>
</head>
<body>
  <table class="email-wrapper" role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table class="email-container" role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <img src="${LOGO_URL}" alt="Artist Hive&reg;" width="160">
            </td>
          </tr>
          ${statusBannerHtml}
          <tr>
            <td class="content">
              ${contentHtml}

              <div class="divider"></div>
              <p style="font-size:13px;color:#777777;">
                ${t("common.support.question", lang)}
                <a href="mailto:soporte@artist-hive.com">soporte@artist-hive.com</a>
                ${t("common.support.orVisit", lang)}
                <a href="${APP_URL}/help">${t("common.support.helpCenter", lang)}</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <div class="social-links">
                <a href="https://instagram.com/${ARTIST_HIVE_SOCIAL.instagram}"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram"></a>
                <a href="https://facebook.com/${ARTIST_HIVE_SOCIAL.facebook}"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook"></a>
                <a href="https://x.com/${ARTIST_HIVE_SOCIAL.twitter}"><img src="https://cdn-icons-png.flaticon.com/512/5969/5969020.png" alt="X"></a>
                <a href="https://tiktok.com/@${ARTIST_HIVE_SOCIAL.tiktok}"><img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" alt="TikTok"></a>
                <a href="https://youtube.com/@${ARTIST_HIVE_SOCIAL.youtube}"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube"></a>
              </div>
              <p class="footer-brand"><strong>Artist Hive&reg;</strong><br>2022&ndash;${CURRENT_YEAR}<br>${footer.copyright}</p>
              <p class="footer-links">
                <a href="${APP_URL}/terms">${footer.terms}</a> &middot;
                <a href="${APP_URL}/privacy">${footer.privacy}</a>
              </p>
              <p class="footer-note">${footer.autoMessage}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
  }

  /**
   * Enviar notificación por email
   * @param {Object} options
   * @param {Object} options.type - Configuración del tipo de notificación
   * @param {Object} options.recipient - Datos del destinatario
   * @param {Object} options.data - Datos para el template
   */
  async send({ type, recipient, data }) {
    if (!recipient.email) {
      console.warn(
        `[EmailChannel] ⚠️ Recipient ${recipient.id} no tiene email`
      );
      return;
    }

    // Seleccionar template según el tipo
    const template = this.getTemplate(type.template);

    // Generar el contenido del email
    const emailContent = template({ recipient, data });

    // Enviar usando el servicio de email
    await emailService.sendEmail({
      to: recipient.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    console.log(
      `[EmailChannel] ✅ Email enviado a ${recipient.email} - ${type.name}`
    );
  }

  /**
   * Obtener template por nombre
   */
  getTemplate(templateName) {
    const templates = {
      prebooking_created: this.templatePrebookingCreated.bind(this),
      prebooking_response: this.templatePrebookingResponse.bind(this),
      prebooking_cancelled: this.templatePrebookingCancelled.bind(this),
      user_welcome: this.templateUserWelcome.bind(this),
      user_profile_assigned: this.templateProfileAssigned.bind(this),
      user_profile_role_updated: this.templateProfileRoleUpdated.bind(this),
      user_profile_removed: this.templateProfileRemoved.bind(this),
      user_profile_invitation: this.templateProfileInvitation.bind(this),
      user_profile_invitation_accepted: this.templateProfileInvitationAccepted.bind(this),
      user_profile_invitation_declined: this.templateProfileInvitationDeclined.bind(this),
      test: this.templateTest.bind(this),
    };

    return templates[templateName] || templates.test;
  }

  /**
   * Template: Prebooking Creado (enviado al artista)
   */
  templatePrebookingCreated({ recipient, data }) {
    const { prebooking, requester } = data;
    const lang = data.lang || "es";
    const fields = t("emails.prebooking.fields", lang);
    const newReq = t("emails.prebooking.newRequest", lang);
    const security = t("emails.prebooking.security", lang);
    const prebookingUrl = `${APP_URL}/prebookings/${prebooking._id}`;

    const contentHtml = `
              <h1>${newReq.title}</h1>
              <p>${t("common.hi", lang)} <strong>${recipient.name}</strong>!</p>
              <p><strong>${requester.name}</strong> ${newReq.intro}</p>

              <table class="details-table" role="presentation">
                ${prebooking.event_name ? `<tr><td>${fields.eventType}</td><td><strong>${prebooking.event_name}</strong></td></tr>` : ""}
                ${prebooking.requested_date_start ? `<tr><td>${fields.eventDate}</td><td>${prebooking.requested_date_start}</td></tr>` : ""}
                ${prebooking.venue_name ? `<tr><td>${fields.location}</td><td>${prebooking.venue_name}</td></tr>` : ""}
              </table>

              ${prebooking.notes ? `<div class="info-box"><p>${prebooking.notes}</p></div>` : ""}

              <div class="btn-container">
                <a href="${prebookingUrl}" class="btn btn-primary">${newReq.cta}</a>
              </div>

              <div class="info-box security">
                <h3>${security.title}</h3>
                <p>${security.message}</p>
              </div>`;

    return {
      subject: newReq.subject,
      text: `${t("common.hi", lang)} ${recipient.name}!\n\n${requester.name} ${newReq.intro}\n\n${prebooking.event_name ? `${fields.eventType}: ${prebooking.event_name}\n` : ""}${prebooking.requested_date_start ? `${fields.eventDate}: ${prebooking.requested_date_start}\n` : ""}${prebooking.venue_name ? `${fields.location}: ${prebooking.venue_name}\n` : ""}${prebooking.notes ? `\n${prebooking.notes}\n` : ""}\n${newReq.cta}: ${prebookingUrl}`,
      html: this.renderBaseLayout({
        subject: newReq.subject,
        contentHtml,
        statusBanner: { type: "info", title: newReq.title },
        lang,
      }),
    };
  }

  /**
   * Template: Respuesta a Prebooking (enviado al requester)
   */
  templatePrebookingResponse({ recipient, data }) {
    const { prebooking, participant, status, notes } = data;
    const lang = data.lang || "es";
    const fields = t("emails.prebooking.fields", lang);
    const prebookingUrl = `${APP_URL}/prebookings/${prebooking._id}`;

    const statusMap = {
      interested: { key: "accepted", bannerType: "success" },
      not_interested: { key: "rejected", bannerType: "warning" },
      viewed: { key: "viewed", bannerType: "info" },
    };
    const statusInfo = statusMap[status] || statusMap.viewed;
    const i = t(`emails.prebooking.response.${statusInfo.key}`, lang);

    const contentHtml = `
              <h1>${i.title}</h1>
              <p>${t("common.hi", lang)} <strong>${recipient.name}</strong>!</p>
              <p><strong>${participant.name}</strong> ${i.intro}</p>

              ${prebooking.event_name ? `
              <table class="details-table" role="presentation">
                <tr><td>${fields.eventType}</td><td><strong>${prebooking.event_name}</strong></td></tr>
              </table>` : ""}

              ${notes ? `<div class="info-box"><p>${notes}</p></div>` : ""}

              <div class="btn-container">
                <a href="${prebookingUrl}" class="btn btn-primary">${i.cta}</a>
              </div>`;

    return {
      subject: i.subject,
      text: `${t("common.hi", lang)} ${recipient.name}!\n\n${participant.name} ${i.intro}\n${prebooking.event_name ? `${fields.eventType}: ${prebooking.event_name}\n` : ""}${notes ? `\n${notes}\n` : ""}\n${i.cta}: ${prebookingUrl}`,
      html: this.renderBaseLayout({
        subject: i.subject,
        contentHtml,
        statusBanner: { type: statusInfo.bannerType, title: i.title },
        lang,
      }),
    };
  }

  /**
   * Template: Prebooking Cancelado
   */
  templatePrebookingCancelled({ recipient, data }) {
    const prebooking = data.prebooking || {};
    const lang = data.lang || "es";
    const i = t("emails.prebooking.cancelledByUser", lang);
    const fields = t("emails.prebooking.fields", lang);

    const contentHtml = `
              <h1>${i.title}</h1>
              <p>${t("common.hi", lang)} <strong>${recipient.name}</strong>,</p>
              <p>${i.intro}</p>

              ${prebooking.event_name ? `
              <table class="details-table" role="presentation">
                <tr><td>${fields.eventType}</td><td><strong>${prebooking.event_name}</strong></td></tr>
              </table>` : ""}

              <div class="btn-container">
                <a href="${APP_URL}/explore" class="btn btn-secondary">${i.cta}</a>
              </div>`;

    return {
      subject: i.subject,
      text: `${t("common.hi", lang)} ${recipient.name},\n\n${i.intro}\n${prebooking.event_name ? `\n${fields.eventType}: ${prebooking.event_name}\n` : ""}\n${i.cta}: ${APP_URL}/explore`,
      html: this.renderBaseLayout({
        subject: i.subject,
        contentHtml,
        statusBanner: { type: "warning", title: i.title },
        lang,
      }),
    };
  }

  /**
   * Template: Bienvenida de Usuario
   */
  templateUserWelcome({ recipient, data }) {
    const lang = data.lang || "es";
    const i = t("emails.welcome", lang);
    const featureIcons = { discover: "🎤", book: "📅", pay: "🔒", rate: "⭐" };

    const featuresHtml = Object.entries(i.features)
      .map(
        ([key, feat]) => `
                <div class="feature">
                  <div class="feature-icon"><span>${featureIcons[key] || "✨"}</span></div>
                  <div class="feature-text">
                    <h4>${feat.title}</h4>
                    <p>${feat.description}</p>
                  </div>
                </div>`
      )
      .join("");

    const tipsHtml = i.tips.items
      .map(
        (tip) =>
          `<div class="tip"><span style="color:#00C853;font-weight:bold;position:absolute;left:0">&rarr;</span>${tip}</div>`
      )
      .join("");

    const contentHtml = `
              <h1>${i.title}</h1>
              <p>${t("common.hi", lang)} <strong>${recipient.name}</strong>!</p>
              <p>${i.intro}</p>

              <h2>${i.whatCanYouDo}</h2>
              <div class="features">
                ${featuresHtml}
              </div>

              <div class="btn-container">
                <a href="${APP_URL}/explore" class="btn btn-primary">${i.cta}</a>
              </div>

              <div class="tips-section">
                <h3>${i.tips.title}</h3>
                ${tipsHtml}
              </div>`;

    return {
      subject: i.subject,
      text: `${t("common.hi", lang)} ${recipient.name}!\n\n${i.intro}\n\n${i.whatCanYouDo}\n${Object.values(i.features).map((f) => `- ${f.title}: ${f.description}`).join("\n")}\n\n${i.tips.title}\n${i.tips.items.map((tip) => `→ ${tip}`).join("\n")}\n\n${i.cta}: ${APP_URL}/explore`,
      html: this.renderBaseLayout({ subject: i.subject, contentHtml, lang }),
    };
  }

  /**
   * Template: Usuario asignado a perfil
   */
  templateProfileAssigned({ recipient, data }) {
    const { profile, role, assignedBy } = data;
    const lang = data.lang || "es";
    const i = t("emails.user.profileAssignment.assigned", lang);
    const entityTypes = t("emails.user.profileAssignment.entityTypes", lang);
    const entityLabel = entityTypes[profile.type.toLowerCase()] || profile.type;
    const profileUrl = `${APP_URL}/${profile.type.toLowerCase()}s/${profile.id}`;

    const contentHtml = `
              <h1>${i.title}</h1>
              <p>${t("common.hi", lang)} <strong>${recipient.name}</strong>!</p>
              <p>${i.intro}</p>

              <table class="details-table" role="presentation">
                <tr><td>${i.profileName}</td><td><strong>${profile.name}</strong></td></tr>
                <tr><td>${i.profileType}</td><td>${entityLabel}</td></tr>
                <tr><td>${i.role}</td><td>${role}</td></tr>
                <tr><td>${i.assignedBy}</td><td>${assignedBy.name}</td></tr>
              </table>

              <div class="info-box">
                <p>${i.note}</p>
              </div>

              <div class="btn-container">
                <a href="${profileUrl}" class="btn btn-primary">${i.cta}</a>
              </div>`;

    return {
      subject: i.subject,
      text: `${t("common.hi", lang)} ${recipient.name}!\n\n${i.intro}\n\n${i.profileName}: ${profile.name}\n${i.profileType}: ${entityLabel}\n${i.role}: ${role}\n${i.assignedBy}: ${assignedBy.name}\n\n${i.note}\n\n${i.cta}: ${profileUrl}`,
      html: this.renderBaseLayout({ subject: i.subject, contentHtml, lang }),
    };
  }

  /**
   * Template: Rol de usuario actualizado
   */
  templateProfileRoleUpdated({ recipient, data }) {
    const { profile, previousRole, newRole } = data;
    const lang = data.lang || "es";
    const i = t("emails.user.profileAssignment.roleUpdated", lang);
    const profileUrl = `${APP_URL}/${profile.type.toLowerCase()}s/${profile.id}`;

    const contentHtml = `
              <h1>${i.title}</h1>
              <p>${t("common.hi", lang)} <strong>${recipient.name}</strong>!</p>
              <p>${i.intro}</p>

              <table class="details-table" role="presentation">
                <tr><td>${t("emails.user.profileAssignment.assigned.profileName", lang)}</td><td><strong>${profile.name}</strong></td></tr>
                <tr><td>${i.previousRole}</td><td style="color:#999;text-decoration:line-through">${previousRole}</td></tr>
                <tr><td>${i.newRole}</td><td style="color:#00C853;font-weight:600">${newRole}</td></tr>
              </table>

              <div class="btn-container">
                <a href="${profileUrl}" class="btn btn-primary">${i.cta}</a>
              </div>`;

    return {
      subject: i.subject,
      text: `${t("common.hi", lang)} ${recipient.name}!\n\n${i.intro}\n\n${t("emails.user.profileAssignment.assigned.profileName", lang)}: ${profile.name}\n${i.previousRole}: ${previousRole}\n${i.newRole}: ${newRole}\n\n${i.cta}: ${profileUrl}`,
      html: this.renderBaseLayout({ subject: i.subject, contentHtml, lang }),
    };
  }

  /**
   * Template: Usuario removido de perfil
   */
  templateProfileRemoved({ recipient, data }) {
    const { profile } = data;
    const lang = data.lang || "es";
    const i = t("emails.user.profileAssignment.removed", lang);
    const entityTypes = t("emails.user.profileAssignment.entityTypes", lang);
    const entityLabel = entityTypes[profile.type.toLowerCase()] || profile.type;

    const contentHtml = `
              <h1>${i.title}</h1>
              <p>${t("common.hi", lang)} <strong>${recipient.name}</strong>,</p>
              <p>${i.intro}</p>

              <table class="details-table" role="presentation">
                <tr><td>${t("emails.user.profileAssignment.assigned.profileName", lang)}</td><td><strong>${profile.name}</strong></td></tr>
                <tr><td>${t("emails.user.profileAssignment.assigned.profileType", lang)}</td><td>${entityLabel}</td></tr>
              </table>

              <div class="info-box warning">
                <p>${i.note}</p>
              </div>

              <div class="btn-container">
                <a href="${APP_URL}" class="btn btn-secondary">${i.cta}</a>
              </div>`;

    return {
      subject: i.subject,
      text: `${t("common.hi", lang)} ${recipient.name},\n\n${i.intro}\n\n${t("emails.user.profileAssignment.assigned.profileName", lang)}: ${profile.name}\n${t("emails.user.profileAssignment.assigned.profileType", lang)}: ${entityLabel}\n\n${i.note}\n\n${i.cta}: ${APP_URL}`,
      html: this.renderBaseLayout({
        subject: i.subject,
        contentHtml,
        statusBanner: { type: "warning", title: i.title },
        lang,
      }),
    };
  }

  /**
   * Template: Invitacion a perfil
   */
  templateProfileInvitation({ recipient, data }) {
    const { profile, proposedRole, invitedBy, invitationId } = data;
    const lang = data.lang || "es";
    const i = t("emails.user.profileAssignment.invitation", lang);
    const entityTypes = t("emails.user.profileAssignment.entityTypes", lang);
    const entityLabel = entityTypes[profile.type.toLowerCase()] || profile.type;
    const acceptUrl = `${APP_URL}/invitations/${invitationId}/accept`;
    const declineUrl = `${APP_URL}/invitations/${invitationId}/decline`;

    const contentHtml = `
              <h1>${i.title}</h1>
              <p>${t("common.hi", lang)} <strong>${recipient.name}</strong>!</p>
              <p>${i.intro}</p>

              <table class="details-table" role="presentation">
                <tr><td>${t("emails.user.profileAssignment.assigned.profileName", lang)}</td><td><strong>${profile.name}</strong></td></tr>
                <tr><td>${t("emails.user.profileAssignment.assigned.profileType", lang)}</td><td>${entityLabel}</td></tr>
                <tr><td>${i.proposedRole}</td><td>${proposedRole}</td></tr>
                <tr><td>${i.invitedBy}</td><td>${invitedBy.name}</td></tr>
              </table>

              <div class="info-box warning">
                <p>${i.expiry}</p>
              </div>

              <p>${i.note}</p>

              <div class="btn-container">
                <a href="${acceptUrl}" class="btn btn-primary">${i.ctaAccept}</a>
                <a href="${declineUrl}" class="btn btn-muted">${i.ctaDecline}</a>
              </div>`;

    return {
      subject: i.subject,
      text: `${t("common.hi", lang)} ${recipient.name}!\n\n${i.intro}\n\n${t("emails.user.profileAssignment.assigned.profileName", lang)}: ${profile.name}\n${t("emails.user.profileAssignment.assigned.profileType", lang)}: ${entityLabel}\n${i.proposedRole}: ${proposedRole}\n${i.invitedBy}: ${invitedBy.name}\n\n${i.expiry}\n\n${i.ctaAccept}: ${acceptUrl}\n${i.ctaDecline}: ${declineUrl}`,
      html: this.renderBaseLayout({
        subject: i.subject,
        contentHtml,
        statusBanner: { type: "info", title: i.title },
        lang,
      }),
    };
  }

  /**
   * Template: Invitacion aceptada
   */
  templateProfileInvitationAccepted({ recipient, data }) {
    const { invitee, profile } = data;
    const lang = data.lang || "es";
    const i = t("emails.user.profileAssignment.invitationAccepted", lang);
    const teamUrl = `${APP_URL}/${profile.type.toLowerCase()}s/${profile.id}/team`;

    const contentHtml = `
              <h1>${i.title}</h1>
              <p>${t("common.hi", lang)} <strong>${recipient.name}</strong>!</p>
              <p><strong>${invitee.name}</strong> ${i.intro}</p>

              <table class="details-table" role="presentation">
                <tr><td>${t("emails.user.profileAssignment.assigned.profileName", lang)}</td><td><strong>${profile.name}</strong></td></tr>
              </table>

              <div class="btn-container">
                <a href="${teamUrl}" class="btn btn-primary">${i.cta}</a>
              </div>`;

    return {
      subject: `${invitee.name} - ${i.subject}`,
      text: `${t("common.hi", lang)} ${recipient.name}!\n\n${invitee.name} ${i.intro}\n\n${t("emails.user.profileAssignment.assigned.profileName", lang)}: ${profile.name}\n\n${i.cta}: ${teamUrl}`,
      html: this.renderBaseLayout({
        subject: i.subject,
        contentHtml,
        statusBanner: { type: "success", title: i.title },
        lang,
      }),
    };
  }

  /**
   * Template: Invitacion rechazada
   */
  templateProfileInvitationDeclined({ recipient, data }) {
    const { invitee, profile } = data;
    const lang = data.lang || "es";
    const i = t("emails.user.profileAssignment.invitationDeclined", lang);
    const teamUrl = `${APP_URL}/${profile.type.toLowerCase()}s/${profile.id}/team`;

    const contentHtml = `
              <h1>${i.title}</h1>
              <p>${t("common.hi", lang)} <strong>${recipient.name}</strong>,</p>
              <p><strong>${invitee.name}</strong> ${i.intro}</p>

              <table class="details-table" role="presentation">
                <tr><td>${t("emails.user.profileAssignment.assigned.profileName", lang)}</td><td><strong>${profile.name}</strong></td></tr>
              </table>

              <div class="btn-container">
                <a href="${teamUrl}" class="btn btn-secondary">${i.cta}</a>
              </div>`;

    return {
      subject: `${invitee.name} - ${i.subject}`,
      text: `${t("common.hi", lang)} ${recipient.name},\n\n${invitee.name} ${i.intro}\n\n${t("emails.user.profileAssignment.assigned.profileName", lang)}: ${profile.name}\n\n${i.cta}: ${teamUrl}`,
      html: this.renderBaseLayout({ subject: i.subject, contentHtml, lang }),
    };
  }

  /**
   * Template: Test
   */
  templateTest({ recipient, data }) {
    const lang = data.lang || "es";
    const subject = data.subject || "Test Notification - Artist Hive®";
    const message =
      data.message || "This is a test message from the notification system.";

    const contentHtml = `
              <h1>Test Notification</h1>
              <p>${message}</p>
              <div class="info-box">
                <p><strong>Recipient:</strong> ${recipient.email}</p>
              </div>`;

    return {
      subject,
      text: `Test Notification\n\n${message}\n\nRecipient: ${recipient.email}`,
      html: this.renderBaseLayout({ subject, contentHtml, lang }),
    };
  }
}

module.exports = EmailChannel;
