module.exports = {
  getPagination: (query_params) => {
    const DEFAULT_OFFSET = 0;
    const DEFAULT_LIMIT = 10;
    const MAX_LIMIT = 100;

    let limit = Math.min(parseInt(query_params.limit || DEFAULT_LIMIT, 10), 100);

    // if a negative or a very high number is given, set it to the default value
    if (limit < 0 || limit > MAX_LIMIT) {
      limit = DEFAULT_LIMIT;
    }

    let skip_value = parseInt(query_params.offset || DEFAULT_OFFSET, 10) * limit;

    // if a negative or a very high number is given, set it to the default value
    if (skip_value < 0) {
      skip_value = DEFAULT_OFFSET * limit;
    }

    let order = 1;
    if (query_params?.order === 'desc') { order = -1; } else { order = 1; }

    const orderby = query_params.orderby ? query_params.orderby : 'createdAt';

    let createdAt = 1;
    if (query_params?.createdAt === 'desc') { createdAt = -1; } else { createdAt = 1; }

    return {
      limit,
      offset: parseInt(query_params.offset || DEFAULT_OFFSET, 10),
      skip: skip_value,
      createdAt,
      order,
      orderby,
    };
  },
};
