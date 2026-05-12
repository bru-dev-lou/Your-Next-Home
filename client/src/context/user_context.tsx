import { createContext, useContext, useState } from "react";

type UserData = {
    id: number;
    name: string;
    username: string;
};

type UserContextType = {
    user: UserData | null;
    setUser: (user: UserData | null) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider ({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
}