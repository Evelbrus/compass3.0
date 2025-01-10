//types.ts
import { ServiceLevels, VehicleType } from '@prisma/client';

export type Scenario =
  | 'INITIAL'
  | 'SERVICE_LEVEL_SELECTED'
  | 'VEHICLE_TYPE_SELECTED'
  | 'BOTH_SELECTED';

export interface ScenarioHandlers {
  scenario: Scenario;
  serviceLevel?: ServiceLevels;
  vehicleType?: VehicleType;
}
