// Validaciones comunes - no en tipos, en utilidades
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-()]+$/;
export function validateEmail(email) {
    return EMAIL_REGEX.test(email);
}
export function validatePhone(phone) {
    return PHONE_REGEX.test(phone);
}
