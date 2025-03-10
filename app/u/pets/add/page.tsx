"use client";
import ResponsiveContainer from "@/components/shared/layout/responsive-container";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  FormItem,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

function AddPets() {
  const form = useForm({
    shouldFocusError: true,
    values: {
        "pet-name": "",
        "pet-species": "",
        "pet-breed": "",
        "pet-age": "",
        weight: "",
        color: "",
    },
    defaultValues: {
      "pet-name": "",
      "pet-species": "",
      "pet-breed": "",
      "pet-age": "",
      weight: "",
      color: "",
    },
  });
  return (
    <ResponsiveContainer>
      <Card>
        <CardHeader>
          <CardTitle>Add a Pet</CardTitle>
          <CardDescription>Fill in the details of your pet</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <FormControl>
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormField
                  name="pet-name"
                  render={({ field, fieldState, formState }) => (
                    <Input type="text" placeholder="Enter your pet's name" />
                  )}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Species</FormLabel>
                <FormField
                  name="pet-species"
                  render={({ field, fieldState, formState }) => (
                    <Input type="text" placeholder="Enter your pet's species" />
                  )}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Breed</FormLabel>
                <FormField
                  name="pet-breed"
                  render={({ field, fieldState, formState }) => (
                    <Input type="text" placeholder="Enter your pet's breed" />
                  )}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormField
                  name="pet-age"
                  render={({ field, fieldState, formState }) => (
                    <Input type="number" placeholder="Enter your pet's age" />
                  )}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Weight</FormLabel>
                <FormField
                  name="weight"
                  render={({ field, fieldState, formState }) => (
                    <Input
                      type="number"
                      placeholder="Enter your pet's weight"
                    />
                  )}
                />
              </FormItem>

              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormField
                  name="color"
                  render={({ field, fieldState, formState }) => (
                    <Input type="text" placeholder="Enter your pet's color" />
                  )}
                />
              </FormItem>
              
            </FormControl>
          </Form>
        </CardContent>
        <CardFooter>
          <Button type="submit">Add Pet</Button>
        </CardFooter>
      </Card>
    </ResponsiveContainer>
  );
}

export default AddPets;
