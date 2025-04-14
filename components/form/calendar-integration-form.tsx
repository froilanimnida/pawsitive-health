"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    Switch,
    Button,
    Alert,
    AlertTitle,
    AlertDescription,
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui";
import { Calendar, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { updateCalendarIntegration, synchronizeAllAppointments } from "@/actions";
import { GoogleCalendarSchema } from "@/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
interface CalendarIntegrationState {
    connected: boolean;
    syncEnabled: boolean;
    lastSynced: string | null;
}

export default function CalendarIntegrationForm({ connected, userId }: { connected: boolean; userId: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const [connectLoading, setConnectLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const [state, setState] = useState<CalendarIntegrationState>({
        connected,
        syncEnabled: connected,
        lastSynced: null,
    });

    const searchParams = useSearchParams();
    // Handle redirect params from OAuth callback
    useEffect(() => {
        const error = searchParams.get("error");
        const connected = searchParams.get("connected");
        if (error) {
            toast.error(
                error === "auth_failed" ? "Google authorization failed" : "Error connecting to Google Calendar",
            );
        }

        if (connected === "true") {
            setState((prev) => ({
                ...prev,
                connected: true,
                syncEnabled: true,
                lastSynced: new Date().toISOString(),
            }));
            toast.success("Successfully connected to Google Calendar!");
        }
    }, [searchParams]);

    // Fetch user settings on component mount to get the last_sync time
    useEffect(() => {
        if (connected) {
            const fetchLastSync = async () => {
                try {
                    const response = await fetch("/api/user/calendar-settings");
                    if (response.ok) {
                        const data = await response.json();
                        if (data.lastSync) {
                            setState((prev) => ({
                                ...prev,
                                lastSynced: data.lastSync,
                            }));
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch calendar settings:", error);
                }
            };

            fetchLastSync();
        }
    }, [connected]);

    const googleCalendarForm = useForm({
        resolver: zodResolver(GoogleCalendarSchema),
        defaultValues: {
            google_calendar_sync: connected,
            google_calendar_token: "",
            user_id: userId,
        },
    });

    async function handleConnect() {
        setConnectLoading(true);

        try {
            // Generate a secure state parameter for CSRF protection
            const state = Math.random().toString(36).substring(2);

            // Store state in session storage for verification on callback
            sessionStorage.setItem("googleCalendarOAuthState", state);

            // Create Google OAuth URL
            const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

            // Check if client ID is available
            if (!GOOGLE_CLIENT_ID) {
                console.error("Google Client ID is not configured");
                toast.error("Google Calendar integration is not properly configured");
                setConnectLoading(false);
                return;
            }

            authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
            authUrl.searchParams.append("redirect_uri", `${window.location.origin}/api/auth/google-calendar/callback`);
            authUrl.searchParams.append("response_type", "code");
            authUrl.searchParams.append("scope", "https://www.googleapis.com/auth/calendar.events");
            authUrl.searchParams.append("access_type", "offline");
            authUrl.searchParams.append("prompt", "consent"); // Force refresh token
            authUrl.searchParams.append("state", state);
            window.location.href = authUrl.toString();
        } catch (error) {
            console.error("Google Calendar connection error:", error);
            toast.error("Failed to connect to Google Calendar");
            setConnectLoading(false);
        }
    }

    async function handleDisconnect() {
        setConnectLoading(true);

        try {
            const result = await updateCalendarIntegration({ syncEnabled: false });

            if (!result.success) {
                throw new Error(result.error);
            }

            setState({
                connected: false,
                syncEnabled: false,
                lastSynced: null,
            });

            toast.success("Disconnected from Google Calendar");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to disconnect from Google Calendar");
        } finally {
            setConnectLoading(false);
        }
    }

    async function handleSync() {
        setSyncLoading(true);

        try {
            const result = await synchronizeAllAppointments();

            if (!result.success) {
                throw new Error(result.error);
            }

            setState({
                ...state,
                lastSynced: new Date().toISOString(),
            });

            const syncMessage = `Sync completed: ${result.synced} appointment${result.synced === 1 ? "" : "s"} added, ${result.skipped} unchanged`;
            toast.success(syncMessage);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to sync appointments with Google Calendar");
        } finally {
            setSyncLoading(false);
        }
    }

    async function onSubmit() {
        setIsLoading(true);

        try {
            const result = await updateCalendarIntegration({
                syncEnabled: state.syncEnabled,
                token: state.connected ? JSON.stringify(state) : undefined,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            setState({
                ...state,
                lastSynced: new Date().toISOString(),
            });

            toast.success("Calendar integration settings saved successfully!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to save calendar integration settings");
        } finally {
            setIsLoading(false);
        }
    }

    function handleSyncToggle(value: boolean) {
        setState({
            ...state,
            syncEnabled: value,
        });
    }

    // Format the last synced time
    const formattedLastSynced = state.lastSynced
        ? `Last synced ${formatDistanceToNow(new Date(state.lastSynced), { addSuffix: true })}`
        : "Not synced yet";

    return (
        <Form {...googleCalendarForm}>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }}
                className="space-y-6"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium">Google Calendar</h4>
                            <p className="text-sm text-muted-foreground">
                                Sync your pet appointments with Google Calendar
                            </p>
                        </div>
                        {!state.connected ? (
                            <Button
                                type="button"
                                onClick={handleConnect}
                                disabled={connectLoading}
                                className="flex items-center gap-2"
                            >
                                <Calendar className="h-4 w-4" />
                                {connectLoading ? "Connecting..." : "Connect"}
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDisconnect}
                                disabled={connectLoading}
                                className="flex items-center gap-2"
                            >
                                Disconnect
                            </Button>
                        )}
                    </div>

                    {state.connected && (
                        <>
                            <FormField
                                name="syncEnabled"
                                render={() => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Automatic Synchronization</FormLabel>
                                            <FormDescription>
                                                Automatically sync new appointments to your Google Calendar
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={state.syncEnabled}
                                                onCheckedChange={handleSyncToggle}
                                                aria-readonly
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-between mt-4">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <RefreshCw className="h-4 w-4" />
                                            {formattedLastSynced}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {state.lastSynced
                                            ? new Date(state.lastSynced).toLocaleString()
                                            : "No sync history"}
                                    </TooltipContent>
                                </Tooltip>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSync}
                                    disabled={syncLoading || !state.syncEnabled}
                                    className="flex items-center gap-2"
                                >
                                    {syncLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="h-4 w-4" />
                                    )}
                                    {syncLoading ? "Syncing..." : "Sync Now"}
                                </Button>
                            </div>

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Privacy Notice</AlertTitle>
                                <AlertDescription>
                                    We will only sync your pet appointments with your Google Calendar. We don&apos;t
                                    read or modify any existing events.
                                </AlertDescription>
                            </Alert>
                        </>
                    )}
                </div>

                {state.connected && (
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Saving..." : "Save Settings"}
                    </Button>
                )}
            </form>
        </Form>
    );
}
