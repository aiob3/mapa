import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface NavigationContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  currentPath: "/",
  navigate: () => {},
});

export function useNavigate() {
  const { navigate } = useContext(NavigationContext);
  return navigate;
}

export function useLocation() {
  const { currentPath } = useContext(NavigationContext);
  return { pathname: currentPath };
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState("/");

  const navigate = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  return (
    <NavigationContext.Provider value={{ currentPath, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}
