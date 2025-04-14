"use client";

import { useState, useEffect } from "react";
import { LogUploadModal } from "../components/log-upload-modal";

const LogUploadProvider = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(true);
    }, []);

    if (!isOpen) return null;

    return (
            <LogUploadModal />
    )
}

export default LogUploadProvider;
