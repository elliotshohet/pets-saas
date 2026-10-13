export function localEmailMode() {
  return process.env.NODE_ENV === 'development' && process.env.LOCAL_EMAIL_LOGIN === 'true';
}
