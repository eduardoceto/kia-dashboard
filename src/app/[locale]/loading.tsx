import { PuffLoader } from "react-spinners";


export default function Loading() {
    return (
        <div className="flex items-center justify-center h-screen">
            <PuffLoader
            color={"#05141F"}
            size={60}
            />
        </div>
    )
}