"use client";

import { useState, useEffect } from "react";
import { LogUploadModal } from "../components/log-upload-modal";

const LogUploadProvider = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, []);

    if (!isOpen) return null;

    return (
        <LogUploadModal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSubmit={() => {}}
            task={null}
        />
    )
}

export default LogUploadProvider;

