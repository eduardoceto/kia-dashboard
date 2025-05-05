import { ScaleLoader } from "react-spinners";


export default function Loading() {
    return (
        <div className="flex items-center justify-center h-screen">
            <ScaleLoader
            color={"#05141F"}
            height={18}
            width={10}
            margin={5}
            barCount={14}
            />
        </div>
    )
}