export default function GradientBorder({ children }: { children: React.ReactNode; }) {
    return (
        <div className="bg-shiny-gradient-1 rounded-lg p-[3px] w-full md:w-[80%] lg:w-[60%] h-full">
            <div className="bg-black rounded-lg h-full w-full py-4 px-8">
                {children}
            </div>
        </div>
    );
}