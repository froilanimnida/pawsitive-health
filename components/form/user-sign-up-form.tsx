"use client";
import React from "react";
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
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchema } from "@/lib/auth-definitions";
import { CardContent } from "@/components/ui/card";
import { z } from "zod";

function UserSignUpForm() {
  const signUpForm = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = (values: z.infer<typeof SignUpSchema>) => {
    console.log(values);
  };
  return (
    <form onSubmit={signUpForm.handleSubmit(onSubmit)}>
      <Form {...signUpForm}>
        <CardContent className="space-y-6">
          <FormControl>
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormField
                control={signUpForm.control}
                name="first_name"
                render={({ field, fieldState, formState }) => (
                  <Input
                    type="text"
                    placeholder="First Name"
                    className="mb-4"
                    {...field}
                  />
                )}
              />
              <FormDescription>Your first name</FormDescription>
              <FormMessage />
            </FormItem>
          </FormControl>
          <FormControl>
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormField
                control={signUpForm.control}
                name="last_name"
                render={({ field, fieldState, formState }) => (
                  <Input
                    type="text"
                    placeholder="Last Name"
                    className="mb-4"
                    {...field}
                  />
                )}
              />
              <FormDescription>Your Last name</FormDescription>
              <FormMessage />
            </FormItem>
          </FormControl>
          <FormControl>
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormField
                control={signUpForm.control}
                name="email"
                render={({ field, fieldState, formState }) => (
                  <Input
                    type="text"
                    placeholder="Email"
                    className="mb-4"
                    {...field}
                  />
                )}
              />
              <FormDescription>Your valid email address</FormDescription>
              <FormMessage />
            </FormItem>
          </FormControl>
          <FormControl>
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormField
                control={signUpForm.control}
                name="password"
                render={({ field, fieldState, formState }) => (
                  <Input
                    type="password"
                    placeholder="Password"
                    className="mb-4"
                    {...field}
                  />
                )}
              />
              <FormDescription>Your password</FormDescription>
              <FormMessage />
            </FormItem>
          </FormControl>
          <FormControl>
            <FormItem>
              <FormLabel>Confirm your password</FormLabel>
              <FormField
                control={signUpForm.control}
                name="confirm_password"
                render={({ field, fieldState, formState }) => (
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    className="mb-4"
                    {...field}
                  />
                )}
              />
              <FormDescription>Retype your password</FormDescription>
              <FormMessage />
            </FormItem>
          </FormControl>
          <Button className="w-full">Create account</Button>
        </CardContent>
      </Form>
    </form>
  );
}

export default UserSignUpForm;
