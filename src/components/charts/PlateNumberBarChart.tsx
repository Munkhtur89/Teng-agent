"use client";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Insurance } from "@/types/insurance";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function getPlateNumberStats(insurances: Insurance[]) {
  const plateMap: Record<string, number> = {};
  insurances.forEach((i) => {
    if (i.contracts && Array.isArray(i.contracts)) {
      i.contracts.forEach((c) => {
        if (typeof c.plate_number === "string" && c.plate_number) {
          plateMap[c.plate_number] = (plateMap[c.plate_number] || 0) + 1;
        }
      });
    }
  });
  // Хамгийн олон давтагдсан 10 улсын дугаарыг харуулна
  const sorted = Object.entries(plateMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  return {
    labels: sorted.map(([plate]) => plate),
    counts: sorted.map(([, count]) => count),
  };
}

export default function PlateNumberBarChart({
  insurances,
}: {
  insurances: Insurance[];
}) {
  const { labels, counts } = getPlateNumberStats(insurances);
  return (
    <div className="w-full max-w-2xl bg-white  p-6">
      <div className="font-semibold text-gray-700 mb-2">
        Улсын дугаарын давтамж
      </div>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: "Гэрээний тоо",
              data: counts,
              backgroundColor: "#000080",
              borderRadius: 8,
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
