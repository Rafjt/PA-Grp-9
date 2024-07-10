import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchReservationByBailleur } from '../services';

const localizer = momentLocalizer(moment);

const EventComponent = ({ event }) => (
    <div>
        <strong>{event.title}</strong>
        <p>{event.statut}</p>
        <p>{event.prix}</p>
    </div>
);

const MyCalendar = () => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null); 

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await fetchReservationByBailleur();
                console.log(data);
                const formattedEvents = data.map((reservation) => ({
                    title: reservation.nomBien,
                    start: new Date(reservation.dateDebut),
                    end: new Date(reservation.dateFin),
                    statut: reservation.statut,
                    prix: reservation.prix,
                }));
                setEvents(formattedEvents);
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
                onSelectEvent={event => setSelectedEvent(event)}
                components={{
                    event: EventComponent,
                }}
            />
            {selectedEvent && ( 
                <div>
                    <strong>{selectedEvent.title}</strong>
                    <p>{selectedEvent.statut}</p>
                    <p>{selectedEvent.prix}</p>
                    <p>{selectedEvent.description}</p>
                </div>
            )}
        </div>
    );
};

export default MyCalendar;