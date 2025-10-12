import { FC } from "react";

interface MetricCardProps {
  title: string;
  value: number;
  color: string;
}

const MetricCard: FC<MetricCardProps> = ({ title, value, color }) => {
  return (
    <div  className={`${color} backdrop-blur-md rounded-lg p-6 text-center transform transition-all hover:scale-105 hover:shadow-lg`}>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-3xl font-bold">{value?.toLocaleString() || 0}</p>
    </div>
  );
};

export default MetricCard;
