"use client";

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
  safetyCertificationInputSchema,
  CERT_RESULTS,
  type SafetyCertificationInput,
  type SafetyCertificationFormInput,
} from "@/lib/validation/safety-certification";
import { createSafetyCertification } from "@/actions/safety-certifications";

const RESULT_LABELS: Record<(typeof CERT_RESULTS)[number], string> = {
  pass: "Pass",
  fail: "Fail",
};

export function SafetyCertificationForm({
  carId,
  onSuccess,
}: {
  carId: string;
  onSuccess: () => void;
}) {
  const form = useForm<SafetyCertificationFormInput, unknown, SafetyCertificationInput>({
    resolver: zodResolver(safetyCertificationInputSchema),
    defaultValues: {
      carId,
      certDate: new Date().toISOString().slice(0, 10),
      expiryDate: undefined,
      inspector: "",
      result: "pass",
      notes: "",
    },
  });

  async function onSubmit(values: SafetyCertificationInput) {
    const result = await createSafetyCertification(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Certification added");
    onSuccess();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="certDate">Certification date</FieldLabel>
            <Input id="certDate" type="date" {...form.register("certDate")} />
            <FieldError errors={[form.formState.errors.certDate]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="expiryDate">Expiry date</FieldLabel>
            <Input id="expiryDate" type="date" {...form.register("expiryDate")} />
            <FieldError errors={[form.formState.errors.expiryDate]} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="inspector">Inspector / certifying body</FieldLabel>
            <Input id="inspector" {...form.register("inspector")} />
            <FieldError errors={[form.formState.errors.inspector]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="result">Result</FieldLabel>
            <Controller
              control={form.control}
              name="result"
              render={({ field }) => (
                <Select
                  value={field.value ?? "pass"}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger id="result" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CERT_RESULTS.map((result) => (
                      <SelectItem key={result} value={result}>
                        {RESULT_LABELS[result]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError errors={[form.formState.errors.result]} />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <Textarea id="notes" rows={2} {...form.register("notes")} />
          <FieldError errors={[form.formState.errors.notes]} />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
        {form.formState.isSubmitting ? "Saving..." : "Add certification"}
      </Button>
    </form>
  );
}
