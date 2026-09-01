function maskIds(data, context = "unknown") {
  if (Array.isArray(data)) {
    return data.map((item) => maskIds(item, context));
  }

  if (!isPlainMaskableObject(data)) {
    return data;
  }

  const source = data.constructor?.modelName || context;
  const plainData =
    typeof data.toObject === "function" ? data.toObject() : data;

  const hasSID = plainData.sID !== undefined && plainData.sID !== null;
  const has_Id = plainData._id !== undefined && plainData._id !== null;
  const hasIdVirtual = plainData.id !== undefined && plainData.id !== null;
  const hasMaskableId = hasSID && (has_Id || hasIdVirtual);

  if (!hasSID && (has_Id || hasIdVirtual)) {
    // console.warn(
    //   `[maskIds] sID ausente en ${source} (id=${plainData._id ?? plainData.id}); se expone el ObjectId real`,
    // );
  }

  const masked = {};
  Object.keys(plainData).forEach((key) => {
    if (hasMaskableId && key === "sID") {
      return;
    }
    masked[key] = maskIds(plainData[key], `${source}.${key}`);
  });

  if (hasMaskableId) {
    if (has_Id) {
      masked._id = plainData.sID;
    }
    if (hasIdVirtual) {
      masked.id = plainData.sID;
    }
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
