import React, { createContext, useContext, useState, } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Inicializamos el estado leyendo el localStorage una sola vez al cargar
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
        () => !!localStorage.getItem("token")
    );

    const login = (token: string) => {
        localStorage.setItem("token", token);
        setIsAuthenticated(true); // Al cambiar esto, React re-renderiza todo lo que escuche el contexto
    };

    const logout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false); // Al pasar a false, el Layout reaccionará echará al usuario inmediatamente
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar la autenticación de forma limpia
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
};