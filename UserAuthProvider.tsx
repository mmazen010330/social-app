import { createContext, useEffect, useState } from "react";
import type { UserAuthContextType, UserData } from "./userAuthProvider.interface";
import { getUserData } from "./userAuthProvider.services";

export const UserAuthContext = createContext<UserAuthContextType>({
    userData: null,
    setUserData: () => {},
    isLoading: true,
});

export default function UserAuthProvider({children}:{children: React.ReactNode}) {
    const [userData, setUserData] = useState<UserData|null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(function() {
        const hasToken = Boolean(localStorage.getItem('user_tkn'));

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
    }, []);

    return (
        <UserAuthContext.Provider value={{userData, setUserData, isLoading}}>
            {children}
        </UserAuthContext.Provider>
    );
}