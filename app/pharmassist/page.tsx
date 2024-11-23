"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { toast } from "sonner";
import { ImageCarousel } from "@/components/ImageCarousel";

export default function PharmAssist() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      document.cookie = `token=${data.access_token}; path=/`;
      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0">
          <ImageCarousel />
        </div>
        <div className="relative z-20 flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-white/80 flex items-center justify-center">
            <Icons.logo width={28} height={28} className="dark:invert" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold tracking-tight">Pomona</h2>
            <p className="text-sm text-white/60">PharmAssist</p>
          </div>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 mb-6 lg:hidden">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icons.logo width={20} height={20} className="dark:invert" />
              </div>
              <div className="flex flex-col items-start">
                <h2 className="text-lg font-bold">Pomona</h2>
                <p className="text-sm text-muted-foreground">PharmAssist</p>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-center">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground text-center">
                Enter your credentials to access your account
              </p>
            </div>
            <form onSubmit={onSubmit} className="text-left">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    type="text"
                    autoCapitalize="none"
                    autoComplete="username"
                    autoCorrect="off"
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    disabled={isLoading}
                  />
                </div>
                <Button disabled={isLoading}>
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign in
                </Button>
              </div>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button variant="outline" type="button" disabled={isLoading}>
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.google className="mr-2 h-4 w-4" />
              )}{" "}
              Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
