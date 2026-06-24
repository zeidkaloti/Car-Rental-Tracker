export type ServiceStatus = {
  lastServiceMileage: number | null;
  lastServiceDate: string | null;
  kmSinceService: number;
  due: boolean;
};

// No service record yet is treated as "0 km since the car's last (nonexistent)
// service" — i.e. due as soon as current mileage reaches the interval on its own.
export function getServiceStatus(
  currentMileage: number,
  intervalKm: number,
  lastService: { odometerReading: number | null; serviceDate: string } | undefined,
): ServiceStatus {
  const lastServiceMileage = lastService?.odometerReading ?? null;
  const kmSinceService = currentMileage - (lastServiceMileage ?? 0);

  return {
    lastServiceMileage,
    lastServiceDate: lastService?.serviceDate ?? null,
    kmSinceService,
    due: kmSinceService >= intervalKm,
  };
}
