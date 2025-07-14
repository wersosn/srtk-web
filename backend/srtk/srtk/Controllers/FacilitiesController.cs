using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.Models;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FacilitiesController : ControllerBase
    {
        private readonly AppDbContext context;

        public FacilitiesController(AppDbContext context)
        {
            this.context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<Facility>>> GetAllFacilities()
        {
            var facilities = await context.Facilities.ToListAsync();
            return facilities;
        }

        [HttpPost]
        public async Task<ActionResult<Facility>> AddFacility(Facility facility)
        {
            context.Facilities.Add(facility);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetFacilityById), new { id = facility.Id }, facility);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Facility>> GetFacilityById(int id)
        {
            var facility = await context.Facilities.FindAsync(id);
            if (facility == null)
            {
                return NotFound();
            }
            return facility;
        }
    }
}
