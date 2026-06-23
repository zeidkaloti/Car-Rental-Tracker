"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import {
  insuranceInputSchema,
  type InsuranceInput,
  type InsuranceFormInput,
} from "@/lib/validation/insurance";
import { createInsurancePolicy } from "@/actions/insurance";

export function InsuranceForm({
  carId,
  onSuccess,
}: {
  carId: string;
  onSuccess: () => void;
}) {
  const form = useForm<InsuranceFormInput, unknown, InsuranceInput>({
    resolver: zodResolver(insuranceInputSchema),
    defaultValues: {
      carId,
      startDate: new Date().toISOString().slice(0, 10),
      expiryDate: undefined,
      provider: "",
      policyNumber: "",
      notes: "",
    },
  });

  async function onSubmit(values: InsuranceInput) {
    const result = await createInsurancePolicy(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Insurance policy added");
    onSuccess();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="startDate">Start date</FieldLabel>
            <Input id="startDate" type="date" {...form.register("startDate")} />
            <FieldError errors={[form.formState.errors.startDate]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="expiryDate">Expiry date</FieldLabel>
            <Input id="expiryDate" type="date" {...form.register("expiryDate")} />
            <FieldError errors={[form.formState.errors.expiryDate]} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="provider">Provider</FieldLabel>
            <Input id="provider" {...form.register("provider")} />
            <FieldError errors={[form.formState.errors.provider]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="policyNumber">Policy number</FieldLabel>
            <Input id="policyNumber" {...form.register("policyNumber")} />
            <FieldError errors={[form.formState.errors.policyNumber]} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={2} {...form.register("notes")} />
          <FieldError errors={[form.formState.errors.notes]} />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
        {form.formState.isSubmitting ? "Saving..." : "Add insurance policy"}
      </Button>
    </form>
  );
}
