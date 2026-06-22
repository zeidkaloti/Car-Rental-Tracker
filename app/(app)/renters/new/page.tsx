import { RenterForm } from "@/components/forms/renter-form";

export default function NewRenterPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-foreground">Add renter</h1>
      <RenterForm />
    </div>
  );
}
