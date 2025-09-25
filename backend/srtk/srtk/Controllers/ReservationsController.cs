using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Office2019.Presentation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly ReservationService service;
        private readonly TrackService trackService;
        private readonly ILogger<ReservationsController> logger;

        public ReservationsController(ReservationService service, TrackService trackService, ILogger<ReservationsController> logger)
        {
            this.service = service;
            this.trackService = trackService;
            this.logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<ReservationDto>>> GetAllReservations()
        {
            var reservations = await service.GetAll();
            logger.LogInformation("Pobrano wszystkie rezerwacje, ilość: {Count}", reservations.Count);
            return Ok(reservations);
        }

        [HttpGet("inTrack")]
        public async Task<ActionResult<List<ReservationDto>>> GetAllReservationsInTrack(int trackId)
        {
            var reservations = await service.GetAllInTrack(trackId);
            logger.LogInformation("Pobrano wszystkie rezerwacje należące do toru {TrackId}, ilość: {Count}", trackId, reservations.Count);
            return Ok(reservations);
        }

        [HttpGet("withStatus")]
        public async Task<ActionResult<List<ReservationDto>>> GetAllReservationsWithStatus(int statusId)
        {
            var reservations = await service.GetAllWithStatus(statusId);
            logger.LogInformation("Pobrano wszystkie rezerwacje ze statusem {StatusId}, ilość: {Count}", statusId, reservations.Count);
            return Ok(reservations);
        }

        [HttpGet("user")]
        public async Task<ActionResult<List<ReservationDto>>> GetAllUserReservations(int userId)
        {
            var reservations = await service.GetUserReservations(userId);
            logger.LogInformation("Pobrano wszystkie rezerwacje należące do użytkownika {UserId}, ilość: {Count}", userId, reservations.Count);
            return Ok(reservations);
        }

        [HttpGet("equipments")]
        public async Task<ActionResult<List<EquipmentReservationDto>>> GetEquipmentsInReservation([FromQuery] int reservationId)
        {
            var reservations = await service.GetEquipments(reservationId);
            logger.LogInformation("Pobrano wszystkie sprzęty należące do rezerwacji {ReservationId}, ilość: {Count}", reservationId, reservations.Count);
            return Ok(reservations);
        }

        [HttpGet("startDateTime")]
        public async Task<ActionResult<List<ReservationDto>>> GetReservationsByStartDateAndHour(DateTime date, TimeSpan hour)
        {
            var reservations = await service.GetByStartDateAndHour(date, hour);
            logger.LogInformation("Pobrano wszystkie rezerwacje rozpoczynające się w dniu {Date} i godzinie {Hour}, ilość: {Count}", date, hour, reservations.Count);
            return Ok(reservations);
        }

        [HttpGet("endDateTime")]
        public async Task<ActionResult<List<ReservationDto>>> GetReservationsByEndDateAndHour(DateTime date, TimeSpan hour)
        {
            var reservations = await service.GetByEndDateAndHour(date, hour);
            logger.LogInformation("Pobrano wszystkie rezerwacje kończące się w dniu {Date} i godzinie {Hour}, ilość: {Count}", date, hour, reservations.Count);
            return Ok(reservations);
        }

        [HttpGet("isAvailable")]
        public async Task<IActionResult> CheckAvailability(int trackId, DateTime start, DateTime end, int? reservationId = null)
        {
            var isAvailable = await service.IsTrackAvailable(trackId, start.ToUniversalTime(), end.ToUniversalTime(), reservationId);
            logger.LogInformation("Sprawdzono dostępność toru do dokonania rezerwacji, czy termin jest dostępny: {IsAvailable}", isAvailable);
            return Ok(new { isAvailable });
        }

        [HttpGet("upcoming/{userId}")]
        public async virtual Task<ActionResult<List<ReservationDto>>> GetUpcomingUserReservations(int userId)
        {
            var reservations = await service.GetUpcomingReservations(userId);
            logger.LogInformation("Pobrano wszystkie nadchodzące rezerwacje należące do użytkownika {UserId}, ilość: {Count}", userId, reservations.Count);
            return Ok(reservations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Reservation>> GetReservationById(int id)
        {
            var reservation = await service.GetById(id);
            if (reservation == null)
            {
                logger.LogWarning("Nie znaleziono rezerwacji z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Znaleziono rezerwację z Id {Id}: {Start} - {End}", id, reservation.Start, reservation.End);
            return Ok(reservation);
        }

        [HttpPost]
        public async Task<ActionResult<Reservation>> AddReservation(Reservation reservation)
        {
            var language = Request.Headers["X-Language"].FirstOrDefault() ?? "pl";
            try
            {
                var r = await service.Add(reservation, language);
                logger.LogInformation("Dodano nową rezerwację toru {TrackId}:  {Start} - {End}", r.TrackId, r.Start, r.End);
                return CreatedAtAction(nameof(GetReservationById), new { id = r.Id }, r);
            }
            catch (DbUpdateException)
            {
                logger.LogWarning("Próba rezerwacji toru na zajęty już czas");
                return Conflict("Tor jest już zarezerwowany w tym czasie! Wybierz inny czas!");
            }
            catch (Exception ex)
            {
                if (ex.InnerException is DbUpdateException)
                {
                    logger.LogWarning("Próba rezerwacji toru na zajęty już czas - konflikt");
                    return Conflict("Tor został już zarezerwowany w tym czasie! Wybierz inny czas!");
                }
                logger.LogWarning("Próba rezerwacji toru na zajęty już czas");
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateReservation(int id, [FromBody] ReservationDto dto)
        {
            var language = Request.Headers["X-Language"].FirstOrDefault() ?? "pl";
            var reservation = await service.Update(id, dto, User.IsInRole("Admin") ? "Admin" : "Client", language);
            if (reservation == null)
            {
                logger.LogWarning("Nie znaleziono rezerwacji z Id {Id}", id);
                return NotFound("Rezerwacja nie istnieje");
            }
            logger.LogInformation("Zmodyfikowano rezerwację z Id {Id}, toru {TrackName}: {Start} - {End}", id, dto.TrackName, dto.Start, dto.End);
            return Ok(reservation);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Reservation>> DeleteReservation(int id)
        {
            var reservation = await service.Delete(id);
            if (!reservation)
            {
                logger.LogWarning("Nie znaleziono rezerwacji z Id {Id}", id);
                return NotFound("Rezerwacja nie istnieje");
            }
            logger.LogInformation("Usunięto rezerwację z Id {Id}", id);
            return Ok(new { message = "Rezerwacja została usunięta" });
        }

        [HttpPut("{id}/cancel")]
        public async Task<ActionResult> CancelReservation(int id)
        {
            var reservation = await service.Cancel(id);
            if (!reservation)
            {
                logger.LogWarning("Nie znaleziono rezerwacji z Id {Id}", id);
                return NotFound("Rezerwacja nie istnieje");
            }
            logger.LogInformation("Anulowano rezerwację z Id {Id}", id);
            return Ok(new { message = "Rezerwacja została anulowana" });
        }

        [HttpGet("export")]
        public async Task<ActionResult<byte[]>> ExportReservationsToExcel(int trackId, string language = "pl")
        {
            var track = await trackService.GetById(trackId);
            if (track == null)
            {
                logger.LogWarning("Nie znaleziono toru z Id {TrackId}", trackId);
                return NotFound("Tor nie istnieje");
            }

            var title = language == "en" ? "Reservations" : "Rezerwacje";
            var fileBytes = await service.ExportToExcel(trackId, language);
            var fileName = $"{title}_{track.Name}.xlsx";
            logger.LogInformation("Wyeksportowano rezerwacje toru z Id {Id}", track.Id);
            return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        [HttpGet("exportPdf")]
        public async Task<ActionResult<byte[]>> ExportReservationToPdf(int reservationId, string language = "pl")
        {
            var reservation = await service.GetById(reservationId);
            if (reservation == null)
            {
                logger.LogWarning("Nie znaleziono rezerwacji z Id {ReservationId}", reservationId);
                return NotFound("Rezerwacja nie istnieje");
            }

            var title = language == "en" ? "Track_reservation" : "Rezerwacja_toru";
            var fileBytes = await service.ExportToPdf(reservationId, language);
            var fileName = $"{title}_{reservation.Track?.Name}.pdf";
            logger.LogInformation("Wyeksportowano rezerwację z Id {Id}", reservation.Id);
            return File(fileBytes, "application/pdf", fileName);
        }
    }
}
