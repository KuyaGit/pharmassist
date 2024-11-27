"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { useUser } from "@/lib/context/UserContext";

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  license_number?: string;
  created_at: string;
  updated_at: string;
}

interface User {
  username: string;
  role: string;
  branch_id?: number;
  profile?: UserProfile;
  full_name?: string;
  email?: string;
}

export function useCurrentUser() {
  const { user, setUser } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = document.cookie.replace(
          /(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/,
          "$1"
        );
        if (!token) {
          setIsLoading(false);
          return null;
        }

        const profileResponse = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.PROFILE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setUser({
            username: profileData.username || "",
            role: profileData.role || "",
            branch_id: profileData.branch_id,
            profile: profileData,
            full_name: `${profileData.first_name} ${profileData.last_name}`,
            email: profileData.email,
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [setUser]);

  return { user, isLoading, setUser };
}
