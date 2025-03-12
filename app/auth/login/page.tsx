"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ResponsiveContainer from "@/components/shared/layout/responsive-container";
import { useForm } from "react-hook-form";
import { LoginSchema } from "@/lib/auth-definitions";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const LoginPage = () => {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    progressive: true,
  });
  const handleLogin = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const data = LoginSchema.safeParse(formData);
    console.log(data);
  };
  return (
    <ResponsiveContainer className="flex justify-center items-center">
      <>
        <section className="flex justify-center items-center max-w-1/2 mx-auto"></section>

        <Card>
          <CardHeader>
            <CardTitle>Hello There!</CardTitle>
            <CardDescription>Login to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <FormControl>
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormField
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
                </FormItem>
              </FormControl>
              <FormControl>
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormField
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
                </FormItem>
              </FormControl>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button>Login</Button>
            <Link href={"/auth/sign-up"}>Sign up instead</Link>
          </CardFooter>
        </Card>
      </>
    </ResponsiveContainer>
  );
};

export default LoginPage;
