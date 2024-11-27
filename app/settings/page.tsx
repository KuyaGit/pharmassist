"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { SideNavBar } from "@/components/SideNavBar";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarNav } from "./components/sidebar-nav";
import { useUser } from "@/lib/context/UserContext";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings",
  },
  {
    title: "Password",
    href: "/settings/password",
  },
];

const profileFormSchema = z
  .object({
    first_name: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    last_name: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    phone_number: z.string().optional(),
    license_number: z.string().optional(),
    current_password: z.string().min(8).optional(),
    new_username: z.string().min(3).optional(),
    new_password: z.string().min(8).optional(),
    confirm_password: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.new_password) return true;
      return data.new_password === data.confirm_password;
    },
    {
      message: "Passwords don't match",
      path: ["confirm_password"],
    }
  );

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const credentialsFormSchema = z.object({
  current_password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  new_username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  new_password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

type CredentialsFormValues = z.infer<typeof credentialsFormSchema>;

export default function Settings() {
  const { refreshUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      license_number: "",
      current_password: "",
      new_username: "",
      new_password: "",
    },
  });

  const credentialsForm = useForm<CredentialsFormValues>({
    resolver: zodResolver(credentialsFormSchema),
    defaultValues: {
      current_password: "",
      new_username: "",
      new_password: "",
    },
  });

  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);

  useEffect(() => {
    const checkAndFetchProfile = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        // First check if profile exists
        const hasProfileResponse = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.HAS_PROFILE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!hasProfileResponse.ok) {
          throw new Error("Failed to check profile status");
        }

        const hasProfileData = await hasProfileResponse.json();
        setHasProfile(hasProfileData);

        // If profile exists, fetch the data
        if (hasProfileData) {
          const profileResponse = await fetch(
            `${API_BASE_URL}${API_ENDPOINTS.AUTH.PROFILE}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!profileResponse.ok) {
            throw new Error("Failed to fetch user data");
          }

          const data = await profileResponse.json();
          setUserData(data);

          form.reset({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            phone_number: data.phone_number || "",
            license_number: data.license_number || "",
            current_password: "",
            new_username: "",
            new_password: "",
          });
        }
      } catch (error) {
        toast.error("Failed to fetch user data");
      }
    };

    checkAndFetchProfile();
  }, [form]);

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!hasProfile) {
        // Update initial credentials first
        const credentialsResponse = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.UPDATE_INITIAL_CREDENTIALS}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              current_password: data.current_password,
              new_username: data.new_username,
              new_password: data.new_password,
            }),
          }
        );

        const responseData = await credentialsResponse.json();

        if (!credentialsResponse.ok) {
          if (responseData.detail === "Username already exists") {
            form.setError("new_username", {
              type: "manual",
              message: "Username already exists",
            });
            setIsLoading(false);
            return;
          }
          if (responseData.detail === "Current password is incorrect") {
            form.setError("current_password", {
              type: "manual",
              message: "Current password is incorrect",
            });
            setIsLoading(false);
            return;
          }
          throw new Error("Failed to update credentials");
        }

        document.cookie = `token=${responseData.access_token}; path=/`;
      }

      // Continue with profile creation/update
      const profileResponse = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.PROFILE}`,
        {
          method: hasProfile ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone_number: data.phone_number,
            license_number: data.license_number,
          }),
        }
      );

      if (!profileResponse.ok) {
        throw new Error(
          hasProfile ? "Failed to update profile" : "Failed to create profile"
        );
      }

      toast.success(
        hasProfile
          ? "Profile updated successfully"
          : "Profile created successfully"
      );
      setHasProfile(true);
      refreshUser();
    } catch (error) {
      // Only show toast for non-username validation errors
      if (
        !(error instanceof Error && error.message === "Username already exists")
      ) {
        toast.error(
          hasProfile ? "Failed to update profile" : "Failed to create profile"
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function onCredentialsSubmit(data: CredentialsFormValues) {
    setIsCredentialsLoading(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.UPDATE_INITIAL_CREDENTIALS}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update credentials");
      }

      const result = await response.json();

      // Update the token with the new one returned from the server
      document.cookie = `token=${result.access_token}; path=/`;

      toast.success("Credentials updated successfully");
      credentialsForm.reset();
      refreshUser();
    } catch (error) {
      toast.error("Failed to update credentials");
    } finally {
      setIsCredentialsLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto space-y-6 p-4 md:p-6 lg:p-8">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
          <Separator />
          <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="-mx-4 lg:w-1/5">
              <SidebarNav items={sidebarNavItems} />
            </aside>
            <div className="flex-1 lg:max-w-2xl">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    This is how others will see you on the site.
                  </p>
                </div>
                <Separator />
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your first name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your last name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your email"
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This is your verified email address.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {!hasProfile && (
                      <>
                        <Separator />
                        <div>
                          <h3 className="text-lg font-medium">
                            Initial Credentials Setup
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Please update your login credentials.
                          </p>
                        </div>
                        <FormField
                          control={form.control}
                          name="current_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter your current password"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="new_username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter new username"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="new_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter new password"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="confirm_password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Confirm your new password"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                    <Button type="submit" disabled={isLoading}>
                      {isLoading
                        ? "Saving..."
                        : hasProfile
                        ? "Update Profile"
                        : "Create Profile & Update Credentials"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
