using DocumentFormat.OpenXml.InkML;
using Microsoft.AspNetCore.Authorization;
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
        private readonly TrackService trackService;

        public ReservationsController(ReservationService service, TrackService trackService)
        {
            this.service = service;
            this.trackService = trackService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ReservationDto>>> GetAllReservations()
        {
            var reservations = await service.GetAll();
            return reservations;
        }

        [HttpGet("inTrack")]
        public async Task<ActionResult<List<ReservationDto>>> GetAllReservationsInTrack(int trackId)
        {
            var reservations = await service.GetAllInTrack(trackId);
            return reservations;
        }

        [HttpGet("withStatus")]
        public async Task<ActionResult<List<ReservationDto>>> GetAllReservationsWithStatus(int statusId)
        {
            var reservations = await service.GetAllWithStatus(statusId);
            return reservations;
        }

        [HttpGet("user")]
        public async Task<ActionResult<List<ReservationDto>>> GetAllUserReservations(int userId)
        {
            var reservations = await service.GetUserReservations(userId);
            return reservations;
        }

        [HttpGet("equipments")]
        public async Task<ActionResult<List<EquipmentReservationDto>>> GetEquipmentsInReservation([FromQuery] int reservationId)
        {
            var reservations = await service.GetEquipments(reservationId);
            return reservations;
        }

        [HttpGet("startDateTime")]
        public async Task<ActionResult<List<ReservationDto>>> GetReservationsByStartDateAndHour(DateTime date, TimeSpan hour)
        {
            var reservations = await service.GetByStartDateAndHour(date, hour);
            return reservations;
        }

        [HttpGet("endDateTime")]
        public async Task<ActionResult<List<ReservationDto>>> GetReservationsByEndDateAndHour(DateTime date, TimeSpan hour)
        {
            var reservations = await service.GetByEndDateAndHour(date, hour);
            return reservations;
        }

        [HttpGet("isAvailable")]
        public async Task<IActionResult> CheckAvailability(int trackId, DateTime start, DateTime end, int? reservationId = null)
        {
            var isAvailable = await service.IsTrackAvailable(trackId, start.ToUniversalTime(), end.ToUniversalTime(), reservationId);
            return Ok(new { isAvailable });
        }

        [HttpGet("upcoming/{userId}")]
        public async virtual Task<ActionResult<List<ReservationDto>>> GetUpcomingUserNotifications(int userId)
        {
            var reservations = await service.GetUpcomingNotifications(userId);
            return reservations;
        }

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

        [HttpPost]
        public async Task<ActionResult<Reservation>> AddReservation(Reservation reservation)
        {
            try
            {
                var r = await service.Add(reservation);
                return CreatedAtAction(nameof(GetReservationById), new { id = r.Id }, r);
            }
            catch (DbUpdateException)
            {
                return Conflict("Tor jest już zarezerwowany w tym czasie! Wybierz inny czas!");
            }
            catch (Exception ex)
            {
                if (ex.InnerException is DbUpdateException)
                {
                    return Conflict("Tor został już zarezerwowany w tym czasie! Wybierz inny czas!");
                }
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReservation(int id, [FromBody] ReservationDto dto)
        {
            var reservation = await service.Update(id, dto, User.IsInRole("Admin") ? "Admin" : "Client");
            if (reservation == null)
            {
                return NotFound("Rezerwacja nie istnieje");
            }
            return Ok(reservation);
        }

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

        // Eksport danych w formacie .xlsx (dla administratora):
        [HttpGet("export")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<byte[]>> ExportReservationsToExcel(int trackId)
        {
            var track = await trackService.GetById(trackId);
            if (track == null)
            {
                return NotFound("Tor nie istnieje");
            }

            var fileBytes = await service.ExportToExcel(trackId);
            var fileName = $"Rezerwacje_{track.Name}.xlsx";

            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        // Eksport danych w formacie .pdf (dla użytkownika):
        [HttpGet("exportPdf")]
        public async Task<ActionResult<byte[]>> ExportReservationToPdf(int reservationId)
        {
            var reservation = await service.GetById(reservationId);
            if (reservation == null)
            {
                return NotFound("Rezerwacja nie istnieje");
            }

            var fileBytes = await service.ExportToPdf(reservationId);
            var fileName = $"Rezerwacja_toru_{reservation.Track?.Name}.pdf";

            return File(fileBytes, "application/pdf", fileName);
        }
    }
}
