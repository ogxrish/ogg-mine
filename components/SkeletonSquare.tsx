import ContentLoader from "react-content-loader";



export default function SkeletonSquare() {
    return (
        <ContentLoader
            speed={1}
            width="240"
            height="240"
            viewBox="0 0 240 240"
            backgroundColor="#333"
            foregroundColor="#999"
        >
            <rect x="0" y="0" rx="20" ry="20" width="240" height="240" />
        </ContentLoader>
    );
}