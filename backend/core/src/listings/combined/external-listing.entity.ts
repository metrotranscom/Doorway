import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryColumn
} from "typeorm"
import { Expose, Type } from "class-transformer"
import { Jurisdiction } from "../../jurisdictions/entities/jurisdiction.entity"
import { ReservedCommunityType } from "../../reserved-community-type/entities/reserved-community-type.entity"
import { AssetCreateDto } from "../../assets/dto/asset.dto"
import { Address } from "../../shared/entities/address.entity"
import { UnitsSummarized } from "../../units/types/units-summarized"
import { ListingFeatures } from "../entities/listing-features.entity"
import { ListingImage } from "../entities/listing-image.entity"
import { ListingUtilities } from "../entities/listing-utilities.entity"
import { Unit } from "../../units/entities/unit.entity"
import { ListingMultiselectQuestion } from "../../multiselect-question/entities/listing-multiselect-question.entity"

/**
 * This entity is only used to generate the external_listings table. No queries
 * are ever run against it directly.
 * 
 * REMOVE_WHEN_EXTERNAL_NOT_NEEDED
 */
@Entity({ name: "external_listings" })
class ExternalListing extends BaseEntity {

  // BEGIN LISTING FIELDS

  @PrimaryColumn("uuid")
  @Expose()
  id: string

  @Column("jsonb")
  @Expose()
  @Type(() => AssetCreateDto)
  assets: AssetCreateDto[]

  @Column({ type: "integer", name: "household_size_min", nullable: true })
  @Expose()
  householdSizeMin?: number | null

  @Column({ type: "integer", name: "household_size_max", nullable: true })
  @Expose()
  householdSizeMax?: number | null

  @Column({ type: "integer", name: "units_available", nullable: true })
  @Index()
  @Expose()
  unitsAvailable?: number | null

  @Column({ type: "timestamptz", name: "application_due_date", nullable: true })
  @Index()
  @Expose()
  @Type(() => Date)
  applicationDueDate?: Date | null

  @Column({ type: "timestamptz", name: "application_open_date", nullable: true })
  @Expose()
  @Type(() => Date)
  applicationOpenDate?: Date | null

  @Column({ type: "text" })
  @Index()
  @Expose()
  name: string

  @Column({ type: "integer", name: "waitlist_current_size", nullable: true })
  @Expose()
  waitlistCurrentSize?: number | null

  @Column({ type: "integer", name: "waitlist_max_size", nullable: true })
  @Expose()
  waitlistMaxSize?: number | null

  @Column({ type: "boolean", name: "is_waitlist_open", nullable: true })
  @Index()
  @Expose()
  isWaitlistOpen?: boolean | null

  @Column({ type: "text" })
  @Index()
  @Expose()
  status: string

  @Column({ type: "text", name: "review_order_type" })
  @Expose()
  reviewOrderType?: string | null

  @Column({ type: "timestamptz", name: "published_at", nullable: true })
  @Index()
  @Expose()
  @Type(() => Date)
  publishedAt?: Date | null

  @Column({ type: "timestamptz", name: "closed_at", nullable: true })
  @Index()
  @Expose()
  @Type(() => Date)
  closedAt?: Date | null

  @Column({ type: "timestamptz", name: "updated_at", nullable: true })
  @Index()
  @Expose()
  @Type(() => Date)
  updatedAt?: Date | null

  @Column({ type: "timestamptz", name: "last_application_update_at", nullable: true, default: "1970-01-01" })
  @Expose()
  @Type(() => Date)
  lastApplicationUpdateAt?: Date | null

  // END LISTING FIELDS
  // BEGIN SEARCH FIELDS

  @Column({ type: "text", nullable: true })
  @Index()
  @Expose()
  county?: string | null

  @Column({ type: "text", nullable: true })
  @Expose()
  city?: string | null

  @Column({ type: "text", nullable: true })
  @Index()
  @Expose()
  neighborhood?: string | null

  @Column({ type: "text", name: "reserved_community_type_name", nullable: true})
  @Expose()
  reservedCommunityTypeName?: string | null

  @Column({ type: "text", name: "url_slug" })
  @Expose()
  urlSlug?: string | null

  // END SEARCH FIELDS
  // BEGIN COMPOSITE FIELDS

  @Column({ type: "jsonb", name: "units_summarized" })
  @Expose()
  unitsSummarized: UnitsSummarized | undefined

  @Column({ type: "jsonb" })
  @Expose()
  @Type(() => ListingImage)
  images?: ListingImage[] | null

  @Column({ type: "jsonb", name: "multiselect_questions" })
  @Expose()
  @Type(() => ListingMultiselectQuestion)
  multiselectQuestions?: ListingMultiselectQuestion[]

  @Column({ type: "jsonb" })
  @Expose()
  @Type(() => Jurisdiction)
  jurisdiction: Jurisdiction

  @Column({ type: "jsonb", name: "reserved_community_type" })
  @Expose()
  @Type(() => ReservedCommunityType)
  reservedCommunityType?: ReservedCommunityType

  @Column({ type: "jsonb" })
  units: Unit[]

  @Column({ type: "jsonb", name: "building_address" })
  @Expose()
  @Type(() => Address)
  buildingAddress: Address

  @Column({ type: "jsonb" })
  @Expose()
  @Type(() => ListingFeatures)
  features?: ListingFeatures

  @Column({ type: "jsonb" })
  @Expose()
  @Type(() => ListingUtilities)
  utilities?: ListingUtilities
}

export { ExternalListing }
