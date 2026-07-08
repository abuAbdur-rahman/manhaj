import Image from "next/image";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage =
    error === "deactivated"
      ? "Your account has been deactivated. Contact a super admin."
      : null;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <div className="relative h-12 w-12 shrink-0">
            <Image
              src="/logo.png"
              alt="Manhaj"
              fill
              className="object-contain"
              loading="eager"
            />
          </div>
          <h1 className="text-display font-semibold text-forest-900 dark:text-ink-100">
            Admin
          </h1>
        </div>
        {errorMessage && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
