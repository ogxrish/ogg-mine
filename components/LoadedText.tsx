import ContentLoader from "react-content-loader";


export default function LoadedText({ start, text, value }: { start: string, text?: string, value: any | undefined; }) {
    if (value !== undefined) {
        const replaced = text?.replace("&%%&", String(value)) || String(value);
        return (
            <div className="flex flex-row justify-start items-center gap-2 text-xl">
                <p className="underline font-bold">{start}</p>
                <p>:</p>
                <p>{`${replaced}`}</p>
            </div>
        );
    } else {
        return (
            <div className="flex flex-row justify-start items-center gap-2 text-xl">
                <p className="underline font-bold">{start}</p>
                <p>:</p>
                <ContentLoader
                    speed={1}
                    width="160"
                    height="30"
                    viewBox="0 0 160 30"
                    backgroundColor="#333"
                    foregroundColor="#999"
                >
                    <rect x="0" y="0" rx="5" ry="5" width="100%" height="100%" />
                </ContentLoader>
            </div>
        );
    }
}