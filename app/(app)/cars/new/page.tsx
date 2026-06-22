import { CarForm } from "@/components/forms/car-form";

export default function NewCarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-foreground">Add car</h1>
      <CarForm />
    </div>
  );
}
