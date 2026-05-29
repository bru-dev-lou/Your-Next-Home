import { createContext, useContext, useEffect, useState } from "react";

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
    const [ loading, setLoading ] = useState(true); 

    useEffect (() => {
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
            // silent fail - user will see the 'Sign in' link. 
            }

            finally{
                setLoading(false);
            }
        }
        fetchUserData()
    }, []);
    
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