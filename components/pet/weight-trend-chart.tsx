"use client";

import { useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui";
import { CartesianGrid, XAxis, YAxis, ReferenceLine, Area, AreaChart } from "recharts";
import { format } from "date-fns";
import { Weight } from "lucide-react";
import { HealthMonitoring } from "@/types";

interface WeightTrendChartProps {
    healthRecords: HealthMonitoring[];
    petName: string;
    className?: string;
    idealWeightMin?: number;
    idealWeightMax?: number;
}

export function WeightTrendChart({
    healthRecords,
    petName,
    className,
    idealWeightMin,
    idealWeightMax,
}: WeightTrendChartProps) {
    // Chart configuration
    const chartConfig: ChartConfig = {
        weight: {
            label: "Weight (kg)",
            color: "var(--chart-2)",
            icon: Weight,
        },
        idealRange: {
            label: "Ideal Weight Range",
            color: "var(--chart-3)",
        },
    };

    // Transform health records for the chart
    const chartData = useMemo(() => {
        if (!healthRecords?.length) return [];

        return healthRecords
            .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
            .map((record) => ({
                date: record.recorded_at.toISOString(),
                formattedDate: format(new Date(record.recorded_at), "MMM d, yyyy"),
                weight: parseFloat(record.weight_kg),
                formattedWeight: `${record.weight_kg} kg`,
            }));
    }, [healthRecords]);

    // Calculate weight statistics
    const weightStats = useMemo(() => {
        if (!chartData.length) return { min: 0, max: 0, avg: 0, current: 0, change: 0 };

        const weights = chartData.map((d) => d.weight);
        const min = Math.min(...weights);
        const max = Math.max(...weights);
        const avg = weights.reduce((sum, w) => sum + w, 0) / weights.length;
        const current = weights[weights.length - 1];
        const first = weights[0];
        const change = current - first;
        const changePercent = ((change / first) * 100).toFixed(1);

        return {
            min,
            max,
            avg: parseFloat(avg.toFixed(2)),
            current,
            change: parseFloat(change.toFixed(2)),
            changePercent: changePercent === "0.0" ? "0" : changePercent,
        };
    }, [chartData]);

    // If no records, display a message
    if (!chartData.length) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Weight Trend</CardTitle>
                    <CardDescription>No weight records available yet for {petName}</CardDescription>
                </CardHeader>
                <CardContent className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Start recording weight to track changes over time
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Weight Trend for {petName}</CardTitle>
                <CardDescription>
                    Current: {weightStats.current} kg
                    {weightStats.change !== 0 && (
                        <span className={weightStats.change > 0 ? "text-red-500 ml-2" : "text-green-500 ml-2"}>
                            {weightStats.change > 0 ? "+" : ""}
                            {weightStats.change} kg ({weightStats.changePercent}%)
                        </span>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Minimum</p>
                        <p className="text-lg font-medium">{weightStats.min} kg</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Average</p>
                        <p className="text-lg font-medium">{weightStats.avg} kg</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Maximum</p>
                        <p className="text-lg font-medium">{weightStats.max} kg</p>
                    </div>
                </div>

                <ChartContainer config={chartConfig} className="min-h-[200px]">
                    <AreaChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="formattedDate"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tickFormatter={(value) => format(new Date(value), "MMM d")}
                        />
                        <YAxis
                            domain={[
                                (dataMin: number) => Math.max(0, dataMin * 0.9),
                                (dataMax: number) => dataMax * 1.1,
                            ]}
                        />

                        {idealWeightMin && (
                            <ReferenceLine
                                y={idealWeightMin}
                                stroke={chartConfig.idealRange.color}
                                strokeDasharray="3 3"
                                label={{ value: "Min Ideal", position: "insideBottomLeft" }}
                            />
                        )}

                        {idealWeightMax && (
                            <ReferenceLine
                                y={idealWeightMax}
                                stroke={chartConfig.idealRange.color}
                                strokeDasharray="3 3"
                                label={{ value: "Max Ideal", position: "insideTopLeft" }}
                            />
                        )}

                        <Area
                            type="monotone"
                            dataKey="weight"
                            name="Weight"
                            stroke={chartConfig.weight.color}
                            fill={chartConfig.weight.color}
                            fillOpacity={0.3}
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />

                        <ChartTooltip content={<ChartTooltipContent />} />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
