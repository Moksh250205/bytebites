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
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneInput } from "@/components/ui/phone-input";

const formSchema = z.object({
  name: z.string().min(2, "Restaurant name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  email: z.string().email("Invalid email address"),
  contactNumber: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  upiId: z.string().min(1, "UPI ID is required"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export default function RestaurantSignupForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      ownerName: "",
      description: "",
      email: "",
      contactNumber: "",
      upiId: "",
      password: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await axios.post("/api/restaurant-signup", values);

      if (response.data.success) {
        toast.success("Restaurant registered successfully!");
        router.push("/dashboard");
      } else {
        toast.error(response.data.error || "Registration failed");
      }
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Registration failed";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
      console.error("Registration error:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restaurant Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter restaurant name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ownerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Owner Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter owner name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restaurant Description</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Describe your restaurant (min. 20 characters)" 
                  className="min-h-[100px]"
                  {...field} 
                />
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
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="restaurant@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Number</FormLabel>
              <FormControl>
                <PhoneInput placeholder="10-digit mobile number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="upiId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>UPI ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter UPI ID" {...field} />
              </FormControl>
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
                <PasswordInput placeholder="Create password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Registering..." : "Register Restaurant"}
        </Button>

        <div className="text-center mt-4">
          <Link href="/restaurant-login" className="text-blue-500 hover:underline">
            Already registered? Login here
          </Link>
        </div>
      </form>
    </Form>
  );
}