module.exports = {
  createPaginatedDataResponse(data, currentPage = 1, totalPages = 1) {
    return {
      data,
      currentPage,
      totalPages,
    };
  },
  createAPIErrorResponse(message, errorCode, errorNumber) {
    return { message, errorCode, errorNumber };
  },
};
