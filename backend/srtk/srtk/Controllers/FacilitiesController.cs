using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Services;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FacilitiesController : ControllerBase
    {
        private readonly FacilityService service;
        public FacilitiesController(FacilityService service)
        {
            this.service = service;
        }

        // Pobranie wszystkich obiektów:
        [HttpGet]
        public async Task<ActionResult<List<Facility>>> GetAllFacilities()
        {
            var facilities = await service.GetAll();
            return facilities;
        }

        // Pobranie konkretnego obiektu:
        [HttpGet("{id}")]
        public async Task<ActionResult<Facility>> GetFacilityById(int id)
        {
            var facility = await service.GetById(id);
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
            var f = await service.Add(facility);
            return CreatedAtAction(nameof(GetFacilityById), new { id = f.Id }, f);
        }

        // Edycja istniejącego obiektu:
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFacility(int id, [FromBody] FacilityDto dto)
        {
            var facility = await service.Update(id, dto);
            if (facility == null)
            {
                return NotFound("Obiekt nie istnieje");
            }
            return Ok(facility);
        }

        // Usunięcie istniejącego obiektu:
        [HttpDelete("{id}")]
        public async Task<ActionResult<Facility>> DeleteFacility(int id)
        {
            var facility = await service.Delete(id);
            if (!facility)
            {
                return NotFound();
            }
            return Ok(new { message = "Obiekt został usunięty" });
        }
    }
}
