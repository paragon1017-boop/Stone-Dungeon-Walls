import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";

// DEV MODE: Always return authenticated user
const DEV_USER: User = {
  id: "dev-player-1",
  email: "player@game.com",
  firstName: "Player",
  lastName: "One",
  profileImageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

async function fetchUser(): Promise<User | null> {
  // DEV MODE: Always return user without checking server
  return DEV_USER;
  
  // Original code (commented out for dev):
  // const response = await fetch("/api/auth/user", {
  //   credentials: "include",
  // });
  // if (response.status === 401) {
  //   return null;
  // }
  // if (!response.ok) {
  //   throw new Error(`${response.status}: ${response.statusText}`);
  // }
  // return response.json();
}

async function logout(): Promise<void> {
  // DEV MODE: Just reload page
  window.location.reload();
  
  // Original code:
  // window.location.href = "/api/logout";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: Infinity, // Never refetch
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user: user || DEV_USER,
    isLoading: false, // Never show loading
    isAuthenticated: true, // Always authenticated
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
