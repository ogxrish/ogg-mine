


export default function TransactionPending() {
  return (
    <div className="flex flex-row justify-center items-center gap-4 border-yellow-500 text-yellow-500 border-2 rounded-lg px-6 py-8 bg-black">
      <SpinningLoader />
      <p>Sending Transaction...</p>
    </div>
  );
}

const SpinningLoader = () => (
  <>
    <svg width="24" height="24" viewBox="0 0 50 50" className="spin">
      <circle cx="25" cy="25" r="20" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="90,150" />
    </svg>
    <style jsx>{`
      .spin {
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </>
);
