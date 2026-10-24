import { useContext } from "react"
import { UserAuthContext } from "../../Context/UserAuthProvider/UserAuthProvider"
import { Navigate } from "react-router"


function AuthProtected({children}:{children: React.ReactNode}) {
    const { userData, isLoading } = useContext(UserAuthContext);
    
    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (userData) {
        return <Navigate to="/posts" replace />;
    }

    return <>{children}</>;
}

export default AuthProtected
