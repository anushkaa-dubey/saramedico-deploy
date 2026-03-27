"use client";

import { useEffect, useState, useRef } from "react";
import { fetchCalendarEvents } from "@/services/calendar";
import Alert from "./Alert";
import { Video } from "lucide-react";

export default function MeetingReminder() {
    const [upcomingMeeting, setUpcomingMeeting] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const shownReminders = useRef(new Set()); // Track IDs to avoid duplicate alerts in the same session

    useEffect(() => {
        const checkMeetings = async () => {
            try {
                // Fetch events for today (from now to end of day)
                const now = new Date();
                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999);

                const events = await fetchCalendarEvents({
                    start_date: now.toISOString(),
                    end_date: endOfDay.toISOString(),
                    event_type: "appointment"
                });

                if (Array.isArray(events)) {
                    const tenMinutesInMs = 10 * 60 * 1000;

                    for (const event of events) {
                        const startTime = new Date(event.start_time);
                        const diff = startTime.getTime() - now.getTime();

                        // If meeting starts within the next 10 minutes and hasn't been shown yet
                        if (diff > 0 && diff <= tenMinutesInMs) {
                            if (!shownReminders.current.has(event.id)) {
                                const minutesLeft = Math.round(diff / 60000);
                                setUpcomingMeeting({ ...event, minutesLeft });
                                setShowAlert(true);
                                shownReminders.current.add(event.id);
                                break; // Only show one reminder at a time
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to check upcoming meetings:", err);
            }
        };

        // Check every minute
        checkMeetings();
        const interval = setInterval(checkMeetings, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleJoin = () => {
        const link = upcomingMeeting?.appointment?.meet_link || upcomingMeeting?.appointment?.join_url;
        if (link) {
            window.open(link, "_blank");
        }
        setShowAlert(false);
    };

    if (!upcomingMeeting) return null;

    return (
        <Alert
            isOpen={showAlert}
            onClose={() => setShowAlert(false)}
            title="Meeting Reminder"
            message={`Your meeting "${upcomingMeeting.title}" starts in ${upcomingMeeting.minutesLeft || '10'} minutes!`}
            type="info"
            confirmText="Join Now"
            onConfirm={handleJoin}
            showCancel={true}
            cancelText="Dismiss"
        />
    );
}
