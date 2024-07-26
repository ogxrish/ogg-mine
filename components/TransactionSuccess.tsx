

export default function TransactionSuccess() {
    return (
        <div className="flex flex-row justify-center items-center gap-4 border-yellow-500 text-yellow-500 border-2 rounded-lg px-6 py-8 bg-black">
            <CheckIcon />
            <p>Transaction Confirmed</p>
        </div>
    );
}



const CheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

