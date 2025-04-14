import { create } from "zustand";
import { LogData } from "@/types";
import { Task } from "@/types";


interface LogUploadModalProps {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
    onSubmit: (data: LogData) => void
    task: Task | null
}

const useLogModal = create<LogUploadModalProps>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
    onSubmit: (data) => {
        // Handle form submission
        console.log("Form submitted with data:", data);
        set({ isOpen: false });
    },
    task: null,
}));

export default useLogModal;