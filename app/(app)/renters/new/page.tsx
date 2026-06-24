import { RenterForm } from "@/components/forms/renter-form";
import { BackButton } from "@/components/ui/back-button";

export default function NewRenterPage() {
  return (
    <div className="space-y-6">
      <BackButton />
      <h1 className="text-lg font-semibold text-foreground">Add renter</h1>
      <RenterForm />
    </div>
  );
}
