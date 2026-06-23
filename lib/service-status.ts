export type ServiceStatus = {
  lastServiceMileage: number | null;
  lastServiceDate: string | null;
  milesSinceService: number;
  due: boolean;
};

// No service record yet is treated as "0 miles since the car's last (nonexistent)
// service" — i.e. due as soon as current mileage reaches the interval on its own.
export function getServiceStatus(
  currentMileage: number,
  intervalMiles: number,
  lastService: { odometerReading: number | null; serviceDate: string } | undefined,
): ServiceStatus {
  const lastServiceMileage = lastService?.odometerReading ?? null;
  const milesSinceService = currentMileage - (lastServiceMileage ?? 0);

  return {
    lastServiceMileage,
    lastServiceDate: lastService?.serviceDate ?? null,
    milesSinceService,
    due: milesSinceService >= intervalMiles,
  };
}
