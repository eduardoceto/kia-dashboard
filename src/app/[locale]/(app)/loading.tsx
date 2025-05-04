import { ScaleLoader } from "react-spinners";


export default function Loading() {
    return (
        <div className="flex items-center justify-center h-screen">
            <ScaleLoader
            color={"#05141F"}
            height={30}
            width={30}
            barCount={5}
            />
        </div>
    )
}