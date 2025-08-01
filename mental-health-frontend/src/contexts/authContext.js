// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'; // Added useCallback
import { registerUser as apiRegisterUser, loginUser as apiLoginUser, setAuthToken } from '../utils/api'; // Ensure this path is correct

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => {
        const storedUserString = localStorage.getItem('user');
        if (storedUserString) {
            try {
                const parsedUser = JSON.parse(storedUserString);
                if (parsedUser && typeof parsedUser === 'object') {
                    return parsedUser;
                }
            } catch (error) {
                console.error("Initial user parse error from localStorage:", error);
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(true);

    // Define logout using useCallback to ensure a stable function reference
    // if it were to be used as a dependency in other effects, or to satisfy exhaustive-deps.
    // In this specific case, since logout itself has no dependencies, its reference would be stable
    // even without useCallback if defined directly in the component scope, but useCallback is good practice.
    const logout = useCallback(() => {
        // console.log("[AuthContext] logout called");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setAuthToken(null);
    }, []); // No dependencies for logout itself

    useEffect(() => {
        // This effect runs once on mount to consolidate auth state
        // console.log("[AuthContext] Mount useEffect running. Initial user state:", user);
        const currentToken = localStorage.getItem('token');
        const currentUserString = localStorage.getItem('user');
        let userFromStorage = null; // Variable to hold user parsed from storage for this effect run

        if (currentToken) {
            setAuthToken(currentToken);
            if (currentUserString) {
                try {
                    const parsedUser = JSON.parse(currentUserString);
                    if (parsedUser && typeof parsedUser === 'object') {
                        userFromStorage = parsedUser;
                    } else {
                        console.warn("Invalid user data in localStorage (useEffect). Clearing auth.");
                        logout(); // Clears token and user state
                    }
                } catch (error) {
                    console.error("Parse error for user from localStorage (useEffect):", error);
                    logout(); // Clears token and user state
                }
            } else {
                // Token exists, but no user data.
                console.warn("Token found but no user data in localStorage (useEffect). Clearing auth.");
                logout(); // Clears token and user state
            }
        } else {
            // No token found. If user state still exists, it's inconsistent.
            // The logout() call handles setting user to null.
            // If 'user' (from useState) is not null here, it means it was initialized
            // with a value from localStorage even though token was null, or some other logic error.
            // The initial useState for 'user' should ideally align with token presence.
            // If no token, logout() ensures everything is cleared.
            if (localStorage.getItem('user') || localStorage.getItem('token')) { // Double check localStorage
                // This case implies token was removed but user wasn't, or vice-versa
                // console.log("[AuthContext] Inconsistency: No currentToken, but user/token might exist in localStorage. Forcing logout.")
                logout();
            }
        }

        // Update user state only if the user parsed from storage for *this effect run*
        // is different from the current user state. This primarily handles the initial load.
        // The `user` in the `if` condition here refers to the `user` state from the `useState` hook.
        if (JSON.stringify(user) !== JSON.stringify(userFromStorage)) {
            // console.log("[AuthContext] Mount useEffect: Updating user state from localStorage value.", userFromStorage);
            setUser(userFromStorage);
        }

        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [logout]); // `logout` is added as it's a stable function called within the effect.
                  // `user` is intentionally omitted from the dependency array.
                  // This useEffect is designed to run ONCE on mount to initialize state
                  // from localStorage. It reads the current `user` state only to potentially
                  // avoid a redundant `setUser` call if the initial state from `useState`
                  // already matches what's in localStorage.
                  // It's not meant to re-run if `user` changes due to login/signup,
                  // as those functions handle their own state updates.
                  // This is a common and accepted use case for disabling the rule for `user`.

    const login = async (email, password) => {
        // console.log("[AuthContext] login: Attempting login...");
        setLoading(true);
        try {
            const data = await apiLoginUser({ email, password });
            if (data && data.token && data.user && typeof data.user === 'object') {
                // console.log("[AuthContext] login: API success. User:", data.user, "Token:", data.token ? "Exists" : "Missing");
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setAuthToken(data.token);
                setUser(data.user); // This will trigger re-renders where useAuth().user is used
                setToken(data.token); // This will trigger re-renders where useAuth().token is used
                setLoading(false);
                return data.user;
            } else {
                console.error("[AuthContext] login: Invalid data from server. Data:", data);
                throw new Error("Login failed: Invalid data received from server.");
            }
        } catch (error) {
            console.error("[AuthContext] login: Error caught:", error);
            setLoading(false);
            logout(); // Ensure cleanup on error
            throw error;
        }
    };

    const signup = async (username, email, password) => {
        // console.log("[AuthContext] signup: Attempting signup...");
        setLoading(true);
        try {
            const data = await apiRegisterUser({ username, email, password });
            if (data && data.token && data.user && typeof data.user === 'object') {
                // console.log("[AuthContext] signup: API success. User:", data.user, "Token:", data.token ? "Exists" : "Missing");
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setAuthToken(data.token);
                setUser(data.user);
                setToken(data.token);
                setLoading(false);
                return data.user;
            } else {
                console.error("[AuthContext] signup: Invalid data from server. Data:", data);
                throw new Error("Signup failed: Invalid data received from server.");
            }
        } catch (error) {
            console.error("[AuthContext] signup: Error caught:", error);
            setLoading(false);
            logout(); // Ensure cleanup on error
            throw error;
        }
    };

    // logout is now defined above with useCallback

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, loading, isAuthenticated: !!user && !!token }}>
            {!loading ? children : null /* Or a global loading spinner */}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};