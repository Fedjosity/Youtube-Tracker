"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

const passwordSchema = z
  .object({
    current_password: z.string().min(6, "Current password is required"),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Confirm new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export function AccountSettingsForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onChangePassword = async (values: PasswordFormData) => {
    setLoading(true);
    try {
      // Reauthenticate by signing in, then update password
      const {
        data: { user },
        error: authErr,
      } = await (supabase as any).auth.getUser();
      if (authErr || !user?.email)
        throw authErr || new Error("Not authenticated");

      const { error: signInErr } = await (
        supabase as any
      ).auth.signInWithPassword({
        email: user.email,
        password: values.current_password,
      });
      if (signInErr) throw new Error("Current password is incorrect");

      const { error: updateErr } = await (supabase as any).auth.updateUser({
        password: values.new_password,
      });
      if (updateErr) throw updateErr;

      toast({
        title: "Password updated",
        description: "Your password was changed successfully.",
      });
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSignOutAll = async () => {
    setLoading(true);
    try {
      await (supabase as any).auth.signOut({ scope: "global" });
      toast({
        title: "Signed out everywhere",
        description: "All active sessions were revoked.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out everywhere",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Security</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onChangePassword)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Change Password"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <div className="font-medium">Sign out of all devices</div>
            <div className="text-sm text-muted-foreground">
              Revoke all active sessions across devices.
            </div>
          </div>
          <Button variant="outline" onClick={onSignOutAll} disabled={loading}>
            {loading ? "Processing..." : "Sign out everywhere"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
