export function ok(res, data, message = 'Success', status = 200) {
  return res.status(status).json({ success: true, message, data });
}

export function fail(res, message, code = 'ERROR', status = 400, details = undefined) {
  return res.status(status).json({ success: false, message, code, ...(details ? { details } : {}) });
}
