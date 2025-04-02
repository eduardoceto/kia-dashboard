"use client";

import Box from "@/src/components/box";
import { PropagateLoader } from "react-spinners";

const Loading = () => {
    return (
        <Box className="h-full flex items-center justify-center">
            {/* <BounceLoader color="#1F1F23" size={40} /> */}
            <PropagateLoader
                color="#1F1F23"
                size={40}
                className="ml-2"
                />
        </Box>
    );
}   

export default Loading;