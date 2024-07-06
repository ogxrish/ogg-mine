

export default function Window({ children }: { children: React.ReactNode; }) {
    return (
        <div className="border-2 border-white rounded-lg py-4 px-8 bg-transparent w-full h-full">
            {children}
        </div>
    );
}