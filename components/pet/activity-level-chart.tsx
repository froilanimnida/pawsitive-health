"use client";

import { useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    ChartContainer,
    type ChartConfig,
} from "@/components/ui";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { format } from "date-fns";
import { Activity } from "lucide-react";
import { HealthMonitoring } from "@/types";
import { toTitleCase } from "@/lib";

// Activity level colors map
const activityLevelColorMap = {
    very_low: "var(--chart-5)", // red
    low: "var(--chart-4)", // orange/amber
    normal: "var(--chart-3)", // green
    high: "var(--chart-2)", // blue
    very_high: "var(--chart-1)", // purple
};

interface ActivityChartData {
    date: string;
    formattedDate: string;
    activityLevel: string;
    formattedActivityLevel: string;
    value: number;
}

interface ActivityLevelChartProps {
    healthRecords: HealthMonitoring[];
    petName: string;
    className?: string;
}

export function ActivityLevelChart({ healthRecords, petName, className }: ActivityLevelChartProps) {
    // Chart configuration
    const chartConfig: ChartConfig = {
        activityLevel: {
            label: "Activity Level",
            color: "var(--chart-1)",
            icon: Activity,
        },
    };

    // Transform health records for the chart
    const chartData = useMemo(() => {
        if (!healthRecords?.length) return [];

        return healthRecords
            .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
            .map((record) => ({
                date: record.recorded_at.toISOString(),
                formattedDate: format(new Date(record.recorded_at), "MMM d"),
                activityLevel: record.activity_level,
                formattedActivityLevel: toTitleCase(record.activity_level.replace(/_/g, " ")),
                value: 1, // Constant value for bar height
                color:
                    activityLevelColorMap[record.activity_level as keyof typeof activityLevelColorMap] ||
                    "var(--chart-3)",
            }));
    }, [healthRecords]);

    // Customize tooltip content
    const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ActivityChartData }[] }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-md p-2 shadow-sm">
                    <p className="font-medium">{payload[0].payload.formattedDate}</p>
                    <p className="text-sm">
                        Activity: <span className="font-medium">{payload[0].payload.formattedActivityLevel}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // If no records, display a message
    if (!chartData.length) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Activity Levels</CardTitle>
                    <CardDescription>No activity records available yet for {petName}</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Start recording activity levels to see patterns over time
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Activity Levels for {petName}</CardTitle>
                <CardDescription>Tracking activity levels over time</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px]">
                    <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="formattedDate" tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis hide />

                        <Bar
                            dataKey="value"
                            name="Activity Level"
                            fill="var(--chart-1)"
                            radius={[4, 4, 0, 0]}
                            fillOpacity={1}
                            isAnimationActive={true}
                            animationDuration={500}
                            barSize={30}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>

                        <Tooltip content={<CustomTooltip />} />
                    </BarChart>
                </ChartContainer>

                <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {Object.entries(activityLevelColorMap).map(([level, color]) => (
                        <div key={level} className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-xs">{toTitleCase(level.replace(/_/g, " "))}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
