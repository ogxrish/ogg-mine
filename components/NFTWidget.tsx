import { CgMediaLive } from "react-icons/cg";



export default function NFTWidget({ name, selected, onSelect, staked }: { name: string; selected: boolean; onSelect: () => any; staked: boolean; }) {
    return (
        <div
            className={`p-2 border-2 ${selected ? "border-white" : "border-gray-700"} rounded-lg flex flex-col justify-center items-center gap-2 hover:cursor-pointer relative`}
            onClick={onSelect}
        >
            {staked &&
                <div className="h-4 w-4 md:h-7 md:w-7 items-center drop-shadow-lg flex bg-green-500 absolute top-1 right-1 rounded-full z-10">
                    <CgMediaLive className="mx-auto opacity-50 " size={24} />
                </div>
            }
            <img src="/placeholder-square.jpg" className="h-36 aspect-auto" />
            <p>{name}</p>
        </div>
    );
}