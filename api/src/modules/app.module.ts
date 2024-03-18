import { Logger, Module } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { PrismaModule } from './prisma.module';
import { AmiChartModule } from './ami-chart.module';
import { ListingModule } from './listing.module';
import { ReservedCommunityTypeModule } from './reserved-community-type.module';
import { UnitAccessibilityPriorityTypeServiceModule } from './unit-accessibility-priority-type.module';
import { UnitTypeModule } from './unit-type.module';
import { UnitRentTypeModule } from './unit-rent-type.module';
import { JurisdictionModule } from './jurisdiction.module';
import { MultiselectQuestionModule } from './multiselect-question.module';
import { ApplicationModule } from './application.module';
import { AssetModule } from './asset.module';
import { UserModule } from './user.module';
import { AuthModule } from './auth.module';
import { ApplicationFlaggedSetModule } from './application-flagged-set.module';
import { MapLayerModule } from './map-layer.module';

@Module({
  imports: [
    ListingModule,
    AmiChartModule,
    ReservedCommunityTypeModule,
    UnitTypeModule,
    UnitAccessibilityPriorityTypeServiceModule,
    UnitRentTypeModule,
    JurisdictionModule,
    MultiselectQuestionModule,
    ApplicationModule,
    AssetModule,
    UserModule,
    PrismaModule,
    AuthModule,
    ApplicationFlaggedSetModule,
    MapLayerModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger, SchedulerRegistry],
  exports: [
    ListingModule,
    AmiChartModule,
    ReservedCommunityTypeModule,
    UnitTypeModule,
    UnitAccessibilityPriorityTypeServiceModule,
    UnitRentTypeModule,
    JurisdictionModule,
    MultiselectQuestionModule,
    ApplicationModule,
    AssetModule,
    UserModule,
    PrismaModule,
    AuthModule,
    ApplicationFlaggedSetModule,
    MapLayerModule,
  ],
})
export class AppModule {}
