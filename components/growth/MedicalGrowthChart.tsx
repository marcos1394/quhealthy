import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { GrowthMeasurementResponse, WhoGrowthStandard } from "@/types/growth";

interface MedicalGrowthChartProps {
  measurements: GrowthMeasurementResponse[];
  standards: WhoGrowthStandard[];
  sex: "MALE" | "FEMALE";
  indicator: "WEIGHT_FOR_AGE" | "LENGTH_FOR_AGE" | "HEAD_CIRCUMFERENCE_FOR_AGE";
}

export default function MedicalGrowthChart({
  measurements,
  standards,
  sex,
  indicator,
}: MedicalGrowthChartProps) {
  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);

  const standardData = useMemo(() => {
    const std = standards.find(
      (s) => s.indicator === indicator && s.sex === sex,
    );
    if (!std || !std.lmsData) return [];

    // Create base data from standards
    const mergedData = std.lmsData.map((data: any) => ({
      month: data.month,
      P3: data.percentiles?.P3 || null,
      P50: data.percentiles?.P50 || null,
      P97: data.percentiles?.P97 || null,
      Paciente: null as number | null,
    }));

    // Inject measurements at their exact age in months
    measurements.forEach((m) => {
      const patientValue =
        indicator === "WEIGHT_FOR_AGE"
          ? m.weightKg
          : indicator === "LENGTH_FOR_AGE"
            ? m.heightCm
            : m.headCircumferenceCm;

      if (patientValue == null) return;

      const exactMonth = m.ageInMonths;
      const existingPoint = mergedData.find(
        (d) => Math.abs(d.month - exactMonth) < 0.01,
      );

      if (existingPoint) {
        existingPoint.Paciente = patientValue;
      } else {
        mergedData.push({
          month: exactMonth,
          P3: null,
          P50: null,
          P97: null,
          Paciente: patientValue,
        });
      }
    });

    // Sort by month ascending
    mergedData.sort((a, b) => a.month - b.month);
    return mergedData;
  }, [standards, measurements, sex, indicator]);

  const yAxisLabel =
    indicator === "WEIGHT_FOR_AGE"
      ? "Peso (kg)"
      : indicator === "LENGTH_FOR_AGE"
        ? "Talla (cm)"
        : "Perímetro (cm)";

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Curva OMS (
        {indicator === "WEIGHT_FOR_AGE"
          ? "Peso"
          : indicator === "LENGTH_FOR_AGE"
            ? "Talla"
            : "Perímetro Cefálico"}
        )
      </h3>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={standardData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              type="number"
              dataKey="month"
              domain={["dataMin", "dataMax"]}
              label={{
                value: "Edad (meses)",
                position: "insideBottomRight",
                offset: -10,
              }}
            />
            <YAxis
              label={{ value: yAxisLabel, angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend verticalAlign="top" height={36} />

            {/* OMS Curves */}
            <Line
              type="monotone"
              dataKey="P97"
              stroke="#ef4444"
              strokeWidth={1}
              dot={false}
              name="Percentil 97"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="P50"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="Percentil 50 (Mediana)"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="P3"
              stroke="#ef4444"
              strokeWidth={1}
              dot={false}
              name="Percentil 3"
              connectNulls
            />

            {/* Patient Curve */}
            <Line
              type="monotone"
              dataKey="Paciente"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ stroke: "#3b82f6", strokeWidth: 2, r: 4, fill: "#fff" }}
              activeDot={{ r: 6 }}
              name="Paciente"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Table for precise data */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Edad (Meses)</th>
              <th className="px-4 py-3">Medición</th>
              <th className="px-4 py-3">Z-Score</th>
              <th className="px-4 py-3">Estado Clínico</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m) => (
              <tr key={m.id} className="border-b dark:border-gray-700">
                <td className="px-4 py-3 font-medium">{m.ageInMonths}</td>
                <td className="px-4 py-3">
                  {indicator === "WEIGHT_FOR_AGE"
                    ? `${m.weightKg} kg`
                    : indicator === "LENGTH_FOR_AGE"
                      ? `${m.heightCm} cm`
                      : `${m.headCircumferenceCm} cm`}
                </td>
                <td className="px-4 py-3">
                  {indicator === "WEIGHT_FOR_AGE"
                    ? m.weightZScore
                    : indicator === "LENGTH_FOR_AGE"
                      ? m.heightZScore
                      : m.headCircumferenceZScore}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      m.clinicalStatus === "NORMAL"
                        ? "bg-green-100 text-green-700"
                        : m.clinicalStatus === "VIGILANCIA"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {m.clinicalStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
