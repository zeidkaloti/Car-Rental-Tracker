"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import {
  renterInputSchema,
  type RenterInput,
  type RenterFormInput,
} from "@/lib/validation/renter";
import { createRenter, updateRenter } from "@/actions/renters";

export function RenterForm({
  renterId,
  defaultValues,
}: {
  renterId?: string;
  defaultValues?: Partial<RenterFormInput>;
}) {
  const router = useRouter();
  const form = useForm<RenterFormInput, unknown, RenterInput>({
    resolver: zodResolver(renterInputSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: undefined,
      phone: "",
      address: "",
      licenseNumber: "",
      licenseExpiry: undefined,
      notes: "",
      ...defaultValues,
    },
  });

  async function onSubmit(values: RenterInput) {
    const result = renterId
      ? await updateRenter(renterId, values)
      : await createRenter(values);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(renterId ? "Renter updated" : "Renter added");
    router.push(`/renters/${result.data.id}`);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-6">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input id="firstName" {...form.register("firstName")} />
            <FieldError errors={[form.formState.errors.firstName]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input id="lastName" {...form.register("lastName")} />
            <FieldError errors={[form.formState.errors.lastName]} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" {...form.register("email")} />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" {...form.register("phone")} />
            <FieldError errors={[form.formState.errors.phone]} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Input id="address" {...form.register("address")} />
          <FieldError errors={[form.formState.errors.address]} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="licenseNumber">License number</FieldLabel>
            <Input id="licenseNumber" {...form.register("licenseNumber")} />
            <FieldError errors={[form.formState.errors.licenseNumber]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="licenseExpiry">License expiry</FieldLabel>
            <Input id="licenseExpiry" type="date" {...form.register("licenseExpiry")} />
            <FieldError errors={[form.formState.errors.licenseExpiry]} />
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
          {form.formState.isSubmitting ? "Saving..." : renterId ? "Save changes" : "Add renter"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
