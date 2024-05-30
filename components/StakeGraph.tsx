
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, LinearScale, PointElement, CategoryScale } from 'chart.js';


ChartJS.register(LineElement, LinearScale, PointElement, CategoryScale);
const MAX_REWARD = 1000;
const SUPPLY = 6000;
const eq = (x: number) => MAX_REWARD - (x / SUPPLY * MAX_REWARD);
const generateData = () => {
    const data = [];
    for (let x = 0; x < 6000; x += 2) {
        data.push({ x, y: eq(x) });
    }
    return data;
};
export default function StakeGraph({ pos }: { pos: number; }) {
    const data = {
        datasets: [
            {
                label: 'y = x^2',
                data: generateData(),
                fill: false,
                borderColor: 'white',
                borderWidth: 1,
                pointRadius: 0,
            },
            {
                label: 'Point',
                data: [{ x: pos, y: eq(pos) }],
                backgroundColor: 'white',
                pointRadius: 5,
            },
        ],
    };
    const options = {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                grid: {
                    color: 'black',
                },
                ticks: {
                    color: 'white',
                },
                title: {
                    display: true,
                    text: "NFTs Staked",
                    color: "white"
                }
            },
            y: {
                type: 'linear',
                grid: {
                    color: 'black',
                },
                ticks: {
                    color: 'white',
                },
                title: {
                    display: true,
                    text: "Reward",
                    color: "white"
                }
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    };
    // @ts-ignore
    return <Line data={data} options={options} />;
}