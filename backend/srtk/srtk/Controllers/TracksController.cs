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

        [HttpGet]
        public async Task<ActionResult<List<TrackDto>>> GetAllTracks()
        {
            var tracks = await service.GetAll();
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
                    return BadRequest("Nieprawidłowy FacilityId w tokenie");
                }
            }
            return Ok(tracks);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TrackDto>> GetTrackById(int id)
        {
            var track = await service.GetById(id);
            if (track == null)
            {
                return NotFound();
            }
            return Ok(track);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TrackDto>> AddTrack(TrackDto track)
        {
            var t = await service.Add(track);
            return CreatedAtAction(nameof(GetTrackById), new { id = t.Id }, t);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TrackDto>> UpdateTrack(int id, [FromBody] TrackDto dto)
        {
            var track = await service.Update(id, dto);
            if (track == null)
            {
                return NotFound("Tor nie istnieje");
            }
            return Ok(track);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteTrack(int id)
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
