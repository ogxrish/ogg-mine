import { useState } from "react";

type ToggleProps = {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
};

export default function Toggle({ checked = false, onChange }: ToggleProps) {
    const [isOn, setIsOn] = useState(checked);

    const handleToggle = () => {
        setIsOn(!isOn);
        onChange?.(!isOn);
    };

    return (
        <button
            onClick={handleToggle}
            className={`relative w-12 h-6 flex items-center bg-black rounded-full p-1 transition-all duration-300 ${isOn ? "bg-yellow-500" : "bg-purple-700"}`}
        >
            <div
                className={`w-4 h-4 bg-black rounded-full shadow-md transform transition-all duration-300 ${isOn ? "translate-x-6" : "translate-x-0"}`}
            ></div>
        </button>
    );
}