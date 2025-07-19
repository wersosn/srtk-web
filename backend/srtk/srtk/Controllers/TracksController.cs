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
        [HttpGet("facilities/{facilityId}/tracks")]
        public async Task<ActionResult<List<Track>>> GetAllTracksInFacility(int facilityId)
        {
            var tracks = await service.GetAllInFacility(facilityId);
            return tracks;
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
        public async Task<ActionResult<Track>> AddTrack(Track track)
        {
            var t = await service.Add(track);
            return CreatedAtAction(nameof(GetTrackById), new { id = t.Id }, t);
        }

        // Edycja istniejącego toru:
        [HttpPut("{id}")]
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
