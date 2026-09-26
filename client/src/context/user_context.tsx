import { createContext, useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";

type UserData = {
    id: number;
    name: string;
    username: string;
};

type UserContextType = {
    user: UserData | null;
    loading: boolean;
    setUser: (user: UserData | null) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider ({ children }: { children: React.ReactNode }) {
    const [ user, setUser ] = useState<UserData | null>(null);
    const [ loading, setLoading ] = useState(false); 
    const location = useLocation(); 

    useEffect (() => {
        if (location.pathname === "/" || location.pathname === "/inquiries" || location.pathname === "/signIn" || location.pathname === "/signUp") {
            return; 
        }

        setLoading(true);

        const fetchUserData = async () => {

            try {
                const res = await fetch("/api/userCheck");
                const result = await res.json(); 
            
                if (res.ok) {
                    setUser(result.finalData);
                }
            }

            catch (error) {
                // User will be asked to log in. 
            }

            finally{
                setLoading(false);
            }
        }
        fetchUserData()
    }, [location.pathname]);
    
    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
}