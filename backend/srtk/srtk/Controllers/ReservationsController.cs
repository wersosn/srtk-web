using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly ReservationService service;

        public ReservationsController(ReservationService service)
        {
            this.service = service;
        }

        // Pobranie wszystkich rezerwacji (ogółem):
        [HttpGet]
        public async Task<ActionResult<List<Reservation>>> GetAllReservations()
        {
            var reservations = await service.GetAll();
            return reservations;
        }

        // Pobieranie rezerwacji konkretnego toru:
        [HttpGet("inTrack")]
        public async Task<ActionResult<List<Reservation>>> GetAllReservationsInTrack(int trackId)
        {
            var reservations = await service.GetAllInTrack(trackId);
            return reservations;
        }

        // Pobieranie rezerwacji z konkretnym statusem rezerwacji:
        [HttpGet("withStatus")]
        public async Task<ActionResult<List<Reservation>>> GetAllReservationsWithStatus(int statusId)
        {
            var reservations = await service.GetAllWithStatus(statusId);
            return reservations;
        }

        // Pobieranie rezerwacji konkretnego użytkownika:
        [HttpGet("user")]
        public async Task<ActionResult<List<ReservationDto>>> GetAllUserReservations(int userId)
        {
            var reservations = await service.GetUserReservations(userId);
            return reservations;
        }

        // Pobieranie sprzętów z konkretnej rezerwacji:
        [HttpGet("equipments")]
        public async Task<ActionResult<List<EquipmentReservationDto>>> GetEquipmentsInReservation([FromQuery] int reservationId)
        {
            var reservations = await service.GetEquipments(reservationId);
            return reservations;
        }

        // Pobieranie rezerwacji rozpoczynających się w określonym dniu i/lub godzinie:
        [HttpGet("startDateTime")]
        public async Task<ActionResult<List<Reservation>>> GetReservationsByStartDateAndHour(DateTime date, TimeSpan hour)
        {
            var reservations = await service.GetByStartDateAndHour(date, hour);
            return reservations;
        }

        // Pobieranie rezerwacji kończących się w określonym dniu:
        [HttpGet("endDateTime")]
        public async Task<ActionResult<List<Reservation>>> GetReservationsByEndDateAndHour(DateTime date, TimeSpan hour)
        {
            var reservations = await service.GetByEndDateAndHour(date, hour);
            return reservations;
        }

        // Pobieranie rezerwacji, które trwają w określonym przedziale czasowym - do znajdywania kolizji:
        [HttpGet("isAvailable")]
        public async Task<IActionResult> CheckAvailability(int trackId, DateTime start, DateTime end, int? reservationId = null)
        {
            var isAvailable = await service.IsTrackAvailable(trackId, start.ToUniversalTime(), end.ToUniversalTime(), reservationId);
            return Ok(new { isAvailable });
        }

        // Pobranie konkretnej rezerwacji:
        [HttpGet("{id}")]
        public async Task<ActionResult<Reservation>> GetReservationById(int id)
        {
            var reservation = await service.GetById(id);
            if (reservation == null)
            {
                return NotFound();
            }
            return reservation;
        }

        // Dodanie nowej rezerwacji:
        [HttpPost]
        public async Task<ActionResult<Reservation>> AddReservation(Reservation reservation)
        {
            var r = await service.Add(reservation);
            return CreatedAtAction(nameof(GetReservationById), new { id = r.Id }, r);
        }

        // Edycja istniejącej rezerwacji:
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReservation(int id, [FromBody] ReservationDto dto)
        {
            var reservation = await service.Update(id, dto);
            if (reservation == null)
            {
                return NotFound("Rezerwacja nie istnieje");
            }
            return Ok(reservation);
        }

        // Usunięcie istniejącej rezerwacji:
        [HttpDelete("{id}")]
        public async Task<ActionResult<Reservation>> DeleteReservation(int id)
        {
            var reservation = await service.Delete(id);
            if (!reservation)
            {
                return NotFound();
            }
            return Ok(new { message = "Rezerwacja została usunięta" });
        }
    }
}
