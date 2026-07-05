import Image from "next/image";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
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
          <h1 className="text-display font-semibold text-forest-900">Admin</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
