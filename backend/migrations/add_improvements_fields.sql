-- =============================================================================
-- Database Migration: Add Improvements Fields
-- Date: September 23, 2026
-- Purpose: Add non-breaking fields for test case improvements TC-12, TC-33, 
--          TC-35, TC-37, TC-46
-- =============================================================================

BEGIN;

-- 1. Add subscription_tier to profiles table (TC-46)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) 
DEFAULT 'Starter' NOT NULL;

COMMENT ON COLUMN profiles.subscription_tier IS 'User subscription tier: Starter, Growth, or Enterprise';

-- 2. Add scheduling fields to campaigns table (TC-35, TC-37)
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) 
DEFAULT 'UTC' NOT NULL;

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS business_hours_start VARCHAR(10) 
DEFAULT '09:00' NOT NULL;

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS business_hours_end VARCHAR(10) 
DEFAULT '18:00' NOT NULL;

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS repeat_enabled VARCHAR(10) 
DEFAULT 'false' NOT NULL;

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS repeat_schedule VARCHAR(50);

COMMENT ON COLUMN campaigns.timezone IS 'IANA timezone identifier (e.g., Asia/Kolkata, America/New_York)';
COMMENT ON COLUMN campaigns.business_hours_start IS 'Campaign calling start time in HH:MM format (local to timezone)';
COMMENT ON COLUMN campaigns.business_hours_end IS 'Campaign calling end time in HH:MM format (local to timezone)';
COMMENT ON COLUMN campaigns.repeat_enabled IS 'Enable campaign repeat: true or false';
COMMENT ON COLUMN campaigns.repeat_schedule IS 'Repeat frequency: daily, weekly, monthly, or null';

-- 3. Add preferred_language to leads table (TC-33)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) 
DEFAULT 'en' NOT NULL;

COMMENT ON COLUMN leads.preferred_language IS 'ISO 639-1 language code: en, hi, gu, mr (auto-selected from location)';

-- 4. Create indexes for new filter columns
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_campaigns_timezone ON campaigns(timezone);
CREATE INDEX IF NOT EXISTS idx_campaigns_repeat_enabled ON campaigns(repeat_enabled);
CREATE INDEX IF NOT EXISTS idx_leads_preferred_language ON leads(preferred_language);

-- 5. Verify migrations
DO $$
DECLARE
    profile_col_exists BOOLEAN;
    campaign_tz_exists BOOLEAN;
    campaign_hours_start_exists BOOLEAN;
    campaign_hours_end_exists BOOLEAN;
    campaign_repeat_enabled_exists BOOLEAN;
    campaign_repeat_schedule_exists BOOLEAN;
    lead_lang_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
    ) INTO profile_col_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'timezone'
    ) INTO campaign_tz_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'business_hours_start'
    ) INTO campaign_hours_start_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'business_hours_end'
    ) INTO campaign_hours_end_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'repeat_enabled'
    ) INTO campaign_repeat_enabled_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaigns' AND column_name = 'repeat_schedule'
    ) INTO campaign_repeat_schedule_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leads' AND column_name = 'preferred_language'
    ) INTO lead_lang_exists;
    
    RAISE NOTICE '=== Migration Verification ===';
    RAISE NOTICE 'profiles.subscription_tier: %', CASE WHEN profile_col_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE 'campaigns.timezone: %', CASE WHEN campaign_tz_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE 'campaigns.business_hours_start: %', CASE WHEN campaign_hours_start_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE 'campaigns.business_hours_end: %', CASE WHEN campaign_hours_end_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE 'campaigns.repeat_enabled: %', CASE WHEN campaign_repeat_enabled_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE 'campaigns.repeat_schedule: %', CASE WHEN campaign_repeat_schedule_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    RAISE NOTICE 'leads.preferred_language: %', CASE WHEN lead_lang_exists THEN '✓ EXISTS' ELSE '✗ MISSING' END;
    
    IF NOT (profile_col_exists AND campaign_tz_exists AND campaign_hours_start_exists AND 
            campaign_hours_end_exists AND campaign_repeat_enabled_exists AND lead_lang_exists) THEN
        RAISE EXCEPTION 'Migration verification failed - some columns are missing';
    END IF;
    
    RAISE NOTICE '=== All migrations applied successfully ===';
END $$;

COMMIT;

-- Display summary
SELECT 
    'Migration Complete' as status,
    current_timestamp as completed_at,
    current_database() as database_name;
