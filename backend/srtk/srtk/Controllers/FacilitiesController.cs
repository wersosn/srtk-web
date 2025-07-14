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

        // Pobranie wszystkich obiektów:
        [HttpGet]
        public async Task<ActionResult<List<Facility>>> GetAllFacilities()
        {
            var facilities = await context.Facilities.ToListAsync();
            return facilities;
        }

        // Pobranie konkretnego obiektu:
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

        // Dodanie nowego obiektu:
        [HttpPost]
        public async Task<ActionResult<Facility>> AddFacility(Facility facility)
        {
            context.Facilities.Add(facility);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetFacilityById), new { id = facility.Id }, facility);
        }

        // Edycja istniejącego obiektu:
        [HttpPut("{id}")]
        public async Task<ActionResult<Facility>> EditFacility(int id, Facility updatedFacility)
        {
            if (id != updatedFacility.Id)
            {
                return BadRequest("Id w adresie i obiekcie nie są takie same");
            }

            var facility = await context.Facilities.FindAsync(id);
            if (facility == null)
            {
                return NotFound();
            }

            facility.Name = updatedFacility.Name;
            facility.City = updatedFacility.City;
            facility.Address = updatedFacility.Address;
            await context.SaveChangesAsync();
            return Ok(facility);
        }

        // Usunięcie istniejącego obiektu:
        [HttpDelete("{id}")]
        public async Task<ActionResult<Facility>> DeleteFacility(int id)
        {
            var facility = await context.Facilities.FindAsync(id);
            if (facility == null)
            {
                return NotFound();
            }
            context.Facilities.Remove(facility);
            await context.SaveChangesAsync();
            return Ok(new { message = "Obiekt został usunięty" });
        }
    }
}
