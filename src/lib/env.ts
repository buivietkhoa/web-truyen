const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "CRON_SECRET",
] as const;

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[env] Thiếu biến môi trường bắt buộc: ${missing.join(", ")}\n` +
      `Hãy copy .env.example thành .env và điền đầy đủ các giá trị.`
    );
  }

  const jwtSecret = process.env.JWT_SECRET!;
  if (jwtSecret.length < 32) {
    throw new Error(
      `[env] JWT_SECRET quá ngắn (${jwtSecret.length} ký tự). Cần ít nhất 32 ký tự.\n` +
      `Tạo bằng: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
    );
  }

  const cronSecret = process.env.CRON_SECRET!;
  if (cronSecret.length < 16) {
    throw new Error(
      `[env] CRON_SECRET quá ngắn (${cronSecret.length} ký tự). Cần ít nhất 16 ký tự.\n` +
      `Tạo bằng: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
    );
  }
}

if (typeof window === "undefined") {
  validateEnv();
}
