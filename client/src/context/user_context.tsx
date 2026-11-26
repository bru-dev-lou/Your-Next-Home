import { createContext, useEffect, useState, useContext } from "react";

type UserDetails = {
    id: number;
    name: string;
    username: string;
};

type UserContextType = {
    user: UserDetails | null;
    loading: boolean;
    setUser: (user: UserDetails | null) => void;
};

const UserDetails = createContext<UserContextType | null>(null);

export function UserDetailsManager ({ children }: { children: React.ReactNode }) {
    const [ user, setUser ] = useState<UserDetails | null>(null);
    const [ loading, setLoading ] = useState(true); 

    useEffect (() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch("/api/userCheck");
                const result = await res.json(); 
            
                if (res.ok) {
                    setUser(result.finalData);
                }
            }

            catch (error) {
                console.error(error);
                // User will be asked to log in. 
            }

            finally{
                setLoading(false);
            }
        }
        fetchUserData()
    }, []);
    
    return (
        <UserDetails.Provider value={{ user, setUser, loading }}>
            {children}
        </UserDetails.Provider>
    );
}
// Hook exported alongside component; splitting files planned for V2.

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
    const context = useContext(UserDetails);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
}