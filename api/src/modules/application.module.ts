import { Module } from '@nestjs/common';
import { ApplicationController } from '../controllers/application.controller';
import { ApplicationService } from '../services/application.service';
import { GeocodingService } from '../services/geocoding.service';
import { PrismaModule } from './prisma.module';
import { PermissionModule } from './permission.module';
import { EmailModule } from './email.module';
import { ListingModule } from './listing.module';
import { MultiselectQuestionModule } from './multiselect-question.module';
import { ApplicationCsvExporterService } from '../services/application-csv-export.service';
import { UnitTypeModule } from './unit-type.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    ListingModule,
    MultiselectQuestionModule,
    PermissionModule,
    UnitTypeModule,
  ],
  controllers: [ApplicationController],
  providers: [
    ApplicationService,
    GeocodingService,
    ApplicationCsvExporterService,
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
