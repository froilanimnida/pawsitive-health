import Link from "next/link";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Badge,
    Button,
} from "@/components/ui";
import { Navbar } from "@/components/shared/home-navbar";
import { PawPrint, Activity, Calendar, Shield, Star, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col w-full">
            <Navbar />
            <main className="flex-1">
                {/* Hero Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col justify-center">
                    <div className="px-4 md:px-6">
                        <div className="flex justify-center items-center space-y-4 text-center flex-col">
                            <div className="space-y-2 flex justify-center flex-col items-center">
                                <Badge className="inline-block" variant="outline">
                                    Trusted by 10,000+ pet owners
                                </Badge>
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                    Complete healthcare monitoring for your pets
                                </h1>
                                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                    Track your pet&apos;s health, schedule vet appointments, and check historical data
                                    about your furry friend&apos;s wellbeing.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                <Button asChild>
                                    <Link href={"/signup"} className="flex items-center">
                                        Get Started
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={"/signin"} className="flex items-center">
                                        Log In
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 flex justify-center">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <Badge variant="outline">Features</Badge>
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                                    Everything you need for your pet&apos;s health
                                </h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                                    Our comprehensive platform helps you monitor, track, and improve your pet&apos;s
                                    health with ease.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="border-2 border-transparent transition-all hover:shadow-md">
                                <CardHeader className="pb-2">
                                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg">
                                        <Activity className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Health Monitoring</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Track vital signs, activity levels, and health metrics to ensure your pet stays
                                        in optimal condition.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-2 border-transparent transition-all hover:shadow-md">
                                <CardHeader className="pb-2">
                                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg ">
                                        <Calendar className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Appointment Scheduling</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Easily book and manage veterinary appointments, vaccinations, and check-ups in
                                        one place.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-2 border-transparent transition-all hover:shadow-md">
                                <CardHeader className="pb-2">
                                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg ">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Medical Records</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Store and access your pet&apos;s complete medical history, vaccinations, and
                                        treatment plans securely.
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="border-2 border-transparent transition-all hover:shadow-md">
                                <CardHeader className="pb-2">
                                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg ">
                                        <Star className="h-6 w-6" />
                                    </div>
                                    <CardTitle>Vet Consultations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        Connect with licensed veterinarians through chats for quick advice and
                                        consultations.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 flex justify-center">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <Badge variant="outline">Testimonials</Badge>
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                                    Trusted by pet owners everywhere
                                </h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                                    See what our users have to say about how our platform has helped them care for their
                                    pets.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <Image
                                            src="/placeholder.svg?height=40&width=40"
                                            width={40}
                                            height={40}
                                            alt="User avatar"
                                            className="rounded-full"
                                        />
                                        <div>
                                            <CardTitle className="text-base">Sarah Johnson</CardTitle>
                                            <CardDescription>Dog Owner</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        &quot;The health monitoring features have been a lifesaver for my senior dog. I
                                        can track his medication and share reports directly with our vet.&quot;
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <div className="flex ">
                                        <Star className=" h-4 w-4" />
                                        <Star className=" h-4 w-4" />
                                        <Star className=" h-4 w-4" />
                                        <Star className=" h-4 w-4" />
                                        <Star className=" h-4 w-4" />
                                    </div>
                                </CardFooter>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <Image
                                            src="/placeholder.svg?height=40&width=40"
                                            width={40}
                                            height={40}
                                            alt="User avatar"
                                            className="rounded-full"
                                        />
                                        <div>
                                            <CardTitle className="text-base">Michael Rodriguez</CardTitle>
                                            <CardDescription>Cat Owner</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        &quot;The appointment scheduling and reminders ensure I never miss a vaccination
                                        or check-up for my three cats. Absolutely essential!&quot;
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <div className="flex ">
                                        <Star className=" h-4 w-4" />
                                        <Star className=" h-4 w-4" />
                                        <Star className=" h-4 w-4" />
                                        <Star className=" h-4 w-4" />
                                        <Star className=" h-4 w-4" />
                                    </div>
                                </CardFooter>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <Image
                                            src="/placeholder.svg?height=40&width=40"
                                            width={40}
                                            height={40}
                                            alt="User avatar"
                                            className="rounded-full"
                                        />
                                        <div>
                                            <CardTitle className="text-base">Emily Chen</CardTitle>
                                            <CardDescription>Veterinarian</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">
                                        &quot;As a vet, I recommend this platform to all my clients. The detailed health
                                        records and monitoring make my job easier and improve pet care.&quot;
                                    </p>
                                </CardContent>
                                <CardFooter>
                                    <div className="flex ">
                                        <Star className=" h-4 w-4" />
                                        <Star className=" h-4 w-4" />
                                        <Star className=" h-4 w-4" />
                                        <Star className=" h-4 w-4" />
                                        <Star className=" h-4 w-4" />
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 flex justify-center">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <Badge variant="outline">Pricing</Badge>
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                                    Simple, transparent pricing
                                </h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                                    Choose the plan that&apos;s right for you and your pets.
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto max-w-5xl py-12">
                            <Tabs defaultValue="monthly" className="w-full">
                                <div className="flex justify-center mb-8">
                                    <TabsList>
                                        <TabsTrigger value="monthly">Monthly</TabsTrigger>
                                        <TabsTrigger value="annually">Annually (Save 20%)</TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="monthly">
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        <Card className="flex flex-col">
                                            <CardHeader>
                                                <CardTitle>Basic</CardTitle>
                                                <CardDescription>For single pet owners</CardDescription>
                                                <div className="mt-4 flex items-baseline text-5xl font-bold">
                                                    $9
                                                    <span className="ml-1 text-xl font-normal text-muted-foreground">
                                                        /month
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-1">
                                                <ul className="space-y-2">
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>1 pet profile</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Basic health monitoring</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Appointment scheduling</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Medication reminders</span>
                                                    </li>
                                                </ul>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="w-full">Get Started</Button>
                                            </CardFooter>
                                        </Card>
                                        <Card className="flex flex-col border-2 border-teal-500 shadow-lg">
                                            <CardHeader>
                                                <div className="flex justify-between items-center">
                                                    <CardTitle>Premium</CardTitle>
                                                    <Badge className="bg-teal-500">Popular</Badge>
                                                </div>
                                                <CardDescription>For multi-pet households</CardDescription>
                                                <div className="mt-4 flex items-baseline text-5xl font-bold">
                                                    $19
                                                    <span className="ml-1 text-xl font-normal text-muted-foreground">
                                                        /month
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-1">
                                                <ul className="space-y-2">
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Up to 5 pet profiles</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Advanced health monitoring</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Unlimited appointment scheduling</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Video consultations (2/month)</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Personalized wellness plans</span>
                                                    </li>
                                                </ul>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="w-full">Get Started</Button>
                                            </CardFooter>
                                        </Card>
                                        <Card className="flex flex-col">
                                            <CardHeader>
                                                <CardTitle>Professional</CardTitle>
                                                <CardDescription>For breeders & professionals</CardDescription>
                                                <div className="mt-4 flex items-baseline text-5xl font-bold">
                                                    $49
                                                    <span className="ml-1 text-xl font-normal text-muted-foreground">
                                                        /month
                                                    </span>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="flex-1">
                                                <ul className="space-y-2">
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Unlimited pet profiles</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Premium health analytics</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Client management tools</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Unlimited video consultations</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Priority support</span>
                                                    </li>
                                                </ul>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="w-full">Get Started</Button>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                </TabsContent>
                                <TabsContent value="annually">
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        <Card className="flex flex-col">
                                            <CardHeader>
                                                <CardTitle>Basic</CardTitle>
                                                <CardDescription>For single pet owners</CardDescription>
                                                <div className="mt-4 flex items-baseline text-5xl font-bold">
                                                    $7
                                                    <span className="ml-1 text-xl font-normal text-muted-foreground">
                                                        /month
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Billed annually ($84)</p>
                                            </CardHeader>
                                            <CardContent className="flex-1">
                                                <ul className="space-y-2">
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>1 pet profile</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Basic health monitoring</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Appointment scheduling</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Medication reminders</span>
                                                    </li>
                                                </ul>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="w-full">Get Started</Button>
                                            </CardFooter>
                                        </Card>
                                        <Card className="flex flex-col border-2 border-teal-500 shadow-lg">
                                            <CardHeader>
                                                <div className="flex justify-between items-center">
                                                    <CardTitle>Premium</CardTitle>
                                                    <Badge className="bg-teal-500">Popular</Badge>
                                                </div>
                                                <CardDescription>For multi-pet households</CardDescription>
                                                <div className="mt-4 flex items-baseline text-5xl font-bold">
                                                    $15
                                                    <span className="ml-1 text-xl font-normal text-muted-foreground">
                                                        /month
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Billed annually ($180)</p>
                                            </CardHeader>
                                            <CardContent className="flex-1">
                                                <ul className="space-y-2">
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Up to 5 pet profiles</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Advanced health monitoring</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Unlimited appointment scheduling</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Video consultations (2/month)</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Personalized wellness plans</span>
                                                    </li>
                                                </ul>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="w-full">Get Started</Button>
                                            </CardFooter>
                                        </Card>
                                        <Card className="flex flex-col">
                                            <CardHeader>
                                                <CardTitle>Professional</CardTitle>
                                                <CardDescription>For breeders & professionals</CardDescription>
                                                <div className="mt-4 flex items-baseline text-5xl font-bold">
                                                    $39
                                                    <span className="ml-1 text-xl font-normal text-muted-foreground">
                                                        /month
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Billed annually ($468)</p>
                                            </CardHeader>
                                            <CardContent className="flex-1">
                                                <ul className="space-y-2">
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Unlimited pet profiles</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Premium health analytics</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Client management tools</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Unlimited video consultations</span>
                                                    </li>
                                                    <li className="flex items-center">
                                                        <CheckCircle2 className="mr-2 h-4 w-4 " />
                                                        <span>Priority support</span>
                                                    </li>
                                                </ul>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="w-full">Get Started</Button>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full py-12 md:py-24 lg:py-32 bg-teal-50 flex justify-center">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                                    Ready to provide the best care for your pet?
                                </h2>
                                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                    Join thousands of pet owners who trust our platform for their pet&apos;s healthcare
                                    needs.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                <Button>Start Your Free Trial</Button>
                                <Button variant="outline">Schedule a Demo</Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full border-t bg-background py-6 flex justify-center">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-4">
                            <div className="flex gap-2 items-center">
                                <PawPrint className="h-6 w-6 " />
                                <span className="font-bold text-xl">PetCare</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Comprehensive healthcare monitoring for your beloved pets.
                            </p>
                            <div className="flex space-x-4">
                                <Link href="#" className="text-muted-foreground hover:text-foreground">
                                    <span className="sr-only">Twitter</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                    >
                                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                    </svg>
                                </Link>
                                <Link href="#" className="text-muted-foreground hover:text-foreground">
                                    <span className="sr-only">Instagram</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                    >
                                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                                    </svg>
                                </Link>
                                <Link href="#" className="text-muted-foreground hover:text-foreground">
                                    <span className="sr-only">Facebook</span>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-5 w-5"
                                    >
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                                        Careers
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                                        Press
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                                        Blog
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium">Resources</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                                        Pet Health Guides
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                                        Veterinary Network
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                                        Support Center
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                                        FAQs
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                                        Terms of Service
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                                        Cookie Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                                        Data Processing
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} PetCare. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
