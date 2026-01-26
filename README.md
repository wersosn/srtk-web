Mobile app: [Click here](https://github.com/wersosn/srtk-mobile)  
Version: [PL](#system-rezerwacji-toru-kolarskiego) | [ENG](#reservation-system-for-a-cycle-track) 

# System rezerwacji toru kolarskiego
Aplikacja jest systemem komputerowym służącym do dokonania rezerwacji toru kolarskiego. 
Celem całego systemu jest umożliwienie dokonania rezerwacji toru użytkownikom prywatnym. 
Składa się z następujących elementów: serwer w architekturze REST, aplikacja mobilna, aplikacja internetowa (każdy w dowolnej technologii). 
Główne funkcjonalności: logowanie i rejestracja, kalendarz dostępności, zarządzanie systemem i rezerwacjami, składanie rezerwacji na określoną porę i czas.

## Spis treści
- [Architektura systemu](#architektura-systemu)
- [Funkcjonalności](#funkcjonalności)
- [Wykorzystane technologie](#wykorzystane-technologie)
- [Instrukcja instalacji](#instrukcja-instalacji)
- [Instrukcja użytkowania](#instrukcja-użytkowania)

## Architektura systemu

## Funkcjonalności
- Autentykacja i autoryzacja użytkownika z pomocą tokenów JWT
- Rezerwacja torów na określoną porę i czas, możliwość modyfikacji, anulowania oraz usunięcia rezerwacji + eksport szczegółów rezerwacji w formatach .xslx i .pdf
- Aktualizacja dostępu torów w czasie rzeczywistym
- Przeglądanie rezerwacji w formie kalendarza - na stronie głównej oraz w zakładce 'Moje rezerwacje' z rezerwacjami danego użytkownika
- Historia rezerwacji w dedykowanej zakładce + opcje filtrowania
- Wysyłanie powiadomień w aplikacji
- Wysyłanie wiadomości mail, np. przy próbie resetu hasła
- Panel administratora, z podziałem na dwie role (superadmin oraz admin danego obiektu), w którym można zarządzać torami, sprzętem, użytkownikami itp.
- Logi administracyjne, do ewentualnego podglądu błędów
- Dwie wersje językowe (polska oraz angielska) + dwa tryby (jasny i ciemny)

## Wykorzystane technologie
*Backend (serwer REST API)*:
- C#
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- Swagger
- JWT (do autentykacji)
- CORS (dostęp do API dla frontendu)
- xUnit (testy jednostkowe)
- Serilog (logi)

*Frontend*:
- React + Vite
- TypeScript
- HTML, CSS
- Axios
- React Bootstrap
- FullCalendar
- i18n
- Playwright (testy e2e)

## Instrukcja instalacji

## Instrukcja użytkowania

---
# Reservation system for a cycle track
The application is a computer system used to make reservations for a cycling track. The purpose of the entire system is to enable private users to reserve the track.
It consists of the following components: a server based on REST architecture, a mobile application, and a web application (each implemented in any technology).
Main functionalities: login and registration, availability calendar, system and reservation management, and making reservations for a specific time and duration.

## Table of contents
- [System architecture](#system-architecture)
- [Functionalities](#functionalities)
- [Tech stack](#tech-stack)
- [Installation guide](#installation-guide)
- [How to use](#how-to-use)

## System architecture

## Functionalities
- User authentication and authorization using JWT tokens
- Track reservations for a specific time and duration, with the ability to modify, cancel, and delete reservations + export reservation details in .xslx and .pdf formats
- Real-time updates of track availability
- Viewing reservations in calendar form – on the home page and in the “My Reservations” tab with the user’s reservations
- Reservation history in a dedicated tab + filtering options
- Sending in-app notifications
- Sending email messages, e.g. during password reset attempts
- Administrator panel with two roles (superadmin and facility-specific admin), allowing management of tracks, equipment, users, etc.
- Administrative logs for potential error inspection
- Two language versions (Polish and English) + two modes (light and dark)

## Tech stack
*Backend (REST API server)*:
- C#
- ASP.NET Core Web API
- Entity Framework Core
- PostgreSQL
- Swagger
- JWT (authentication)
- CORS (API access for the frontend)
- xUnit (unit tests)
- Serilog (logs)

*Frontend*:
- React + Vite
- TypeScript
- HTML, CSS
- Axios
- React Bootstrap
- FullCalendar
- i18n
- Playwright (e2e tests)

## Installation guide

## How to use
