

export default function TransactionFailure() {
    return (
        <div className="flex flex-row items-center justify-center gap-4 border-white border-2 rounded-lg px-6 py-8">
            <XIcon />
            <p>Transaction Failed</p>
        </div>
    );
}

const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);