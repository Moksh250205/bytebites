import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { PasswordInput } from "@/components/ui/password-input";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export default function SignupForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await axios.post("/api/user-signup", values);
      
      if (response.data.success) {
        toast.success("Account created successfully! Please verify your email.");
        router.push("/");
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || "Failed to create account";
        toast.error(errorMessage);
        
        if (error.response?.status === 400 && error.response?.data?.message === "User already exists") {
          form.setError("email", {
            type: "manual",
            message: "This email is already registered"
          });
        }
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Form submission error", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-3xl mx-auto">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Firstname</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Max" {...field} />
              </FormControl>
              <FormDescription>Your firstname</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lastname</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Ten" {...field} />
              </FormControl>
              <FormDescription>Your lastname</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start">
              <FormLabel>Phone number</FormLabel>
              <FormControl className="w-full">
                <PhoneInput placeholder="Enter phone number" {...field} defaultCountry="TR" />
              </FormControl>
              <FormDescription>Enter your phone number.</FormDescription>
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
                <Input placeholder="email@example.com" type="email" {...field} />
              </FormControl>
              <FormDescription>Your email</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating account..." : "Create Account"}
        </Button>
        
        <div className="text-center mt-4">
          <Link href="/user-login" className="text-blue-500 hover:underline">
            Already registered? Login here.
          </Link>
        </div>
      </form>
    </Form>
  );
}