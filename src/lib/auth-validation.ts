const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePassword(password: string) {
  if (password.length < 8) {
    return "Mật khẩu phải có ít nhất 8 ký tự.";
  }

  if (!/[A-Za-zÀ-ỹ]/.test(password) || !/\d/.test(password)) {
    return "Mật khẩu cần có cả chữ và số.";
  }

  return "";
}
