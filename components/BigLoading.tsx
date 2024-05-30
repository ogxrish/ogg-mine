import ContentLoader from "react-content-loader";



export default function BigLoading({ amount }: { amount: number | undefined; }) {
    if (amount !== undefined) {
        return (
            <div className="flex flex-row justify-center items-end gap-2">
                <p className="text-8xl font-bold">{amount}</p>
                <p className="underline">$SPORE</p>
            </div>
        );
    } else {
        return (
            <div className="flex flex-row justify-center items-end gap-2 py-2">
                <ContentLoader
                    speed={1}
                    width="240"
                    height="140"
                    viewBox="0 0 240 140"
                    backgroundColor="#333"
                    foregroundColor="#999"
                >
                    <rect x="0" y="0" rx="20" ry="20" width="100%" height="100%" />
                </ContentLoader>
                <p className="underline">$SPORE</p>
            </div>
        );
    }
}