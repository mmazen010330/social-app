import { useContext } from "react"
import { UserAuthContext } from "../../Context/UserAuthProvider/UserAuthProvider"
import { Navigate } from "react-router"


function ProtectedRoute({children}:{children: React.ReactNode}) {
    const { userData, isLoading } = useContext(UserAuthContext);
    
    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-gray-500">Checking session...</span>
            </div>
        );
    }

    if (userData) {
        return <>{children}</>;
    }

    return <Navigate to="/login" replace />;
}

export default ProtectedRoute
