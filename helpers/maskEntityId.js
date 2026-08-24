function maskIds(data) {
  if (Array.isArray(data)) {
    return data.map((item) => maskIds(item));
  }

  if (!isPlainMaskableObject(data)) {
    return data;
  }

  const hasSID = data.sID !== undefined && data.sID !== null;
  const has_Id = data._id !== undefined && data._id !== null;
  const hasIdVirtual = data.id !== undefined && data.id !== null;
  const hasMaskableId = hasSID && (has_Id || hasIdVirtual);

  const masked = {};
  Object.keys(data).forEach((key) => {
    if (hasMaskableId && key === "sID") {
      return;
    }
    masked[key] = maskIds(data[key]);
  });

  if (hasMaskableId) {
    if (has_Id) {
      masked._id = data.sID;
    }
    if (hasIdVirtual) {
      masked.id = data.sID;
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
