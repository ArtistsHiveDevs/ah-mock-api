const mongoose = require("mongoose");
require("dotenv").config();

const { schema: UserSchema } = require("../models/appbase/User");
const { schema: ArtistSchema } = require("../models/domain/Artist.schema");
const { schema: PlaceSchema } = require("../models/domain/Place.schema");
const { schema: EventSchema } = require("../models/domain/Event.schema");

// Reconstruye User.roles[].entityRoleMap a partir del entityRoleMap de cada
// entidad, que es la fuente de verdad. Recupera perfiles perdidos por updates
// que pisaban el array `roles` completo.
//
// Uso:
//   node scripts/rebuild-user-roles.js --env=dev --dry-run
//   node scripts/rebuild-user-roles.js --env=prod
const DRY_RUN = process.argv.includes("--dry-run");
const envArg = process.argv.find((arg) => arg.startsWith("--env="));
const targetEnv = envArg ? envArg.split("=")[1] : "dev";

// --assign=<EntityName>:<entityId>:<userId> (repetible) para entidades cuyo
// entityRoleMap quedo con ids vacios: ahi ya no hay forma de deducir el dueno.
const ASSIGNMENTS = process.argv
  .filter((arg) => arg.startsWith("--assign="))
  .map((arg) => {
    const [entityName, entityId, userId] = arg.split("=")[1].split(":");
    return { entityName, entityId, userId };
  });

const MONGO_URI_BY_ENV = {
  dev: process.env.MONGO_URI_DEV,
  uat: process.env.MONGO_URI_UAT,
  prod: process.env.MONGO_URI_PROD,
};

const ENTITY_SCHEMAS = {
  Artist: ArtistSchema,
  Place: PlaceSchema,
  Event: EventSchema,
};

function buildRoleEntry(entity, roles) {
  return {
    id: String(entity._id),
    profile_pic: entity.profile_pic,
    name: entity.name,
    username: entity.username,
    subtitle: entity.subtitle,
    verified_status: entity.verified_status,
    approval_status: entity.approval_status,
    roles,
  };
}

