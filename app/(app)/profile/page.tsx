"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailPending, setEmailPending] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordPending, setPasswordPending] = useState(false);

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    setEmailPending(true);
    const { error } = await authClient.changeEmail({ newEmail: email });
    setEmailPending(false);
    if (error) {
      setEmailError(error.message ?? "Could not update email.");
      return;
    }
    setEmail("");
    setEmailSuccess(true);
    router.refresh();
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    setPasswordPending(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
    });
    setPasswordPending(false);
    if (error) {
      setPasswordError(error.message ?? "Could not update password.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setPasswordSuccess(true);
  }

  return (
    <div className="max-w-sm space-y-10">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Edit profile</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {session?.user.email ?? "..."}
        </p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Change email</h2>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            New email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
        </div>
        {emailError && <p className="text-sm text-red-600">{emailError}</p>}
        {emailSuccess && <p className="text-sm text-green-600">Email updated.</p>}
        <button
          type="submit"
          disabled={emailPending}
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-60"
        >
          {emailPending ? "Updating..." : "Update email"}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Change password</h2>
        <div className="space-y-1.5">
          <label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="newPassword" className="text-sm font-medium text-foreground">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700"
          />
        </div>
        {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
        {passwordSuccess && <p className="text-sm text-green-600">Password updated.</p>}
        <button
          type="submit"
          disabled={passwordPending}
          className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-60"
        >
          {passwordPending ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
