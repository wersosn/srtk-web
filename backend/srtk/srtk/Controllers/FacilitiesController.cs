using Microsoft.AspNetCore.Authorization;
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
    [Authorize]
    public class FacilitiesController : ControllerBase
    {
        private readonly FacilityService service;
        private readonly ILogger<FacilitiesController> logger;
        public FacilitiesController(FacilityService service, ILogger<FacilitiesController> logger)
        {
            this.service = service;
            this.logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<List<FacilityDto>>> GetAllFacilities()
        {
            var facilities = await service.GetAll();
            foreach (var facility in facilities)
            {
                AddLinks(facility);
            }
            logger.LogInformation("Pobrano wszystkie obiekty, ilość: {Count}", facilities.Count);
            return facilities;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<FacilityDto>> GetFacilityById(int id)
        {
            var facility = await service.GetById(id);
            if (facility == null)
            {
                logger.LogWarning("Nie znaleziono obiektu z Id {Id}", id);
                return NotFound();
            }
            AddLinks(facility);
            logger.LogInformation("Znaleziono obiekt z Id {Id}: {Name}", id, facility.Name);
            return facility;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FacilityDto>> AddFacility(FacilityDto dto)
        {
            var facility = await service.Add(dto);
            logger.LogInformation("Dodano nowy obiekt: {Name}", facility.Name);
            return CreatedAtAction(nameof(GetFacilityById), new { id = facility.Id }, facility);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<FacilityDto>> UpdateFacility(int id, [FromBody] FacilityDto dto)
        {
            var facility = await service.Update(id, dto);
            if (facility == null)
            {
                logger.LogWarning("Nie znaleziono obiektu z Id {Id}", id);
                return NotFound("Obiekt nie istnieje");
            }
            logger.LogInformation("Zmodyfikowano obiekt z Id {Id}: {Name}", id, dto.Name);
            return Ok(facility);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult> DeleteFacility(int id)
        {
            var facility = await service.Delete(id);
            if (!facility)
            {
                logger.LogWarning("Nie udało się usunąć obiektu z Id {Id}", id);
                return NotFound();
            }
            logger.LogInformation("Usunięto obiekt z Id {Id}", id);
            return Ok(new { message = "Obiekt został usunięty" });
        }

        // API filter test:
        [HttpGet("test-error")]
        public IActionResult TestError()
        {
            throw new Exception("Test wyjątku");
        }

        // HATEOAS:
        private void AddLinks(FacilityDto facility)
        {
            facility.Links.Add(new LinkDto
            {
                Rel = "all",
                Href = Url.Action(nameof(GetAllFacilities))!,
                Method = "GET"
            });

            facility.Links.Add(new LinkDto
            {
                Rel = "self",
                Href = Url.Action(nameof(GetFacilityById), new { id = facility.Id })!,
                Method = "GET"
            });

            if (User.IsInRole("Admin"))
            {
                facility.Links.Add(new LinkDto
                {
                    Rel = "update",
                    Href = Url.Action(nameof(UpdateFacility), new { id = facility.Id })!,
                    Method = "PUT"
                });

                facility.Links.Add(new LinkDto
                {
                    Rel = "delete",
                    Href = Url.Action(nameof(DeleteFacility), new { id = facility.Id })!,
                    Method = "DELETE"
                });
            }
        }
    }
}
