import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const PieChart = ({ counts }) => {
  const chartRef = useRef();
  const chartInstance = useRef(null);

  useEffect(() => {
    // Destroy the previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create a new chart instance
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

    // Clean up: Destroy the chart instance when the component unmounts or when the counts array changes
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [counts]);

  return <canvas ref={chartRef} />;
};

export default PieChart;
