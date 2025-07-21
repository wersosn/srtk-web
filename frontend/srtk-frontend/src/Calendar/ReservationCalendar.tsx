import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import '@fullcalendar/react/dist/vdom';

export default function ReservationCalendar() {
  const events = [
    { id: '1', title: 'Spotkanie', date: '2025-07-21' },
    { id: '2', title: 'Konferencja', date: '2025-07-25' },
  ];

  function handleEventClick(info: any) {
    alert(`Kliknięto wydarzenie ID: ${info.event.id}`);
  }

  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      events={events}
      eventClick={handleEventClick}
    />
  );
}
