
import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { UserProfile, getUser, saveUser, logout as logoutUser, saveAccessToken, getAccessToken } from '@/lib/auth';
import { toast } from "sonner";

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const loggedInUser = getUser();
    if (loggedInUser) {
      setUser(loggedInUser);
      const storedToken = getAccessToken();
      if (storedToken) {
        setAccessToken(storedToken);
      }
    }
  }, []);

  const handleLoginSuccess = async (tokenResponse: any) => {
    const token = tokenResponse.access_token;
    saveAccessToken(token);
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });
      const profile = await res.json();
      const newUser: UserProfile = {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
      };
      saveUser(newUser);
      setUser(newUser);
      setAccessToken(token);
    } catch(err) {
      console.error("Failed to fetch user profile", err);
      toast.error("Failed to log in.", { description: "Could not fetch your user profile from Google." });
    }
  };
  
  const login = useGoogleLogin({
    onSuccess: handleLoginSuccess,
    onError: (error) => {
      console.log('Login Failed:', error);
      toast.error("Login Failed", { description: "There was an issue signing in with Google." });
    },
    scope: 'https://www.googleapis.com/auth/drive.appdata',
  });
  
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setAccessToken(null);
  };

  return {
    user,
    accessToken,
    login,
    handleLogout
  };
};
