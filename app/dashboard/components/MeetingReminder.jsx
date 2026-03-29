"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { fetchCalendarEvents } from "@/services/calendar";
import Alert from "./Alert";
import { Video } from "lucide-react";

export default function MeetingReminder({ role = "patient" }) {
    const router = useRouter();
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
                    let activeEvent = null;
                    const shownKey = `shown_reminders_${role}`;
                    let shownIds = [];
                    try {
                        shownIds = JSON.parse(localStorage.getItem(shownKey) || "[]");
                    } catch (_) { }

                    for (const event of events) {
                        const startTime = new Date(event.start_time);
                        const diff = startTime.getTime() - now.getTime();
                        const minutesLeft = Math.round(diff / 60000);

                        // If meeting starts within the next 10 minutes, is active, and hasn't been shown yet
                        if (diff > 0 && diff <= tenMinutesInMs && event.status === 'scheduled') {
                            activeEvent = event;

                            const alreadyShown = shownIds.includes(event.id);

                            if (!alreadyShown) {
                                setUpcomingMeeting({ ...event, minutesLeft });
                                setShowAlert(true);
                                shownIds.push(event.id);
                                localStorage.setItem(shownKey, JSON.stringify(shownIds));
                                break;
                            } else if (upcomingMeeting && upcomingMeeting.id === event.id) {
                                setUpcomingMeeting(prev => ({ ...prev, minutesLeft }));
                                break;
                            }
                        }
                    }

                    // If we have no active meeting or the current one is no longer scheduled, clear state
                    if (!activeEvent || (upcomingMeeting && activeEvent.id !== upcomingMeeting.id)) {
                        const currentInEvents = events.find(e => upcomingMeeting && e.id === upcomingMeeting.id);
                        if (!currentInEvents || currentInEvents.status !== 'scheduled') {
                            setUpcomingMeeting(null);
                            setShowAlert(false);
                        }
                    }
                } else {
                    setUpcomingMeeting(null);
                    setShowAlert(false);
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
        
        // Open the meeting link in a new tab if it exists
        if (link) {
            window.open(link, "_blank");
        }

        // Redirect based on role in the current window
        if (role === 'doctor') {
            router.push("/dashboard/doctor/live-consult");
        } else {
            router.push("/dashboard/patient/appointments");
        }
        
        setShowAlert(false);
    };

    if (!upcomingMeeting) return null;

    const getAlertMessage = () => {
        if (role === 'doctor') {
            return `Upcoming patient consultation "${upcomingMeeting.title}" starts in ${upcomingMeeting.minutesLeft || '10'} minutes!`;
        }
        // Patient role
        return `Your doctor invite "${upcomingMeeting.title}" is scheduled in next ${upcomingMeeting.minutesLeft || '10'} minutes!`;
    };

    return (
        <Alert
            isOpen={showAlert}
            onClose={() => setShowAlert(false)}
            title="Meeting Reminder"
            message={getAlertMessage()}
            type="info"
            confirmText="Join Now"
            onConfirm={handleJoin}
            showCancel={true}
            cancelText="Dismiss"
        />
    );
}
