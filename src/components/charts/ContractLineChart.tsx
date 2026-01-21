"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Insurance } from "@/types/insurance";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function getLast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
    );
  }
  return months;
}
function getMonthlyContractCounts(insurances: Insurance[]) {
  const months = getLast6Months();
  return months.map(
    (m) =>
      insurances.filter((i) => i.startDate && i.startDate.startsWith(m)).length
  );
}

export default function ContractLineChart({
  insurances,
}: {
  insurances: Insurance[];
}) {
  return (
    <div className="w-full max-w-2xl bg-white  p-6 ">
      <div className="font-semibold text-gray-700 mb-2">
        Сүүлийн 6 сарын гэрээний тоо
      </div>
      <Line
        data={{
          labels: getLast6Months(),
          datasets: [
            {
              label: "Гэрээний тоо",
              data: getMonthlyContractCounts(insurances),
              borderColor: "#000080",
              backgroundColor: "rgba(0, 4, 255, 0.1)",
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: "#6366f1",
            },
          ],
        }}
        options={{
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        }}
        height={180}
      />
    </div>
  );
}
