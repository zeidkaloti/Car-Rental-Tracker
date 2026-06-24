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
  chargeInputSchema,
  CHARGE_TYPES,
  CHARGE_STATUSES,
  type ChargeInput,
  type ChargeFormInput,
} from "@/lib/validation/charge";
import { createCharge, updateCharge } from "@/actions/charges";

const TYPE_LABELS: Record<(typeof CHARGE_TYPES)[number], string> = {
  ticket: "Ticket",
  toll: "Toll",
  other: "Other",
};

const STATUS_LABELS: Record<(typeof CHARGE_STATUSES)[number], string> = {
  unpaid: "Unpaid",
  paid: "Paid",
};

export function ChargeForm({
  chargeId,
  defaultValues,
  renters,
  cars,
  rentals,
}: {
  chargeId?: string;
  defaultValues?: Partial<ChargeFormInput>;
  renters: { id: string; firstName: string; lastName: string }[];
  cars: { id: string; make: string; model: string; plate: string }[];
  rentals: { id: string; renterId: string; carId: string; startDate: string }[];
}) {
  const router = useRouter();
  const form = useForm<ChargeFormInput, unknown, ChargeInput>({
    resolver: zodResolver(chargeInputSchema),
    defaultValues: {
      renterId: "",
      carId: "",
      rentalId: undefined,
      amount: 0,
      chargeDate: new Date().toISOString().slice(0, 10),
      type: "ticket",
      status: "unpaid",
      notes: "",
      ...defaultValues,
    },
  });

  async function onSubmit(values: ChargeInput) {
    const result = chargeId ? await updateCharge(chargeId, values) : await createCharge(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(chargeId ? "Charge updated" : "Charge added");
    router.push("/charges");
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
                    label: `${car.make} ${car.model} (${car.plate})`,
                  }))}
                >
                  <SelectTrigger id="carId" className="w-full">
                    <SelectValue placeholder="Select a car" />
                  </SelectTrigger>
                  <SelectContent>
                    {cars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.make} {car.model} ({car.plate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.carId]} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="rentalId">Rental (optional)</FieldLabel>
          <Controller
            control={form.control}
            name="rentalId"
            render={({ field }) => (
              <Select
                value={field.value ?? "__none"}
                onValueChange={(value) => field.onChange(value === "__none" ? undefined : value)}
                items={[
                  { value: "__none", label: "Not linked" },
                  ...rentals.map((rental) => ({ value: rental.id, label: rental.startDate })),
                ]}
              >
                <SelectTrigger id="rentalId" className="w-full">
                  <SelectValue placeholder="Not linked to a specific rental" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Not linked</SelectItem>
                  {rentals.map((rental) => (
                    <SelectItem key={rental.id} value={rental.id}>
                      {rental.startDate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[form.formState.errors.rentalId]} />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="amount">Amount</FieldLabel>
            <Input id="amount" type="number" step="0.01" {...form.register("amount")} />
            <FieldError errors={[form.formState.errors.amount]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="chargeDate">Date</FieldLabel>
            <Input id="chargeDate" type="date" {...form.register("chargeDate")} />
            <FieldError errors={[form.formState.errors.chargeDate]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="type">Type</FieldLabel>
            <Controller
              control={form.control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value ?? "ticket"}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHARGE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.type]} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="status">Status</FieldLabel>
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Select
                value={field.value ?? "unpaid"}
                onValueChange={(value) => field.onChange(value)}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHARGE_STATUSES.map((status) => (
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
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={3} {...form.register("notes")} />
          <FieldError errors={[form.formState.errors.notes]} />
        </Field>
      </FieldGroup>
      <div className="flex gap-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : chargeId ? "Save changes" : "Add charge"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
