using DocumentFormat.OpenXml.Office2010.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;
using System.Data;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TracksController : ControllerBase
    {
        private readonly TrackService service;
        private readonly ILogger<TracksController> logger;

        public TracksController(TrackService service, ILogger<TracksController> logger)
        {
            this.service = service;
            this.logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<List<TrackDto>>> GetAllTracks()
        {
            var tracks = await service.GetAll();
            logger.LogInformation("Pobrano wszystkie tory, ilość: {Count}", tracks.Count);
            return Ok(tracks);
        }

        [HttpGet("inFacility")]
        public async Task<ActionResult<List<TrackDto>>> GetAllTracksInFacility([FromQuery] int? facilityId)
        {
            List<TrackDto> tracks;

            if (facilityId.HasValue)
            {
                tracks = await service.GetAllInFacility(facilityId.Value);
            }
            else
            {
                var facilityIdClaim = User.Claims.FirstOrDefault(c => c.Type == "FacilityId");

                if (facilityIdClaim == null || string.IsNullOrEmpty(facilityIdClaim.Value))
                {
                    tracks = await service.GetAll();
                }
                else if (int.TryParse(facilityIdClaim.Value, out int adminFacilityId))
                {
                    tracks = await service.GetAllInFacility(adminFacilityId);
                }
                else
                {
                    logger.LogWarning("Nieprawidłowy FacilityId w tokenie");
                    return BadRequest("Nieprawidłowy FacilityId w tokenie");
                }
            }
            logger.LogInformation("Pobrano wszystkie tory w obiekcie z Id: {FacilityId}, ilość: {Count}", facilityId, tracks.Count);
            return Ok(tracks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TrackDto>> GetTrackById(int id)
        {
            var track = await service.GetById(id);
            if (track == null)
            {
                logger.LogWarning("Nie znaleziono toru z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Znaleziono tor z Id {Id}: {Name}", id, track.Name);
            return Ok(track);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TrackDto>> AddTrack(TrackDto dto)
        {
            var track = await service.Add(dto);
            logger.LogInformation("Dodano nowy tor: {Name}", track.Name);
            return CreatedAtAction(nameof(GetTrackById), new { id = track.Id }, track);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TrackDto>> UpdateTrack(int id, [FromBody] TrackDto dto)
        {
            var track = await service.Update(id, dto);
            if (track == null)
            {
                logger.LogWarning("Nie znaleziono toru z Id {Id}", id);
                return NotFound("Tor nie istnieje");
            }
            logger.LogInformation("Zmodyfikowano tor z Id {Id}: {Name}", id, dto.Name);
            return Ok(track);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteTrack(int id)
        {
            var track = await service.Delete(id);
            if (!track)
            {
                logger.LogWarning("Nie udało się usunąć toru z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Usunięto tor z Id {Id}", id);
            return Ok(new { message = "Tor został usunięty" });
        }
    }
}
