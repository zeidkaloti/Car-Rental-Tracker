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
  carInputSchema,
  CAR_STATUSES,
  type CarInput,
  type CarFormInput,
} from "@/lib/validation/car";
import { createCar, updateCar } from "@/actions/cars";

const STATUS_LABELS: Record<(typeof CAR_STATUSES)[number], string> = {
  available: "Available",
  rented: "Rented",
  in_service: "In service",
  out_of_service: "Out of service",
};

export function CarForm({
  carId,
  defaultValues,
}: {
  carId?: string;
  defaultValues?: Partial<CarFormInput>;
}) {
  const router = useRouter();
  const form = useForm<CarFormInput, unknown, CarInput>({
    resolver: zodResolver(carInputSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      vin: "",
      plate: "",
      color: "",
      mileage: 0,
      status: "available",
      notes: "",
      ...defaultValues,
    },
  });

  async function onSubmit(values: CarInput) {
    const result = carId ? await updateCar(carId, values) : await createCar(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(carId ? "Car updated" : "Car added");
    router.push(`/cars/${result.data.id}`);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      <FieldGroup>
        <div className="grid grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="make">Make</FieldLabel>
            <Input id="make" {...form.register("make")} />
            <FieldError errors={[form.formState.errors.make]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="model">Model</FieldLabel>
            <Input id="model" {...form.register("model")} />
            <FieldError errors={[form.formState.errors.model]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="year">Year</FieldLabel>
            <Input id="year" type="number" {...form.register("year")} />
            <FieldError errors={[form.formState.errors.year]} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="vin">VIN</FieldLabel>
            <Input id="vin" {...form.register("vin")} />
            <FieldError errors={[form.formState.errors.vin]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="plate">Plate</FieldLabel>
            <Input id="plate" {...form.register("plate")} />
            <FieldError errors={[form.formState.errors.plate]} />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="color">Color</FieldLabel>
            <Input id="color" {...form.register("color")} />
            <FieldError errors={[form.formState.errors.color]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="mileage">Mileage</FieldLabel>
            <Input id="mileage" type="number" {...form.register("mileage")} />
            <FieldError errors={[form.formState.errors.mileage]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="status">Status</FieldLabel>
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value ?? "available"}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAR_STATUSES.map((status) => (
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
          {form.formState.isSubmitting ? "Saving..." : carId ? "Save changes" : "Add car"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
