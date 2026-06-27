import { WaveformSeal } from "@/components/ui/waveform-seal";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <WaveformSeal className="mx-auto mb-4" variant="inline" />
          <h1 className="text-display font-semibold text-forest-900">
            Manhaj Admin
          </h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
