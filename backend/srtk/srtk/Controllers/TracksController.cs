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

        public TracksController(TrackService service)
        {
            this.service = service;
        }

        // Pobranie wszystkich torów (ogółem):
        [HttpGet]
        public async Task<ActionResult<List<Track>>> GetAllTracks()
        {
            var tracks = await service.GetAll();
            return tracks;
        }

        // Pobieranie wszystkich torów należących do konkretnego obiektu:
        [HttpGet("inFacility")]
        public async Task<ActionResult<List<Track>>> GetAllTracksInFacility([FromQuery] int? facilityId)
        {
            List<Track> tracks;

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
                else if (int.TryParse(facilityIdClaim.Value, out int actualFacilityId))
                {
                    tracks = await service.GetAllInFacility(actualFacilityId);
                }
                else
                {
                    return BadRequest("Nieprawidłowy FacilityId w tokenie");
                }
            }
            return Ok(tracks);
        }

        // Pobranie konkretnego toru po Id:
        [HttpGet("{id}")]
        public async Task<ActionResult<Track>> GetTrackById(int id)
        {
            var track = await service.GetById(id);
            if (track == null)
            {
                return NotFound();
            }
            return track;
        }

        // Dodanie nowego toru:
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Track>> AddTrack(Track track)
        {
            var t = await service.Add(track);
            return CreatedAtAction(nameof(GetTrackById), new { id = t.Id }, t);
        }

        // Edycja istniejącego toru:
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTrack(int id, [FromBody] TrackDto dto)
        {
            var track = await service.Update(id, dto);
            if (track == null)
            {
                return NotFound("Tor nie istnieje");
            }
            return Ok(track);
        }

        // Usunięcie istniejącego toru:
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Track>> DeleteTrack(int id)
        {
            var track = await service.Delete(id);
            if (!track)
            {
                return NotFound();
            }
            return Ok(new { message = "Tor został usunięty" });
        }
    }
}
