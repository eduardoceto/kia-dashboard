"use client";

import { ManagerContextProvider } from "../hooks/useManager";

interface ManagerProviderProps {
    children: React.ReactNode;
};

const ManagerProvider: React.FC<ManagerProviderProps> = ({
    children
}) => {
    return (
        <ManagerContextProvider>
            {children}
        </ManagerContextProvider>
    )
};

export default ManagerProvider;