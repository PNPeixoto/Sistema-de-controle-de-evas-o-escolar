import { Navigate } from 'react-router-dom';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const token = localStorage.getItem('token');

    // Se não houver token, manda de volta para o login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    return children;
};