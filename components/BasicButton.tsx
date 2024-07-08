export default function BasicButton({ text, onClick, disabled }: { text: string, onClick: () => any, disabled?: boolean; }) {
    if (disabled) {
        return (
            <button
                className={`text-xs hover:cursor-default md:text-base text-gray-700 shadow-inner shadow-gray-600 flex items-center border px-10 md:px-20 lg:px-24 py-4 gap-2 border-gray-700`}
            >
                {text}
            </button>
        );
    }
    return (
        <button
            className={`text-xs md:text-base shadow-inner shadow-gray-100 flex items-center border px-10 md:px-20 lg:px-24 py-4 gap-2 border-white`}
            onClick={onClick}
        >
            {text}
        </button>
    );
}