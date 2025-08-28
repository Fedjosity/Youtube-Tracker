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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      email: "",
    },
  });

  // Get current user and profile data
  useEffect(() => {
    const getUserData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Auth error:", userError);
          toast({
            title: "Error",
            description: "Failed to get user data",
            variant: "destructive",
          });
          return;
        }

        if (user) {
          setUser(user);

          // Get profile data
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
            toast({
              title: "Error",
              description: "Failed to load profile data",
              variant: "destructive",
            });
            return;
          }

          if (profileData) {
            setProfile(profileData);
            // Update form with profile data
            form.reset({
              full_name: profileData.full_name || "",
              email: user.email || "",
            });
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();
  }, [form, toast]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setLoading(true);

    try {
      // Update profile in database
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
        })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      // Update email if changed
      if (data.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });

        if (emailError) {
          throw emailError;
        }
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      // Refresh the page to show updated data
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
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

  if (!user || !profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">Failed to load profile data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
              <AvatarFallback className="text-lg">
                {profile.full_name?.[0]?.toUpperCase() ||
                  user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{profile.full_name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {profile.total_submissions || 0}
              </div>
              <div className="text-sm text-gray-500">Total Submissions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {profile.total_published || 0}
              </div>
              <div className="text-sm text-gray-500">Published Videos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
