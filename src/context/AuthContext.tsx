import {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactNode,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { User } from "firebase/auth";
import {
  auth,
  signOutAccount,
  signInWithEmail,
  checkUserAndSignIn,
} from "../util/firebase";
import { PetUser } from "../Types/User/PetUser";

interface UserWithToken extends User {
  accessToken: string;
}

export type AuthContextValue = {
  currentUser: Partial<PetUser>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  return useContext<AuthContextValue | null>(AuthContext);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<Partial<PetUser>>({});
  const [loading, setLoading] = useState(true);

  const setUser = (user: PetUser) => {
    if (user.token) {
      setCurrentUser(user);
      window.localStorage.setItem("token", user.token);
      navigate("/community/list");
    }
  };

  const login = async (email: string, password: string) => {
    await signInWithEmail(email, password);
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken(
        /* forceRefresh */ true
      );
      if (idToken) {
        const res = await checkUserAndSignIn(idToken);
        if (res?.data) {
          setUser(res.data);
        }
      }
    }
  };

  const logout = () => signOutAccount();

  useEffect(() => {
    const unSubscription = auth.onAuthStateChanged(
      async (userInfo: User | null) => {
        console.log("auth.onAuthStateChanged userInfo ::", userInfo);
        const userWithToken = userInfo as UserWithToken;
        if (userWithToken) {
          const res = await checkUserAndSignIn(userWithToken.accessToken);
          if (res?.data) {
            setUser(res.data);
            window.localStorage.removeItem("token");
            window.localStorage.setItem("token", res.data.token);
          }
        } else {
          navigate("/login");
          window.localStorage.removeItem("token");
        }
        setLoading(false);
      }
    );
    unSubscription();
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      login,
      logout,
    }),
    []
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
};
