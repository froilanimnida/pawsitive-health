export interface PrescriptionData {
    prescription_id: number;
    dosage: string;
    frequency: string;
    start_date: Date | null;
    end_date: Date | null;
    refills_remaining: number | null;
    medications: {
        name: string;
        description: string;
    } | null;
    veterinarians?: {
        users: {
            first_name: string;
            last_name: string;
        } | null;
    } | null;
}
