export default function BasicButton({ text, onClick, active }: { text: string, onClick: () => any, active?: boolean; }) {
    return (
        <button
            className={`text-xs md:text-base shadow-inner shadow-gray-100 flex items-center border px-6 py-4 gap-2 border-white`}
            onClick={onClick}
        >
            {text}
        </button>
    );
}