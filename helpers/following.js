const { default: mongoose } = require("mongoose");
const { getModel } = require("./getModel");

async function followProfile(
  req,
  res,
  action,
  list,
  followerInfo,
  followedInfo
) {
  const {
    entityDirectoryId: entityDirectoryIdFollower,
    id: idFollowerData,
    identifier: indentifierFollower,
    username: usernameFollower,
    entity: entityFollower,
  } = followerInfo;

  const {
    entityDirectoryId: entityDirectoryIdFollowed,
    id: idFollowedData,
    identifier: indentifierFollowed,
    username: usernameFollowed,
    entity: entityFollowed,
  } = followedInfo;

  if (!mongoose.Types.ObjectId.isValid(idFollowedData)) {
    throw Error("Invalid IDs (Followed) ", idFollowedData);
  }
  if (!mongoose.Types.ObjectId.isValid(idFollowerData)) {
    throw Error("Invalid IDs (Follower) ", idFollowedData);
  }

  const idFollowed = new mongoose.Types.ObjectId(idFollowedData);
  const idFollower = new mongoose.Types.ObjectId(idFollowerData);

  const modelNameFollowed = entityFollowed;
  const FollowedModel = await getModel(
    req.serverEnvironment,
    modelNameFollowed
  );
  let followList = list === "followed" ? "followed_by" : "followed_profiles";

  let query = {
    $or: [
      { _id: idFollowed },
      { username: usernameFollowed || indentifierFollowed },
    ],
  };

  // 🔍 Buscar si el usuario ya sigue a la entidad
  let followedEntityInfo = await FollowedModel.findOne({
    ...query,
    [followList]: {
      $elemMatch: { entityId: idFollower, entityType: entityFollower },
    },
  }).select("_id");

  const existingFollower = !!followedEntityInfo;

  let update = {};
  let arrayFilters = [];

  if (action === "follow") {
    if (!existingFollower) {
      // ✅ Si no sigue aún, agregarlo
      update = {
        $push: {
          [followList]: {
            entityDirectoryId: entityDirectoryIdFollower,
            entityId: idFollower,
            entityType: entityFollower,
            isFollowing: true,
          },
        },
      };
    } else {
      // 🔄 Si ya sigue, asegurarse de que `isFollowing` está activo
      update = { $set: { [`${followList}.$[elem].isFollowing`]: true } };
      arrayFilters = [
        { "elem.entityId": idFollower, "elem.entityType": entityFollower },
      ];
    }
  } else if (action === "unfollow") {
    if (existingFollower) {
      update = { $set: { [`${followList}.$[elem].isFollowing`]: false } };
      arrayFilters = [
        { "elem.entityId": idFollower, "elem.entityType": entityFollower },
      ];
    } else {
      throw Error("No sigues a esta entidad");
    }
  }

  if (Object.keys(update).length > 0) {
    const updateResult = await FollowedModel.updateOne(
      query,
      update,
      arrayFilters.length ? { arrayFilters } : {}
    );

    // 🛠️ Si `followList` no existe, se crea con `upsert`
    if (action === "follow" && updateResult.modifiedCount === 0) {
      await FollowedModel.updateOne(
        query,
        { $setOnInsert: { [followList]: [] } },
        { upsert: true }
      );
    }
  }
}

module.exports = { followProfile };
