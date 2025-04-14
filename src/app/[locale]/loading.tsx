"use client";

import Box from "@/src/components/box";
import { PropagateLoader } from "react-spinners";
import { useTheme } from "next-themes";

const Loading = () => {
    const { theme } = useTheme();

    return (
        <Box className="fixed insert-0 z-50 h-full flex items-center justify-center">
            {/* <BounceLoader color="#1F1F23" size={40} /> */}
            <PropagateLoader
                color={theme === "dark" ? "#FFFAFC" : "#1F1F23"}
                size={40}
                className="ml-2"
            />
        </Box>
    );
}   

export default Loading;