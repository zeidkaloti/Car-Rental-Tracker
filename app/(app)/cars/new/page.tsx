import { CarForm } from "@/components/forms/car-form";
import { BackButton } from "@/components/ui/back-button";

export default function NewCarPage() {
  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-lg font-semibold text-foreground">Add car</h1>
      <CarForm />
    </div>
  );
}
