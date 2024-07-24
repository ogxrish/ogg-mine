

export default function Window({ children }: { children: React.ReactNode; }) {
    return (
        <div className="border-2 border-white rounded-lg py-4 px-8 bg-transparent w-full md:w-[80%] lg:w-[60%] h-full">
            {children}
        </div>
    );
}