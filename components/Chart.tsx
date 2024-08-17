import { CartesianGrid, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Line } from "recharts";



export default function Chart({ data }: { data: any; }) {
    console.log(data);
    return (
        <ResponsiveContainer width={"100%"} height={300}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis yAxisId="right" orientation="right" />
                <YAxis yAxisId="left" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="purchasedOgg" yAxisId="right" stroke="#8884d8" />
                <Line type="monotone" dataKey="reward" yAxisId="right" stroke="#82ca9d" />
                <Line type="monotone" dataKey="totalMiners" yAxisId="left" stroke="#ffc658" />
                <Line type="monotone" dataKey="unclaimedOgg" yAxisId="right" stroke="#ff0000" />
            </LineChart>
        </ResponsiveContainer>
    );
}