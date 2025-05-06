"use client";

import { useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { Activity, Weight, Thermometer } from "lucide-react";
import { HealthMonitoring } from "@/types";

// Define activity level mapping for numerical representation
const activityLevelMap = {
    very_low: 1,
    low: 2,
    normal: 3,
    high: 4,
    very_high: 5,
};

type ActivityLevel = keyof typeof activityLevelMap;

interface PetHealthMetricsChartProps {
    healthRecords: HealthMonitoring[];
    petName: string;
}

export function PetHealthMetricsChart({ healthRecords, petName }: PetHealthMetricsChartProps) {
    // Chart configuration
    const chartConfig: ChartConfig = {
        activityLevel: {
            label: "Activity Level",
            color: "var(--chart-1)",
            icon: Activity,
        },
        weight: {
            label: "Weight (kg)",
            color: "var(--chart-2)",
            icon: Weight,
        },
        temperature: {
            label: "Temperature (°C)",
            color: "var(--chart-3)",
            icon: Thermometer,
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
                activityLevel: activityLevelMap[record.activity_level as ActivityLevel],
                weight: parseFloat(record.weight_kg),
                temperature: parseFloat(record.temperature_celsius),
            }));
    }, [healthRecords]);

    // If no records, display a message
    if (!chartData.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Health Metrics</CardTitle>
                    <CardDescription>No health monitoring records available yet for {petName}</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                    Start recording health metrics to see trends over time
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Health Metrics for {petName}</CardTitle>
                <CardDescription>Tracking activity level, weight, and temperature over time</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[300px]">
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="formattedDate" tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis yAxisId="left" orientation="left" stroke={chartConfig.weight.color} />
                        <YAxis yAxisId="right" orientation="right" stroke={chartConfig.temperature.color} />
                        <YAxis yAxisId="activity" orientation="right" stroke={chartConfig.activityLevel.color} hide />

                        <Line
                            yAxisId="activity"
                            type="monotone"
                            dataKey="activityLevel"
                            name="Activity Level"
                            stroke={chartConfig.activityLevel.color}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="weight"
                            name="Weight (kg)"
                            stroke={chartConfig.weight.color}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="temperature"
                            name="Temperature (°C)"
                            stroke={chartConfig.temperature.color}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />

                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
