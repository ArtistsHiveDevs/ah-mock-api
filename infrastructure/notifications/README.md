# Sistema de Notificaciones - Artists Hive

Sistema centralizado y escalable de notificaciones multi-canal para Artists Hive.

## Características

- ✅ **Multi-canal**: Email, Push, SMS, WebSocket
- ✅ **Asíncrono**: No bloquea el servidor principal
- ✅ **Configurable**: Flags globales y por tipo de notificación
- ✅ **Extensible**: Fácil agregar nuevos tipos y canales
- ✅ **Templates**: Sistema de templates para cada tipo de notificación

## Arquitectura

```
┌─────────────────────────────────────────┐
│      NotificationService (Orquestador)   │
│  - Valida configuración global           │
│  - Determina canales habilitados         │
│  - Envía de forma asíncrona              │
└────────────┬────────────────────────────┘
             │
     ┌───────┴────────┐
     │   Canales:     │
     ├────────────────┤
     │  EmailChannel  │
     │  PushChannel   │
     │  SMSChannel    │
     │  WSChannel     │
     └────────────────┘
```

## Configuración

### Variables de Entorno

Ver [`.env.notifications.example`](../../.env.notifications.example) para todas las opciones.

**Principales:**
```env
NOTIFICATIONS_ENABLED=true
NOTIFICATIONS_EMAIL_ENABLED=true
EMAIL_FROM=noreply@artists-hive.com
FRONTEND_URL=https://artists-hive.com
```

### Tipos de Notificación

Definidos en [`notificationTypes.js`](./notificationTypes.js):

- `prebooking.created` - Nuevo prebooking
- `prebooking.accepted` - Prebooking aceptado
- `prebooking.rejected` - Prebooking rechazado
- `prebooking.viewed` - Prebooking visto
- `booking.confirmed` - Booking confirmado
- `social.new_follower` - Nuevo seguidor
- ... y más

## Uso

### Enviar Notificación

```javascript
const notificationService = require('./infrastructure/notifications');

// Enviar notificación de prebooking creado
await notificationService.send({
  type: 'prebooking.created',
  recipient: {
    id: user._id,
    email: user.email,
    name: user.name || user.username,
  },
  data: {
    prebooking: prebookingDoc,
    requester: {
      name: requesterUser.name,
    },
  },
});
```

### Override de Canales

```javascript
await notificationService.send({
  type: 'prebooking.created',
  recipient: { ... },
  data: { ... },
  override: {
    channels: {
      email: true,  // Forzar email
      push: false,  // Desactivar push para este envío
    },
  },
});
```

### Email de Prueba

```javascript
await notificationService.sendTestEmail(
  'test@example.com',
  'Test Subject'
);
```

## API Endpoints

### POST `/api/notifications/test`
Enviar email de prueba.

**Body:**
```json
{
  "to": "test@example.com",
  "subject": "Test Email"
}
```

### POST `/api/notifications/send`
Enviar notificación genérica.

**Body:**
```json
{
  "type": "prebooking.created",
  "recipient": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "data": {
    "prebooking": { ... },
    "requester": { "name": "Jane Doe" }
  }
}
```

### GET `/api/notifications/types`
Obtener todos los tipos de notificaciones disponibles.

### GET `/api/notifications/config`
Obtener configuración actual del sistema.

## Agregar Nuevo Tipo de Notificación

1. **Definir el tipo** en `notificationTypes.js`:
```javascript
NEW_EVENT: {
  key: 'event.new',
  name: 'Nuevo Evento',
  channels: {
    email: true,
    push: true,
    sms: false,
    websocket: true,
  },
  priority: 'normal',
  template: 'event_new',
}
```

2. **Crear template en EmailChannel** (`channels/EmailChannel.js`):
```javascript
templateEventNew({ recipient, data }) {
  return {
    subject: `Nuevo evento: ${data.event.name}`,
    text: `...`,
    html: `...`,
  };
}
```

3. **Registrar template** en `getTemplate()`:
```javascript
getTemplate(templateName) {
  const templates = {
    // ...
    event_new: this.templateEventNew,
  };
  // ...
}
```

## Agregar Nuevo Canal

1. **Crear handler del canal** en `channels/`:
```javascript
// channels/PushChannel.js
class PushChannel {
  async send({ type, recipient, data }) {
    // Implementación
  }
}
module.exports = PushChannel;
```

2. **Registrar el canal** en `index.js`:
```javascript
if (isChannelEnabledGlobally('PUSH')) {
  const pushChannel = new PushChannel();
  NotificationService.registerChannel('push', pushChannel);
}
```

## Sistema de Flags

### Orden de Evaluación

1. **Flag Maestro** (`NOTIFICATIONS_ENABLED`)
   - Si es `false`, NO se envía NADA

2. **Flag de Canal Global** (ej: `NOTIFICATIONS_EMAIL_ENABLED`)
   - Si es `false`, el canal NO se usa para NINGÚN tipo

3. **Flag de Canal por Tipo** (en `notificationTypes.js`)
   - Define si ESE tipo específico usa el canal

**Ejemplo:**
```javascript
// Si NOTIFICATIONS_EMAIL_ENABLED=false
// Entonces NINGÚN tipo enviará emails,
// sin importar su configuración individual

// Si prebooking.created tiene email: false
// Entonces solo ese tipo NO enviará emails,
// pero otros tipos sí podrán hacerlo
```

## Testing

### Test Manual

1. Iniciar servidor
2. Probar endpoint de test:
```bash
curl -X POST http://localhost:8180/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "x-env: YOUR_ENV" \
  -d '{"to": "your-email@example.com"}'
```

### Verificar Configuración

```bash
curl http://localhost:8180/api/notifications/config \
  -H "x-api-key: YOUR_API_KEY" \
  -H "x-env: YOUR_ENV"
```

## TODO / Roadmap

- [ ] Implementar WebSocket channel
- [ ] Implementar Push channel (AWS SNS)
- [ ] Implementar SMS channel
- [ ] Sistema de cola con Bull/SQS
- [ ] Rate limiting por usuario
- [ ] Persistencia de historial en DB
- [ ] Dashboard de métricas
- [ ] Preferencias de notificación por usuario
- [ ] Unsubscribe links en emails
- [ ] Batch notifications (digest)

## Estructura de Archivos

```
infrastructure/notifications/
├── README.md                    # Este archivo
├── index.js                     # Punto de entrada, registra canales
├── NotificationService.js       # Orquestador principal
├── notificationConfig.js        # Configuración global y flags
├── notificationTypes.js         # Definición de tipos de notificaciones
└── channels/
    ├── EmailChannel.js          # Handler del canal Email
    ├── PushChannel.js           # [TODO] Handler de Push
    ├── SMSChannel.js            # [TODO] Handler de SMS
    └── WebSocketChannel.js      # [TODO] Handler de WebSocket
```

## Notas de Implementación

- El sistema usa `setImmediate()` para enviar notificaciones de forma asíncrona sin bloquear
- Los templates de email están en `EmailChannel.js` por ahora, considerar moverlos a archivos separados si crecen mucho
- AWS SES está configurado en `helpers/emailService.js`
- Las credenciales de AWS se toman del IAM role en Elastic Beanstalk automáticamente

## Soporte

Para reportar bugs o sugerir features, crear un issue en el repositorio.
