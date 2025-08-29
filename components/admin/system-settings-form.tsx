"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

const systemSettingsSchema = z.object({
  // YouTube settings
  auto_publish_youtube: z.boolean(),
  require_youtube_metadata: z.boolean(),

  // Drive settings
  require_drive_review: z.boolean(),
  max_drive_file_size: z.string().optional(),

  // General settings
  max_submissions_per_user: z.string().optional(),
  enable_badges: z.boolean(),
  enable_comments: z.boolean(),

  // Notification settings
  email_notifications: z.boolean(),
  admin_approval_required: z.boolean(),
});

type SystemSettingsData = z.infer<typeof systemSettingsSchema>;

export function SystemSettingsForm() {
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<SystemSettingsData>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      auto_publish_youtube: true,
      require_youtube_metadata: true,
      require_drive_review: true,
      max_drive_file_size: "100MB",
      max_submissions_per_user: "50",
      enable_badges: true,
      enable_comments: true,
      email_notifications: true,
      admin_approval_required: true,
    },
  });

  // Load current settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // In a real app, you'd load these from a settings table
        // For now, we'll use default values
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading settings:", error);
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const onSubmit = async (data: SystemSettingsData) => {
    setLoading(true);

    try {
      // In a real app, you'd save these to a settings table

      toast({
        title: "Settings updated",
        description: "System settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* YouTube Settings */}
          <Card>
            <CardHeader>
              <CardTitle>YouTube Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="auto_publish_youtube"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Auto-publish YouTube submissions
                      </FormLabel>
                      <FormDescription>
                        YouTube submissions will be published immediately
                        without admin review
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="require_youtube_metadata"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Require YouTube metadata
                      </FormLabel>
                      <FormDescription>
                        Automatically fetch and store YouTube video metadata
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Drive Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Google Drive Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="require_drive_review"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Require admin review for Drive submissions
                      </FormLabel>
                      <FormDescription>
                        Drive submissions will be marked as draft and require
                        admin approval
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_drive_file_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Maximum file size for Drive submissions
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="100MB" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="max_submissions_per_user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum submissions per user</FormLabel>
                    <FormControl>
                      <Input placeholder="50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enable_badges"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable badge system
                      </FormLabel>
                      <FormDescription>
                        Award badges to users based on submission milestones
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enable_comments"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable comments
                      </FormLabel>
                      <FormDescription>
                        Allow users to comment on submissions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email_notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Email notifications
                      </FormLabel>
                      <FormDescription>
                        Send email notifications for important events
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admin_approval_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Admin approval required
                      </FormLabel>
                      <FormDescription>
                        Require admin approval for certain actions
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Utility Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Utility Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <h4 className="text-base font-medium">Fix Profile Counts</h4>
                  <p className="text-sm text-gray-500">
                    Recalculate all user profile submission counts. Use this if
                    counts are incorrect.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (
                      confirm(
                        "This will recalculate all profile counts. Continue?"
                      )
                    ) {
                      setLoading(true);
                      try {
                        const response = await fetch(
                          "/api/fix-profile-counts",
                          {
                            method: "POST",
                          }
                        );
                        const result = await response.json();

                        if (response.ok) {
                          toast({
                            title: "Success",
                            description:
                              "Profile counts have been recalculated successfully.",
                          });
                        } else {
                          throw new Error(
                            result.error || "Failed to fix profile counts"
                          );
                        }
                      } catch (error: any) {
                        toast({
                          title: "Error",
                          description:
                            error.message || "Failed to fix profile counts",
                          variant: "destructive",
                        });
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? "Fixing..." : "Fix Counts"}
                </Button>
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <h4 className="text-base font-medium">
                    Debug Profile Counts
                  </h4>
                  <p className="text-sm text-gray-500">
                    Check current profile counts vs actual submission counts to
                    identify mismatches.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const response = await fetch("/api/debug-profile-counts");
                      const result = await response.json();

                      if (response.ok) {
                        toast({
                          title: "Debug Complete",
                          description: `Found ${result.summary.users_with_mismatched_submissions} users with mismatched counts.`,
                        });
                      } else {
                        throw new Error(
                          result.error || "Failed to debug profile counts"
                        );
                      }
                    } catch (error: any) {
                      toast({
                        title: "Error",
                        description:
                          error.message || "Failed to debug profile counts",
                        variant: "destructive",
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? "Checking..." : "Debug Counts"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
