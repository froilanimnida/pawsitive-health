/**
 * Interface for health monitoring records
 */
export interface HealthMonitoring {
    monitoring_id: number;
    monitoring_uuid: string;
    pet_id: number | null;
    activity_level: string;
    weight_kg: string;
    temperature_celsius: string;
    symptoms: string;
    notes: string | null;
    recorded_at: Date;
}
