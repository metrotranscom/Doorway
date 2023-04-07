import { MigrationInterface, QueryRunner } from "typeorm"

export class externalListings1680828395000 implements MigrationInterface {
  name = "externalListings1680828395000"

  public async up(queryRunner: QueryRunner): Promise<void> {

    /*
      Search on: 
      Rent - MAX()
      Number of bedrooms - unit_type.num_bedrooms
      County - countyCode; building_address.county
      City [P1] - building_address.city
      Reserved Community type (veteran, senior, etc) - reserved_community_types.name (specialNeeds, senior55, senior62)
      Proximity to geographic location? (ie >5 miles from place of work) - building_address.latitude, building_address.longitude
      Occupancy / Household size [P1+] - household_size_max, household_size_min
      Income range requirement [P1+] - units[].monthlyIncomeMin, 
      Application type (open, wait list, lottery) [P2+]
    */

    // For importing external listings
    await queryRunner.query(
      `CREATE TABLE "external_listings" (
        -- listing fields available in base view
        "id" uuid NOT NULL,
        "assets" jsonb NOT NULL, 
        "household_size_min" integer, -- might be needed for filtering later, but not available if view=base
        "household_size_max" integer, -- might be needed for filtering later, but not available if view=base
        "units_available" integer, 
        "application_due_date" TIMESTAMP WITH TIME ZONE, 
        "application_open_date" TIMESTAMP WITH TIME ZONE, 
        "name" text NOT NULL, 
        "waitlist_current_size" integer, 
        "waitlist_max_size" integer, 
        "status" text NOT NULL DEFAULT 'active', 
        "review_order_type" text, 
        "published_at" TIMESTAMP WITH TIME ZONE, 
        "closed_at" TIMESTAMP WITH TIME ZONE, 

        -- additional fields for filtering/sorting
        "county" text,
        "min_monthly_rent" integer, -- the lowest rent across all units
        "max_monthly_rent" integer, -- the highest rent across all units
        "min_bedrooms" integer, -- the lowest number of bedrooms across all units
        "max_bedrooms" integer, -- the highest number of bedrooms across all units
        "min_bathrooms" integer, -- the lowest number of bathrooms across all units
        "max_bathrooms" integer, -- the highest number of bathrooms across all units
        "min_monthly_income_min" integer, -- the lowest available minimum monthly income for all units
        "max_monthly_income_min" integer, -- the highest available minimum monthly income for all units
        "min_occupancy" integer, -- the lowest occupancy available across all units
        "max_occupancy" integer, -- the highest occupancy available across all units
        "min_sq_feet" numeric(8,2), -- the lowest amount of square footage across all units
        "max_sq_feet" numeric(8,2), -- the highest amount of square footage across all units
        "lowest_floor" integer, -- the lowest floor available across all units
        "highest_floor" integer, -- the highest floor available across all units

        -- derived scalar values from api results
        "url_slug" text,

        -- json objects direct from api results
        "unit_summaries" jsonb, -- might not be needed since it can be generated from units
        "images" jsonb,
        "multiselect_questions" jsonb,
        "jurisdiction" jsonb,
        "reserved_community_type" jsonb,
        "units" jsonb,
        "building_address" jsonb,
        "features" jsonb,
        "utilities" jsonb
      )`
    )

    // Create a queryable view combining local and external listings, flattened for searching
    await queryRunner.query(
      `CREATE VIEW "combined_listings" (
        -- listing fields available in base view
        "id",
        "assets", 
        "household_size_min",
        "household_size_max",
        "units_available", 
        "application_due_date", 
        "application_open_date", 
        "name", 
        "waitlist_current_size", 
        "waitlist_max_size", 
        "status", 
        "review_order_type", 
        "published_at", 
        "closed_at", 
      
        -- additional fields needed for filtering/sorting
        "county",
        "min_monthly_rent", -- the lowest rent across all units
        "max_monthly_rent", -- the highest rent across all units
        "min_bedrooms", -- the lowest number of bedrooms across all units
        "max_bedrooms", -- the highest number of bedrooms across all units
        "min_bathrooms", -- the lowest number of bathrooms across all units
        "max_bathrooms", -- the highest number of bathrooms across all units
        "min_monthly_income_min", -- the lowest available minimum monthly income for all units
        "max_monthly_income_min", -- the highest available minimum monthly income for all units
        "min_occupancy", -- the lowest occupancy available across all units
        "max_occupancy", -- the highest occupancy available across all units
        "min_sq_feet", -- the lowest amount of square footage across all units
        "max_sq_feet", -- the highest amount of square footage across all units
        "lowest_floor", -- the lowest floor available across all units
        "highest_floor", -- the highest floor available across all units
      
        "url_slug", -- only available on external listings
      
        -- json objects direct from api results
        "unit_summaries", -- might not be needed
        "images",
        "multiselect_questions",
        "jurisdiction",
        "reserved_community_type",
        "units",
        "building_address",
        "features",
        "utilities",
        "is_external" -- whether the listing is external or not
      ) AS (
        (
          SELECT
            l.id,
            l.assets,
            l.household_size_min,
            l.household_size_max,
            l.units_available,
            l.application_due_date,
            l.application_open_date,
            l.name,
            l.waitlist_current_size,
            l.waitlist_max_size,
            CAST(l.status AS text),
            CAST(l.review_order_type AS text),
            l.published_at,
            l.closed_at,
          
            -- filter/sort criteria
            addr.county,
            --CAST(units.min_monthly_rent AS integer),
            --CAST(units.max_monthly_rent AS integer),
            units.min_monthly_rent,
            units.max_monthly_rent,
            units.min_bedrooms,
            units.max_bedrooms,
            units.min_bathrooms,
            units.max_bathrooms,
            units.min_monthly_income_min,
            units.max_monthly_income_min,
            units.min_occupancy,
            units.max_occupancy,
            units.min_sq_feet,
            units.max_sq_feet,
            units.lowest_floor,
            units.highest_floor,
          
            null, -- url_slug, intentionally null
            null, -- unit_summaries, intentionally null
            imgs.json AS "images",
            msq.json AS "multiselect_questions",
          
            -- jurisdiction
            jsonb_build_object(
              'id', j.id,
              'name', j.name
            ) AS "jurisdiction",
          
            -- reserved_community_type; may not exist
            CASE
              WHEN feat.id IS NOT NULL THEN 
                jsonb_build_object(
                  'name', rct.name,
                  'id', rct.id
                )
              ELSE NULL
            END AS "reserved_community_type",
          
            -- units
            units.json AS "units",
          
            -- building address
            jsonb_build_object(
              'city', addr.city,
              'state', addr.state,
              'street', addr.street,
              'street2', addr.street2,
              'zipCode', addr.zip_code,
              'latitude', addr.latitude,
              'longitude', addr.longitude
            ) AS "building_address",
          
            -- features; may not exist
            CASE
              WHEN feat.id IS NOT NULL THEN 
                jsonb_build_object(
                  'elevator', feat.elevator,
                  'wheelchairRamp', feat.wheelchair_ramp,
                  'serviceAnimalsAllowed', feat.service_animals_allowed,
                  'accessibleParking', feat.accessible_parking,
                  'parkingOnSite', feat.parking_on_site,
                  'inUnitWasherDryer', feat.in_unit_washer_dryer,
                  'laundryInBuilding', feat.laundry_in_building,
                  'barrierFreeEntrance', feat.barrier_free_entrance,
                  'rollInShower', feat.roll_in_shower,
                  'grabBars', feat.grab_bars,
                  'heatingInUnit', feat.heating_in_unit,
                  'acInUnit', feat.ac_in_unit
                )
              ELSE NULL
            END AS "features",
          
            -- utilities; may not exist
            CASE
              WHEN util.id IS NOT NULL THEN 
                jsonb_build_object(
                  'water', util.water,
                  'gas', util.gas,
                  'trash', util.trash,
                  'sewer', util.sewer,
                  'electricity', util.electricity,
                  'cable', util.cable,
                  'phone', util.phone,
                  'internet', util.internet
                )
              ELSE NULL
            END AS "utilities",
          
            false -- is_external
        
          FROM listings l
        
          -- jurisdiction
          INNER JOIN jurisdictions j
          ON l.jurisdiction_id = j.id
        
          -- features
          LEFT JOIN listing_features feat
          ON l.features_id = feat.id
        
          -- reserved community type
          LEFT JOIN reserved_community_types rct
          ON l.reserved_community_type_id = rct.id
        
          -- utilities
          LEFT JOIN listing_utilities util
          ON l.utilities_id = util.id
        
          -- address
          LEFT JOIN "address" addr
          ON l.building_address_id = addr.id
        
          -- units
          LEFT JOIN (
            SELECT 
              listing_id,
              -- cast to ensure we aren't doing lexicographical sorting
              MIN(CAST(monthly_rent AS integer)) as "min_monthly_rent", 
              MAX(CAST(monthly_rent AS integer)) AS "max_monthly_rent",
              MIN(u.num_bedrooms) AS "min_bedrooms",
              MAX(u.num_bedrooms) AS "max_bedrooms",
              MIN(u.num_bathrooms) AS "min_bathrooms",
              MAX(u.num_bathrooms) AS "max_bathrooms",
              MIN(CAST(monthly_income_min AS integer)) AS "min_monthly_income_min",
              MAX(CAST(monthly_income_min AS integer)) AS "max_monthly_income_min",
              MIN(min_occupancy) AS "min_occupancy",
              MAX(max_occupancy) AS "max_occupancy",
              MIN(sq_feet) AS "min_sq_feet",
              MAX(sq_feet) AS "max_sq_feet",
              MIN(floor) as "lowest_floor",
              MAX(floor) as "highest_floor",
              jsonb_agg(
                jsonb_build_object(
                  'id', u.id,
                  'monthlyIncomeMin', u.monthly_income_min,
                  'floor', u.floor,
                  'maxOccupancy', u.max_occupancy,
                  'minOccupancy', u.min_occupancy,
                  'monthlyRent', u.monthly_rent,
                  'sqFeet', u.sq_feet,
                  'monthlyRentAsPercentOfIncome', u.monthly_rent_as_percent_of_income,
                  'unitType', json_build_object(
                    'id', u.unit_type_id,
                    'name', t.name
                  ),
                  'amiChartOverrides', 
                  CASE
                    WHEN ami.id IS NOT NULL THEN json_build_object(
                      'id', u.ami_chart_override_id,
                      'items', ami.items
                    )
                    ELSE NULL
                  END
                )
              ) as "json"
              FROM units u
              INNER JOIN unit_types t
              ON u.unit_type_id = t.id
              LEFT JOIN unit_ami_chart_overrides ami
              ON u.ami_chart_override_id = ami.id
              GROUP BY u.listing_id
          ) AS units
          ON l.id = units.listing_id
        
          -- multiselect questions
          LEFT JOIN (
            SELECT
              listing_id,
              jsonb_agg(
                jsonb_build_object(
                  'ordinal', ordinal,
                  'multiselectQuestion', json_build_object(
                    'id', msq.id
                  )
                )
              ) AS "json"
            FROM listing_multiselect_questions lmsq
            INNER JOIN multiselect_questions msq
            ON lmsq.multiselect_question_id = msq.id
            GROUP BY listing_id
          ) as msq
          ON l.id = msq.listing_id
        
          -- images
          LEFT JOIN (
            SELECT
              listing_id,
              jsonb_agg(
                jsonb_build_object(
                  'ordinal', ordinal,
                  'image', json_build_object(
                    'fileId', assets.file_id,
                    'label', assets.label,
                    'id', assets.id
                  )
                )
              ) AS "json"
            FROM listing_images img
            INNER JOIN assets
            ON img.image_id = assets.id
            GROUP BY listing_id
          ) as imgs
          ON l.id = imgs.listing_id
        ) UNION (
          SELECT 
            "id",
            "assets", 
            "household_size_min",
            "household_size_max",
            "units_available", 
            "application_due_date", 
            "application_open_date", 
            "name", 
            "waitlist_current_size", 
            "waitlist_max_size", 
            "status", 
            "review_order_type", 
            "published_at", 
            "closed_at", 
      
            "county",
            "min_monthly_rent",
            "max_monthly_rent",
            "min_bedrooms",
            "max_bedrooms",
            "min_bathrooms",
            "max_bathrooms",
            "min_monthly_income_min",
            "max_monthly_income_min",
            "min_occupancy",
            "max_occupancy",
            "min_sq_feet",
            "max_sq_feet",
            "lowest_floor",
            "highest_floor",
      
            "url_slug",
      
            "unit_summaries",
            "images",
            "multiselect_questions",
            "jurisdiction",
            "reserved_community_type",
            "units",
            "building_address",
            "features",
            "utilities",
            true
          FROM "external_listings"
        )
      )`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "external_listings"`)
    await queryRunner.query(`DROP VIEW "combined_listings"`)
  }
}
