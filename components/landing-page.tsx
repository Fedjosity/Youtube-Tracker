"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { useForm } from "react-hook-form";
import { Youtube, Users, BarChart3, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
    },
  });
  const router = useRouter();

  const onSubmit = async (
    values: { email: string; password: string; full_name: string },
    event?: React.BaseSyntheticEvent
  ) => {
    if (event) event.preventDefault();
    setLoading(true);
    setError(null);
    if (mode === "login") {
      const { data, error } = await (supabase as any).auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) setError(error.message);
      else {
        router.push("/dashboard");
      }
    } else {
      const { data, error } = await (supabase as any).auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
          },
        },
      });
      if (error) setError(error.message);
      else {
        // Create profile for new user
        if (data.user) {
          const { data: profileData, error: profileError } = await (
            supabase as any
          )
            .from("profiles")
            .upsert(
              {
                id: data.user.id,
                email: data.user.email!,
                full_name:
                  values.full_name ||
                  data.user.user_metadata?.full_name ||
                  data.user.email?.split("@")[0],
                avatar_url: data.user.user_metadata?.avatar_url,
                role: "editor", // Default role for new users
              },
              {
                onConflict: "id",
              }
            )
            .select();

          if (profileError) {
            console.error("Profile creation error:", profileError);
            setError("Failed to create user profile. Please try again.");
            setLoading(false);
            return;
          }
        }
        router.push("/dashboard");
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mb-8">
      <div className="flex justify-center mb-4">
        <Button
          variant={mode === "login" ? "default" : "outline"}
          onClick={() => setMode("login")}
          className="mr-2"
        >
          Login
        </Button>
        <Button
          variant={mode === "register" ? "default" : "outline"}
          onClick={() => setMode("register")}
        >
          Register
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values, event) =>
            onSubmit(values, event)
          )}
          className="space-y-4"
        >
          {mode === "register" && (
            <FormField
              control={form.control}
              name="full_name"
              rules={{
                required: mode === "register" ? "Full name is required" : false,
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            rules={{ required: "Email is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            rules={{
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Registering..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export function LandingPage() {
  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const features = [
    {
      icon: Youtube,
      title: "YouTube Integration",
      description:
        "Automatically fetch video metadata and track publishing status",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Manage multiple editors and track their contributions",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "View detailed analytics and performance metrics",
    },
    {
      icon: Award,
      title: "Gamification",
      description: "Earn badges and compete on leaderboards",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Fedjosity YouTube Collaboration Tracker
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline our YouTube content creation workflow with powerful
            collaboration tools, analytics, and team management features.
          </p>
          <Button
            onClick={handleGoogleSignIn}
            size="lg"
            className="text-lg px-8 py-6 mb-4"
          >
            Sign in with Google to Get Started
          </Button>
          <div className="my-4 text-gray-500">or</div>
          <AuthForm />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="text-center hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <feature.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-center text-gray-500"
        >
          <p>Built for Fedjosity YouTube creators and content teams</p>
        </motion.div>
      </div>
    </div>
  );
}
