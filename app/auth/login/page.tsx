import { LoginForm } from "@/components/login-form";
import { LogoutButton } from "@/components/logout-button";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
        <LogoutButton/> - Testing logouts. Sorry for presentation.
      </div>
    </div>
  );
}
