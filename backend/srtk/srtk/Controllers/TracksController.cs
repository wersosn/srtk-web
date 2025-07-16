using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TracksController : ControllerBase
    {
        private readonly AppDbContext context;

        public TracksController(AppDbContext context)
        {
            this.context = context;
        }

        // Pobranie wszystkich torów (ogółem):
        [HttpGet]
        public async Task<ActionResult<List<Track>>> GetAllTracks()
        {
            var tracks = await context.Tracks.ToListAsync();
            return tracks;
        }

        // Pobieranie wszystkich torów należących do konkretnego obiektu:
        [HttpGet("facility/{facilityId}")]
        public async Task<ActionResult<List<Track>>> GetAllTracksInFacility(int facilityId)
        {
            var tracks = await context.Tracks.Where(t => t.FacilityId == facilityId).ToListAsync();
            return tracks;
        }

        // Pobranie konkretnego toru po Id:
        [HttpGet("{id}")]
        public async Task<ActionResult<Track>> GetTrackById(int id)
        {
            var track = await context.Tracks.FindAsync(id);
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
            context.Tracks.Add(track);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetTrackById), new { id = track.Id }, track);
        }

        // Edycja istniejącego toru:
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTrack(int id, [FromBody] TrackDto dto)
        {
            var track = await context.Tracks.FindAsync(id);
            if (track == null)
            {
                return NotFound("Tor nie istnieje");
            }
            track.Name = dto.Name;
            track.TypeOfSurface = dto.TypeOfSurface;
            track.Length = dto.Length;
            track.FacilityId = dto.FacilityId;
            await context.SaveChangesAsync();
            return Ok(track);
        }

        // Usunięcie istniejącego toru:
        [HttpDelete("{id}")]
        public async Task<ActionResult<Track>> DeleteTrack(int id)
        {
            var track = await context.Tracks.FindAsync(id);
            if (track == null)
            {
                return NotFound();
            }
            context.Tracks.Remove(track);
            await context.SaveChangesAsync();
            return Ok(new { message = "Tor został usunięty" });
        }
    }
}
