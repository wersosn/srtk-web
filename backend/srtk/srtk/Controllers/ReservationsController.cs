using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly AppDbContext context;

        public ReservationsController(AppDbContext context)
        {
            this.context = context;
        }

        // Pobranie wszystkich rezerwacji (ogółem):
        [HttpGet]
        public async Task<ActionResult<List<Reservation>>> GetAllReservations()
        {
            var reservations = await context.Reservations.ToListAsync();
            return reservations;
        }

        // Pobieranie rezerwacji konkretnego toru:
        [HttpGet("track/{trackId}")]
        public async Task<ActionResult<List<Reservation>>> GetAllReservationsInTrack(int trackId)
        {
            var reservations = await context.Reservations.Where(r => r.TrackId == trackId).ToListAsync();
            return reservations;
        }

        // Pobieranie rezerwacji z konkretnym statusem rezerwacji:
        [HttpGet("status/{statusId}")]
        public async Task<ActionResult<List<Reservation>>> GetAllReservationsWithStatus(int statusId)
        {
            var reservations = await context.Reservations.Where(r => r.StatusId == statusId).ToListAsync();
            return reservations;
        }

        // Pobieranie rezerwacji konkretnego użytkownika:
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<List<Reservation>>> GetAllUserReservations(int userId)
        {
            var reservations = await context.Reservations.Where(r => r.UserId == userId).ToListAsync();
            return reservations;
        }

        // Pobieranie rezerwacji rozpoczynających się w określonym dniu i/lub godzinie:
        [HttpGet("startDateTime")]
        public async Task<ActionResult<List<Reservation>>> GetReservationsByStartDateAndHour(DateTime date, TimeSpan hour)
        {
            var reservations = await context.Reservations.Where(r => r.Start.Date == date.Date && r.Start.TimeOfDay == hour).ToListAsync();
            return reservations;
        }

        // Pobieranie rezerwacji kończących się w określonym dniu:
        [HttpGet("endDateTime")]
        public async Task<ActionResult<List<Reservation>>> GetReservationsByEndDateAndHour(DateTime date, TimeSpan hour)
        {
            var reservations = await context.Reservations.Where(r => r.End.Date == date.Date && r.End.TimeOfDay == hour).ToListAsync();
            return reservations;
        }

        // Pobieranie rezerwacji, które trwają w określonym przedziale czasowym - do znajdywania kolizji:
        [HttpGet("overlapping")]
        public async Task<ActionResult<List<Reservation>>> GetReservationsOverlapping(DateTime start, DateTime end)
        {
            var reservations = await context.Reservations
                .Where(r => r.Start < end && r.End > start) // Rezerwacje, które się nakładają
                .ToListAsync();
            return reservations;
        }

        // Pobranie konkretnej rezerwacji:
        [HttpGet("{id}")]
        public async Task<ActionResult<Reservation>> GetReservationById(int id)
        {
            var reservation = await context.Reservations.FindAsync(id);
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
            context.Reservations.Add(reservation);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetReservationById), new { id = reservation.Id }, reservation);
        }

        // Edycja istniejącej rezerwacji:
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReservation(int id, [FromBody] ReservationDto dto)
        {
            var reservation = await context.Reservations.Include(r => r.EquipmentReservations).FirstOrDefaultAsync(r => r.Id == id);
            if (reservation == null)
            {
                return NotFound("Rezerwacja nie istnieje");
            }

            // Aktualizacja głównych parametrów:
            reservation.Start = dto.Start;
            reservation.End = dto.End;
            reservation.TrackId = dto.TrackId;

            // Aktualizacja sprzętu oraz kosztów:
            if (dto.Equipment != null && dto.Equipment.Count != 0)
            {
                context.EquipmentReservations.RemoveRange(reservation.EquipmentReservations);
                double totalCost = 0;
                foreach (var equipmentDto in dto.Equipment)
                {
                    var equipment = await context.Equipments.FindAsync(equipmentDto.EquipmentId);
                    if (equipment == null)
                    {
                        return BadRequest($"Sprzęt z Id = {equipmentDto.EquipmentId} nie istnieje");
                    }

                    reservation.EquipmentReservations.Add(new EquipmentReservation
                    {
                        ReservationId = reservation.Id,
                        EquipmentId = equipmentDto.EquipmentId,
                        Quantity = equipmentDto.Quantity
                    });
                    totalCost += equipment.Cost * equipmentDto.Quantity;
                }
                reservation.Cost = totalCost;
            }
            await context.SaveChangesAsync();
            return Ok(reservation);
        }

        // Usunięcie istniejącej rezerwacji:
        [HttpDelete("{id}")]
        public async Task<ActionResult<Reservation>> DeleteReservation(int id)
        {
            var reservation = await context.Reservations.FindAsync(id);
            if (reservation == null)
            {
                return NotFound();
            }
            context.Reservations.Remove(reservation);
            await context.SaveChangesAsync();
            return Ok(new { message = "Rezerwacja została usunięta" });
        }
    }
}
