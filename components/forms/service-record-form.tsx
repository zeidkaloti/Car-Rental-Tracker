"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import {
  serviceRecordInputSchema,
  type ServiceRecordInput,
  type ServiceRecordFormInput,
} from "@/lib/validation/service-record";
import { createServiceRecord } from "@/actions/service-records";

export function ServiceRecordForm({
  carId,
  onSuccess,
}: {
  carId: string;
  onSuccess: () => void;
}) {
  const form = useForm<ServiceRecordFormInput, unknown, ServiceRecordInput>({
    resolver: zodResolver(serviceRecordInputSchema),
    defaultValues: {
      carId,
      serviceDate: new Date().toISOString().slice(0, 10),
      serviceType: "",
      description: "",
      cost: undefined,
      vendor: "",
      odometerReading: undefined,
    },
  });

  async function onSubmit(values: ServiceRecordInput) {
    const result = await createServiceRecord(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Service record added");
    onSuccess();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="serviceDate">Service date</FieldLabel>
            <Input id="serviceDate" type="date" {...form.register("serviceDate")} />
            <FieldError errors={[form.formState.errors.serviceDate]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="serviceType">Service type</FieldLabel>
            <Input id="serviceType" placeholder="Oil change" {...form.register("serviceType")} />
            <FieldError errors={[form.formState.errors.serviceType]} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="cost">Cost</FieldLabel>
            <Input id="cost" type="number" step="0.01" {...form.register("cost")} />
            <FieldError errors={[form.formState.errors.cost]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="odometerReading">Odometer reading</FieldLabel>
            <Input id="odometerReading" type="number" {...form.register("odometerReading")} />
            <FieldError errors={[form.formState.errors.odometerReading]} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="vendor">Vendor</FieldLabel>
          <Input id="vendor" {...form.register("vendor")} />
          <FieldError errors={[form.formState.errors.vendor]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea id="description" rows={2} {...form.register("description")} />
          <FieldError errors={[form.formState.errors.description]} />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
        {form.formState.isSubmitting ? "Saving..." : "Add service record"}
      </Button>
    </form>
  );
}
