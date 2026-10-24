import { createContext, useEffect, useState } from "react";
import type { UserAuthContextType, UserData } from "./userAuthProvider.interface";
import { getUserData } from "./userAuthProvider.services";

export const UserAuthContext = createContext<UserAuthContextType>({
    userData: null,
    setUserData: () => {},
    isLoading: true,
});

export default function UserAuthProvider({children}:{children: React.ReactNode}) {
    const hasToken = typeof window !== "undefined" && Boolean(localStorage.getItem('user_tkn'));
    const [userData, setUserData] = useState<UserData|null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(hasToken);

    useEffect(function() {
        if (!hasToken) {
            setIsLoading(false);
            return;
        }

        getUserData()
            .then(function(data) {
                setUserData(data);
            })
            .finally(function() {
                setIsLoading(false);
            });
    }, [hasToken]);

    return (
        <UserAuthContext.Provider value={{userData, setUserData, isLoading}}>
            {children}
        </UserAuthContext.Provider>
    );
}