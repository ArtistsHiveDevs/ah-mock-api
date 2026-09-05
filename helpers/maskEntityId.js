const SENSITIVE_FIELDS = ["sub", "password"];

const HINT_FIELDS = ["username", "name", "email", "title", "stage_name"];

function maskIds(data, path = "root") {
  if (Array.isArray(data)) {
    return data.map((item, index) => maskIds(item, `${path}[${index}]`));
  }

  if (!isPlainMaskableObject(data)) {
    return data;
  }

  const plainData =
    typeof data.toObject === "function" ? data.toObject() : data;

  const entityLabel =
    data.constructor?.modelName || plainData.entityType || plainData.__t;

  const hasSID = plainData.sID !== undefined && plainData.sID !== null;
  const has_Id = plainData._id !== undefined && plainData._id !== null;
  const hasIdVirtual = plainData.id !== undefined && plainData.id !== null;
  const hasMaskableId = hasSID && (has_Id || hasIdVirtual);

  if (!hasSID && has_Id) {
    const hintField = HINT_FIELDS.find(
      (field) => plainData[field] !== undefined && plainData[field] !== null,
    );
    const hint = hintField ? `, ${hintField}="${plainData[hintField]}"` : "";
    console.warn(
      `[maskIds] sID ausente en ${path}${entityLabel ? ` (${entityLabel})` : ""} ` +
        `(id=${plainData._id ?? plainData.id}${hint}); se expone el ObjectId real`,
    );
  }

  const masked = {};
  Object.keys(plainData).forEach((key) => {
    if (hasMaskableId && key === "sID") {
      return;
    }
    if (SENSITIVE_FIELDS.includes(key)) {
      return;
    }
    masked[key] = maskIds(plainData[key], `${path}.${key}`);
  });

  if (hasMaskableId) {
    if (has_Id) {
      delete masked._id;
    }
    masked.id = plainData.sID;
  }

  return masked;
}

function isPlainMaskableObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }
  if (value instanceof Date || Buffer.isBuffer(value) || value instanceof Map) {
    return false;
  }

  if (typeof value.toHexString === "function") {
    return false;
  }
  return true;
}

module.exports = { maskIds };
