Mobile app: [Click here](https://github.com/wersosn/srtk-mobile)  
Version: [PL](#system-rezerwacji-toru-kolarskiego) | [ENG](#reservation-system-for-a-cycle-track) 

# System rezerwacji toru kolarskiego
Aplikacja jest systemem komputerowym służącym do dokonania rezerwacji toru kolarskiego. 
Celem całego systemu jest umożliwienie dokonania rezerwacji toru użytkownikom prywatnym. 
Składa się z następujących elementów: serwer w architekturze REST, aplikacja mobilna, aplikacja internetowa (każdy w dowolnej technologii). 
Główne funkcjonalności: logowanie i rejestracja, kalendarz dostępności, zarządzanie systemem i rezerwacjami, składanie rezerwacji na określoną porę i czas.

## Spis treści
- [Funkcjonalności](#funkcjonalności)
- [Wykorzystane technologie](#wykorzystane-technologie)
- [Instrukcja użytkowania](#instrukcja-użytkowania)

## Funkcjonalności
- Autentykacja i autoryzacja użytkownika z pomocą tokenów JWT
- Rezerwacja torów na określoną porę i czas, możliwość modyfikacji, anulowania oraz usunięcia rezerwacji + eksport szczegółów rezerwacji w formatach .xslx i .pdf
- Aktualizacja dostepu torów w czasie rzeczywistym
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

## Instrukcja użytkowania

---
# Reservation system for a cycle track
