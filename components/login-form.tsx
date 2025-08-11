"use client";

/*
const { data, error } = await supabase.auth.getUser()
const displayName = data.user.user_metadata.display_name
*/


import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  //const [displayName, setDisplayName] = useState("");
  const [displayNameGuest, setDisplayNameGuest] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGuest, setIsLoadingGuest] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.refresh();
      router.push('/');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoadingGuest(true);
    setError(null);
  try {
      const {data, error} = await supabase.auth.getSession()
      if (error) throw error;
      if(data.session){
        console.log("An authenticated session is already active");
      }else{
        console.log("Making an Anonymous user");
        const { error } = await supabase.auth.signInAnonymously();
        const { data: updateDisplayName, error: updateDisplayNameError } = await supabase.auth.updateUser({
          data:{
            displayName: `${displayNameGuest}`,
          }
        })
        if (updateDisplayNameError) throw error;
        console.log("Guest account created w/ "+`${updateDisplayName}`);
      }
      router.refresh();
      router.push('/');
    }catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoadingGuest(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                {/*
                <Label htmlFor="email">Display Name</Label>
                <Input
                  id="displayName"
                  type="displayName"
                  placeholder="Guest"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                */}
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Anonymous Login</CardTitle>
          <CardDescription>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGuestLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Display Name</Label>
                <Input
                  id="displayNameGuest"
                  type="displayNameGuest"
                  placeholder="Guest"
                  required
                  value={displayNameGuest}
                  onChange={(e) => setDisplayNameGuest(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoadingGuest}>
                {isLoadingGuest ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
