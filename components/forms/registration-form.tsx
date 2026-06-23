"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import {
  registrationInputSchema,
  type RegistrationInput,
  type RegistrationFormInput,
} from "@/lib/validation/registration";
import { createRegistration } from "@/actions/registrations";

export function RegistrationForm({
  carId,
  onSuccess,
}: {
  carId: string;
  onSuccess: () => void;
}) {
  const form = useForm<RegistrationFormInput, unknown, RegistrationInput>({
    resolver: zodResolver(registrationInputSchema),
    defaultValues: {
      carId,
      registrationDate: new Date().toISOString().slice(0, 10),
      expiryDate: undefined,
      registrationNumber: "",
      notes: "",
    },
  });

  async function onSubmit(values: RegistrationInput) {
    const result = await createRegistration(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Registration added");
    onSuccess();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="registrationDate">Registration date</FieldLabel>
            <Input id="registrationDate" type="date" {...form.register("registrationDate")} />
            <FieldError errors={[form.formState.errors.registrationDate]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="expiryDate">Expiry date</FieldLabel>
            <Input id="expiryDate" type="date" {...form.register("expiryDate")} />
            <FieldError errors={[form.formState.errors.expiryDate]} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="registrationNumber">Registration number</FieldLabel>
          <Input id="registrationNumber" {...form.register("registrationNumber")} />
          <FieldError errors={[form.formState.errors.registrationNumber]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={2} {...form.register("notes")} />
          <FieldError errors={[form.formState.errors.notes]} />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
        {form.formState.isSubmitting ? "Saving..." : "Add registration"}
      </Button>
    </form>
  );
}
