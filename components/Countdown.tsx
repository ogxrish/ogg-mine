import { useEffect, useState } from "react";

const pad = (num: number) => String(num).padStart(2, '0');
function formatSecondsToDHMS(seconds: number) {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${pad(days)}d:${pad(hours)}h:${pad(minutes)}m:${pad(Math.floor(seconds))}s`;
}
export default function Countdown({ timeLeft }: { timeLeft: number; }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        setSeconds(timeLeft);
        const interval = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 0) {
                    clearInterval(interval);
                    return 0;
                } else {
                    return prev - 1;
                }
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft]);

    return (
        <p className="text-2xl md:text-4xl font-extrabold text-center">
            {`${formatSecondsToDHMS(seconds)} left`}
        </p>
    );
}