"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  rentalInputSchema,
  BILLING_CADENCES,
  RENTAL_STATUSES,
  RENTAL_SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  type RentalInput,
  type RentalFormInput,
} from "@/lib/validation/rental";
import { createRental, updateRental } from "@/actions/rentals";

const CADENCE_LABELS: Record<(typeof BILLING_CADENCES)[number], string> = {
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly",
};

const STATUS_LABELS: Record<(typeof RENTAL_STATUSES)[number], string> = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function RentalForm({
  rentalId,
  defaultValues,
  renters,
  cars,
}: {
  rentalId?: string;
  defaultValues?: Partial<RentalFormInput>;
  renters: { id: string; firstName: string; lastName: string }[];
  cars: { id: string; make: string; model: string; plate: string; status: string }[];
}) {
  const router = useRouter();
  const form = useForm<RentalFormInput, unknown, RentalInput>({
    resolver: zodResolver(rentalInputSchema),
    defaultValues: {
      renterId: "",
      carId: "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: undefined,
      billingCadence: "monthly",
      rateAmount: 0,
      serviceType: "other",
      status: "active",
      notes: "",
      ...defaultValues,
    },
  });

  async function onSubmit(values: RentalInput) {
    const result = rentalId ? await updateRental(rentalId, values) : await createRental(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(rentalId ? "Rental updated" : "Rental created");
    router.push(`/rentals/${result.data.id}`);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="renterId">Renter</FieldLabel>
            <Controller
              control={form.control}
              name="renterId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  items={renters.map((renter) => ({
                    value: renter.id,
                    label: `${renter.firstName} ${renter.lastName}`,
                  }))}
                >
                  <SelectTrigger id="renterId" className="w-full">
                    <SelectValue placeholder="Select a renter" />
                  </SelectTrigger>
                  <SelectContent>
                    {renters.map((renter) => (
                      <SelectItem key={renter.id} value={renter.id}>
                        {renter.firstName} {renter.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.renterId]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="carId">Car</FieldLabel>
            <Controller
              control={form.control}
              name="carId"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  items={cars.map((car) => ({
                    value: car.id,
                    label: `${car.make} ${car.model} (${car.plate}) — ${car.status}`,
                  }))}
                >
                  <SelectTrigger id="carId" className="w-full">
                    <SelectValue placeholder="Select a car" />
                  </SelectTrigger>
                  <SelectContent>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.make} {car.model} ({car.plate}) — {car.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.carId]} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="startDate">Start date</FieldLabel>
            <Input id="startDate" type="date" {...form.register("startDate")} />
            <FieldError errors={[form.formState.errors.startDate]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="endDate">End date</FieldLabel>
            <Input id="endDate" type="date" {...form.register("endDate")} />
            <FieldError errors={[form.formState.errors.endDate]} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="billingCadence">Billing cadence</FieldLabel>
            <Controller
              control={form.control}
              name="billingCadence"
              render={({ field }) => (
                <Select
                  value={field.value ?? "monthly"}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger id="billingCadence" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BILLING_CADENCES.map((cadence) => (
                      <SelectItem key={cadence} value={cadence}>
                        {CADENCE_LABELS[cadence]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.billingCadence]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="rateAmount">Rate amount</FieldLabel>
            <Input id="rateAmount" type="number" step="0.01" {...form.register("rateAmount")} />
            <FieldError errors={[form.formState.errors.rateAmount]} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="serviceType">Vehicle use</FieldLabel>
            <Controller
              control={form.control}
              name="serviceType"
              render={({ field }) => (
                <Select
                  value={field.value ?? "other"}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger id="serviceType" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RENTAL_SERVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {SERVICE_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.serviceType]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value ?? "active"}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RENTAL_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.status]} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={3} {...form.register("notes")} />
          <FieldError errors={[form.formState.errors.notes]} />
        </Field>
      </FieldGroup>
      <div className="flex gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Saving..."
            : rentalId
              ? "Save changes"
              : "Create rental"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
