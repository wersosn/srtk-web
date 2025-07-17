using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;

namespace srtk.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext context;

        public UserController(AppDbContext context)
        {
            this.context = context;
        }

        // Pobranie wszystkich użytkowników:
        [HttpGet]
        public async Task<ActionResult<List<User>>> GetAllUsers()
        {
            var users = await context.Users.ToListAsync();
            return users;
        }

        // Pobranie konkretnego użytkownika:
        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUserById(int id)
        {
            var user = await context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return user;
        }

        // Dodanie nowego użytkownika:
        [HttpPost]
        public async Task<ActionResult<User>> AddUser(User user)
        {
            context.Users.Add(user);
            await context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }

        // Edycja istniejącego użytkownika:
        // DO ROZSZERZENIA!
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserDto dto)
        {
            var user = await context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound("Użytkownik nie istnieje");
            }
            user.Email = dto.Email;
            user.RoleId = dto.RoleId;
            await context.SaveChangesAsync();
            return Ok(user);
        }

        // Usunięcie istniejącego użytkownika:
        [HttpDelete("{id}")]
        public async Task<ActionResult<User>> DeleteUser(int id)
        {
            var user = await context.Users.Include(r => r.ReservationList).FirstOrDefaultAsync(r => r.Id == id);
            if (user == null)
            {
                return NotFound();
            }
            context.Reservations.RemoveRange(user.ReservationList);
            context.Users.Remove(user);
            await context.SaveChangesAsync();
            return Ok(new { message = "Użytkownik został usunięty" });
        }
    }
}
