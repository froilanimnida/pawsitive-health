-- Create prescription schedule type enum
CREATE TYPE "prescription_schedule_type" AS ENUM (
  'once_daily',
  'twice_daily',
  'three_times_daily',
  'four_times_daily',
  'every_other_day',
  'weekly',
  'as_needed',
  'custom'
);

-- Add medication scheduling fields to prescriptions table
ALTER TABLE "prescriptions"
DROP COLUMN IF EXISTS "schedule_type";

ALTER TABLE "prescriptions"
ADD COLUMN "schedule_type" "prescription_schedule_type";

ALTER TABLE "prescriptions"
ADD COLUMN "calendar_event_ids" JSONB;

ALTER TABLE "prescriptions"
ADD COLUMN "reminder_minutes_before" INTEGER DEFAULT 15;

ALTER TABLE "prescriptions"
ADD COLUMN "last_calendar_sync" TIMESTAMPTZ;

ALTER TABLE "prescriptions"
ADD COLUMN "calendar_sync_enabled" BOOLEAN DEFAULT false;

ALTER TABLE "prescriptions"
ADD COLUMN "custom_instructions" TEXT;

-- Create the normalized time slots table
CREATE TABLE
  "prescription_time_slots" (
    "slot_id" SERIAL PRIMARY KEY,
    "prescription_id" INTEGER NOT NULL,
    "hour" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    FOREIGN KEY ("prescription_id") REFERENCES "prescriptions" ("prescription_id") ON DELETE CASCADE
  );

-- Create indexes for improved performance
CREATE INDEX "prescription_time_slots_prescription_id_idx" ON "prescription_time_slots" ("prescription_id");

CREATE INDEX "prescriptions_calendar_sync_enabled_idx" ON "prescriptions" ("calendar_sync_enabled")
WHERE
  calendar_sync_enabled=true;

-- Comment the new columns and tables
COMMENT ON COLUMN "prescriptions"."schedule_type" IS 'Type of medication schedule (once_daily, twice_daily, etc.)';

COMMENT ON COLUMN "prescriptions"."calendar_event_ids" IS 'IDs of Google Calendar events created for this prescription';

COMMENT ON COLUMN "prescriptions"."reminder_minutes_before" IS 'Minutes before the event when a reminder should be sent';

COMMENT ON COLUMN "prescriptions"."last_calendar_sync" IS 'Timestamp of the last successful calendar synchronization';

COMMENT ON COLUMN "prescriptions"."calendar_sync_enabled" IS 'Whether this prescription should be synced to the calendar';

COMMENT ON COLUMN "prescriptions"."custom_instructions" IS 'Additional custom instructions for medication administration';

COMMENT ON TABLE "prescription_time_slots" IS 'Normalized storage of medication administration time slots';

COMMENT ON COLUMN "prescription_time_slots"."slot_id" IS 'Unique identifier for the time slot';

COMMENT ON COLUMN "prescription_time_slots"."prescription_id" IS 'Reference to the associated prescription';

COMMENT ON COLUMN "prescription_time_slots"."hour" IS 'Hour component of the time (0-23)';

COMMENT ON COLUMN "prescription_time_slots"."minute" IS 'Minute component of the time (0-59)';

COMMENT ON COLUMN "prescription_time_slots"."enabled" IS 'Whether this time slot is active';