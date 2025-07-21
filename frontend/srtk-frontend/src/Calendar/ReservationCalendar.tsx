import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/react/dist/vdom';
import './ReservationCalendar.css';

export default function ReservationCalendar() {
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Spotkanie',
      start: '2025-07-21T10:00:00',
      end: '2025-07-21T11:00:00',
    },
    {
      id: '2',
      title: 'Konferencja',
      start: '2025-07-25T14:00:00',
      end: '2025-07-25T15:30:00',
    },
  ]);

  function handleEventClick(clickInfo: any) {
    alert(`Kliknięto wydarzenie ID: ${clickInfo.event.id}`);
  }

  function handleDateSelect(selectInfo: any) {
    const title = prompt('Podaj tytuł rezerwacji');
    if (title) {
      const calendarApi = selectInfo.view.calendar;
      calendarApi.unselect();

      setEvents((prevEvents) => [
        ...prevEvents,
        {
          id: String(prevEvents.length + 1),
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay,
        },
      ]);
    }
  }

  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridDay"
        selectable={true}
        select={handleDateSelect}
        events={events}
        eventClick={handleEventClick}
        height="auto"
      />
    </div>
  );
}