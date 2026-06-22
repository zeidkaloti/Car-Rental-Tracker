"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteConfirmButton<T>({
  itemLabel,
  id,
  action,
  redirectTo,
}: {
  itemLabel: string;
  id: T;
  action: (id: T) => Promise<{ success: boolean; error?: string }>;
  redirectTo: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    const result = await action(id);
    if (!result.success) {
      toast.error(result.error ?? "Could not delete.");
      return;
    }
    toast.success(`${itemLabel} deleted`);
    router.push(redirectTo);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive">Delete</Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {itemLabel}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
