import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchReservationByBailleur } from '../services';

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await fetchReservationByBailleur();
                const formattedEvents = data.map((reservation) => ({
                    title: reservation.nomBien,
                    start: new Date(reservation.dateDebut),
                    end: new Date(reservation.dateFin),
                }));
                setEvents(formattedEvents);
                console.log(formattedEvents);
            } catch (error) {
                console.log(error);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div style={{ height: 700 }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
            />
        </div>
    );
};

export default MyCalendar;