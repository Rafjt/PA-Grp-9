import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const PieChart = ({ counts }) => {
  const chartRef = useRef();
  const chartInstance = useRef(null);

  useEffect(() => {

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Voyageurs", "Clients bailleurs", "Prestataires"],
        datasets: [
          {
            label: "Nombre d'utilisateurs",
            data: counts,
            backgroundColor: [
              "rgba(255, 99, 132, 0.5)",
              "rgba(54, 162, 235, 0.5)",
              "rgba(255, 206, 86, 0.5)",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [counts]);

  return <canvas ref={chartRef} />;
};

export default PieChart;