async function rebuild() {
  const mongoUri = MONGO_URI_BY_ENV[targetEnv];
  if (!mongoUri) {
    console.error(`❌ No se encontró MONGO_URI para env="${targetEnv}" en .env`);
    process.exit(1);
  }

  console.log(`🔄 Conectando a MongoDB (${targetEnv})...`);
  let connection;
  try {
    connection = await mongoose
      .createConnection(mongoUri, { serverSelectionTimeoutMS: 30000 })
      .asPromise();
  } catch (err) {
    console.error(`❌ No se pudo conectar a MongoDB (${targetEnv}): ${err.message}`);
    process.exit(1);
  }
  console.log("✅ Conectado a MongoDB");

  const User = connection.model("User", UserSchema);

  try {
    // Mapa userId -> entityName -> entityId -> { entity, roles: Set }
    const expected = new Map();

    for (const [entityName, entitySchema] of Object.entries(ENTITY_SCHEMAS)) {
      const EntityModel = connection.model(entityName, entitySchema);
      const entities = await EntityModel.find({
        "entityRoleMap.0": { $exists: true },
      });
      console.log(`\n📋 ${entities.length} ${entityName}(s) con entityRoleMap`);

      for (const entity of entities) {
        for (const roleGroup of entity.entityRoleMap || []) {
          for (const ownerId of roleGroup.ids || []) {
            const userKey = String(ownerId);
            if (!expected.has(userKey)) expected.set(userKey, new Map());
            const byEntityName = expected.get(userKey);
            if (!byEntityName.has(entityName)) byEntityName.set(entityName, new Map());
            const byEntityId = byEntityName.get(entityName);
            const entityKey = String(entity._id);
            if (!byEntityId.has(entityKey)) {
              byEntityId.set(entityKey, { entity, roles: new Set() });
            }
            if (roleGroup.role) byEntityId.get(entityKey).roles.add(roleGroup.role);
          }
        }
      }
    }

    // Reponer el OWNER en la entidad para las asignaciones manuales, y sumarlas
    // al mapa esperado para que tambien se reconstruya el snapshot del usuario.
    for (const { entityName, entityId, userId } of ASSIGNMENTS) {
      const entitySchema = ENTITY_SCHEMAS[entityName];
      if (!entitySchema) {
        console.warn(`  --assign con entidad desconocida: ${entityName}`);
        continue;
      }

      const EntityModel = connection.model(entityName, entitySchema);
      const entity = await EntityModel.findById(entityId);
      if (!entity) {
        console.warn(`  --assign: ${entityName}/${entityId} no existe`);
        continue;
      }

      const ownerObjectId = new mongoose.Types.ObjectId(userId);
      console.log(
        `
[assign] OWNER ${userId} -> ${entityName} "${entity.name}" (id=${entityId})`,
      );

      if (!DRY_RUN) {
        const ownerGroup = (entity.entityRoleMap || []).find(
          (group) => group.role === "OWNER",
        );
        if (ownerGroup) {
          if (!ownerGroup.ids.some((id) => String(id) === String(ownerObjectId))) {
            ownerGroup.ids.push(ownerObjectId);
          }
        } else {
          entity.entityRoleMap.push({ role: "OWNER", ids: [ownerObjectId] });
        }
        entity.markModified("entityRoleMap");
        await entity.save();
      }

      const userKey = String(userId);
      if (!expected.has(userKey)) expected.set(userKey, new Map());
      const byEntityName = expected.get(userKey);
      if (!byEntityName.has(entityName)) byEntityName.set(entityName, new Map());
      byEntityName
        .get(entityName)
        .set(String(entity._id), { entity, roles: new Set(["OWNER"]) });
    }

    console.log(`\n👤 ${expected.size} usuarios con al menos una entidad asociada`);

    let updated = 0;
    let untouched = 0;
    let missingUsers = 0;
    let restoredEntries = 0;

    for (const [userId, byEntityName] of expected.entries()) {
      const user = await User.findById(userId);
      if (!user) {
        console.warn(`  ⚠️  User ${userId} no existe; se omite`);
        missingUsers++;
        continue;
      }

      const currentRoles = user.roles || [];
      const restoredForUser = [];

      for (const [entityName, byEntityId] of byEntityName.entries()) {
        let roleGroup = currentRoles.find((group) => group.entityName === entityName);
        if (!roleGroup) {
          currentRoles.push({ entityName, entityRoleMap: [] });
          roleGroup = currentRoles[currentRoles.length - 1];
        }

        for (const [entityId, { entity, roles }] of byEntityId.entries()) {
          const existing = (roleGroup.entityRoleMap || []).find(
            (entry) => String(entry.id) === entityId,
          );
          if (existing) continue;

          roleGroup.entityRoleMap.push(
            buildRoleEntry(entity, roles.size ? [...roles] : ["OWNER"]),
          );
          restoredForUser.push(
            `${entityName} "${entity.name}" (@${entity.username || "sin username"}, id=${entityId})`,
          );
        }
      }

      if (!restoredForUser.length) {
        untouched++;
        continue;
      }

      console.log(`\n  → User ${userId} (${user.email || user.username || "sin email"})`);
      restoredForUser.forEach((line) => console.log(`      + ${line}`));
      restoredEntries += restoredForUser.length;

      if (DRY_RUN) continue;

      user.roles = currentRoles;
      user.markModified("roles");
      await user.save();
      updated++;
    }

    // Entidades que perdieron el OWNER en ambos lados: no hay de donde deducirlo.
    for (const [entityName, entitySchema] of Object.entries(ENTITY_SCHEMAS)) {
      const EntityModel = connection.model(entityName, entitySchema);
      const orphans = await EntityModel.find({
        entityRoleMap: { $elemMatch: { role: "OWNER", ids: { $size: 0 } } },
      });

      if (!orphans.length) continue;

      console.log(`
${entityName}(s) sin OWNER (requieren --assign):`);
      orphans.forEach((entity) => {
        console.log(
          `      --assign=${entityName}:${entity._id}:<userId>   # "${entity.name}" (@${entity.username || "sin username"})`,
        );
      });
    }

    console.log(`\n${DRY_RUN ? "🧪 DRY RUN — no se escribió nada" : "✅ Listo"}`);
    console.log(`   Entradas restauradas: ${restoredEntries}`);
    console.log(`   Usuarios ${DRY_RUN ? "que se actualizarían" : "actualizados"}: ${DRY_RUN ? "—" : updated}`);
    console.log(`   Usuarios ya consistentes: ${untouched}`);
    console.log(`   Usuarios no encontrados: ${missingUsers}`);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exitCode = 1;
  } finally {
    await connection.close();
  }
}

rebuild().catch((err) => {
  console.error("❌ Error inesperado:", err);
  process.exit(1);
});
