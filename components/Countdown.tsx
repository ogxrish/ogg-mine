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
    const [negative, setNegative] = useState<boolean>(false);
    useEffect(() => {
        let interval: any;
        if (timeLeft < 0) {
            setSeconds(Math.abs(timeLeft));
            setNegative(true);
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        } else {
            setSeconds(timeLeft);
            interval = setInterval(() => {
                setSeconds(prev => {
                    if (prev <= 0) {
                        clearInterval(interval);
                        return 0;
                    } else {
                        return prev - 1;
                    }
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timeLeft]);
    if (negative) {
        return (
            <p className="text-2xl md:text-4xl font-extrabold text-center text-red-500">
                {`-${formatSecondsToDHMS(seconds)}`}
            </p>
        );
    } else {
        return (
            <p className="text-2xl md:text-4xl font-extrabold text-center">
                {`${formatSecondsToDHMS(seconds)}`}
            </p>
        );
    }
}