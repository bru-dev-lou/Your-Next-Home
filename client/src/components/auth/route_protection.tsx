import { Navigate } from "react-router-dom";
import { useUser } from "../../context/user_context";

function RouteProtection ({ children } : {children : React.ReactNode}) {
    const { user } = useUser();

    if (!user){
        return <Navigate to="/signIn" />;
    }

    return children 
}

export default RouteProtection; 