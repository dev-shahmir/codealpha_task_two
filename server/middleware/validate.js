import { fail } from '../utils/apiResponse.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return fail(res, 'Please check the highlighted fields and try again', 'VALIDATION_ERROR', 422, details);
  }
  req.body = result.data;
  next();
};
