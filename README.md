Mobile app: [Click here](https://github.com/wersosn/srtk-mobile)  
Version: [PL](#system-rezerwacji-toru-kolarskiego) | [ENG](#reservation-system-for-a-cycle-track) 

# System rezerwacji toru kolarskiego
Aplikacja jest systemem komputerowym służącym do dokonania rezerwacji toru kolarskiego. 
Celem tego systemu jest umożliwienie dokonania rezerwacji toru użytkownikom prywatnym. 
Składa się on z następujących elementów: serwera w architekturze REST, aplikacji internetowej oraz aplikacji mobilnej. 
Główne funkcjonalności to: logowanie i rejestracja użytkownika, kalendarz dostępności toru, zarządzanie systemem (dla administratora) i rezerwacjami (dla użytkownika), a także składanie rezerwacji na określoną porę i czas.

## Spis treści
- [Funkcjonalności](#funkcjonalności)
- [Wykorzystane technologie](#wykorzystane-technologie)
- [Instrukcja instalacji](#instrukcja-instalacji)
- [Prezentacja aplikacji](#prezentacja-aplikacji)

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
### Serwer REST API:  
**1. Wymagania:**
- Zainstalowane [Visual Studio 2022](https://visualstudio.microsoft.com/downloads/) (lub nowsze) z obsługą .NET Core
- Zainstalowany [PostgreSQL](https://www.postgresql.org/download/)
- Konto z odpowiednimi uprawnieniami do tworzenia bazy danych i tabel

**2. Uruchomienie projektu:**
- Otwórz Visual Studio
- Wybierz 'Otwórz projekt/rozwiązanie' i wskaż plik .sln projektu backendowego
- Skonfiguruj połączenie z bazą danych w pliku appsettings.json:
```
"ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=srtk;Username=postgres;Password=password"
}
```
- W menu Build wybierz 'Build Solution', aby skompilować projekt
- Uruchom projekt przyciskiem 'Start' lub skrótem F5
- Po uruchomieniu serwera, API będzie dostępne pod adresem http://localhost:5048 wraz z dokumentacją Swagger pod http://localhost:5048/swagger

### Aplikacja internetowa:
**1. Wymagania:**
- Zainstalowany [Node.js](https://nodejs.org/en/download)
- Zainstalowany [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

**2. Instalacja i uruchomienie:**
- Otwórz terminal w katalogu projektu frontendowego
- Zainstaluj wszystkie zależności:
```
npm install
```
- Uruchom aplikację w trybie developerskim:
```
npm run dev
```
- Po uruchomieniu aplikacji, aplikacja będzie dostępna w przeglądarce pod adresem http://localhost:5173

## Prezentacja aplikacji
Strona główna:
![Strona główna](https://github.com/wersosn/srtk-web/blob/master/images/web-1.png)

Panel rejestracji:
![Panel rejestracji](https://github.com/wersosn/srtk-web/blob/master/images/web-2.png)

Formularz tworzenia nowej rezerwacji:
![Formularz tworzenia nowej rezerwacji](https://github.com/wersosn/srtk-web/blob/master/images/web-6.png)

Zakładka 'Moje rezerwacje':
![Zakładka moje rezerwacje](https://github.com/wersosn/srtk-web/blob/master/images/web-7.png)

Profil użytkownika:
![Profil użytkownika](https://github.com/wersosn/srtk-web/blob/master/images/web-9.png)

Panel administratorski - zakładka do zarządzania rezerwacjami:
![Panel administratorski](https://github.com/wersosn/srtk-web/blob/master/images/web-16.png)

---
# Reservation system for a cycle track
The application is a computer system designed for booking cycling tracks.
The purpose of this system is to allow private users to make track reservations.
It consists of the following components: a REST API server, a web application, and a mobile application.
The main functionalities include user login and registration, track availability calendar, system management (for administrators), reservation management (for users), and making reservations for a specific date and time.

## Table of contents
- [Functionalities](#functionalities)
- [Tech stack](#tech-stack)
- [Installation guide](#installation-guide)
- [Application preview](#application-preview)

## Functionalities
- User authentication and authorization using JWT tokens
- Track reservations for a specific time and duration, with the ability to modify, cancel, and delete reservations + export reservation details in .xslx and .pdf formats
- Real-time updates of track availability
- Viewing reservations in calendar form - on the home page and in the 'My Reservations' tab with the user's reservations
- Reservation history in a dedicated tab + filtering options
- Sending in-app notifications
- Sending email messages, e.g. during password reset attempts
- Administrator panel with two roles (superadmin and facility-specific admin), allowing management of tracks, equipment, users, etc.
- Administrative logs for potential error inspection
- Two language versions (Polish and English) + two UI modes (light and dark)

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
### REST API server:  
**1. Requirements:**
- Installed [Visual Studio 2022](https://visualstudio.microsoft.com/downloads/) (or newer) with .NET Core support
- Installed [PostgreSQL](https://www.postgresql.org/download/)
- Account with appropriate permissions to create databases and tables

**2. Running the project:**
- Open Visual Studio
- Select 'Open Project/Solution' and choose the backend .sln file
- Configure the database connection in appsettings.json:
```
"ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=srtk;Username=postgres;Password=password"
}
```
- In the Build menu, select 'Build Solution' to compile the project
- Run the project using the 'Start' button or F5
- After the server starts, the API will be available at http://localhost:5048 with Swagger documentation at http://localhost:5048/swagger

### Web application:
**1. Requirements:**
- Installed [Node.js](https://nodejs.org/en/download)
- Installed [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

**2. Instalacja i uruchomienie:**
- Open a terminal in the frontend project directory
- Install all dependencies:
```
npm install
```
- Run the application in development mode:
```
npm run dev
```
- After starting, the application will be accessible in the browser at http://localhost:5173

## Application preview
Homepage:
![Homepage](https://github.com/wersosn/srtk-web/blob/master/images/web-1.png)

Registration panel:
![Registration panel](https://github.com/wersosn/srtk-web/blob/master/images/web-2.png)

New reservation form:
![New reservation form](https://github.com/wersosn/srtk-web/blob/master/images/web-6.png)

'My Reservations' tab:
![My reservations tab](https://github.com/wersosn/srtk-web/blob/master/images/web-7.png)

User profile:
![User profile](https://github.com/wersosn/srtk-web/blob/master/images/web-9.png)

Admin panel — reservation management tab:
![Admin panel](https://github.com/wersosn/srtk-web/blob/master/images/web-16.png)
