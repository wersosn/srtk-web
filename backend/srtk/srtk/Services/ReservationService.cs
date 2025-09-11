using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using srtk.Mappings;
using ClosedXML.Excel;
using PdfSharp.Pdf;
using PdfSharp.Drawing;
using System.Globalization;
using Track = srtk.Models.Track;

namespace srtk.Services
{
    public class ReservationService
    {
        protected readonly AppDbContext context;
        private readonly EmailService emailService;

        public ReservationService(AppDbContext context, EmailService emailService)
        {
            this.context = context;
            this.emailService = emailService;
        }

        public async Task<List<ReservationDto>> GetAll()
        {
            return await context.Reservations
                .Include(r => r.User)
                .Include(r => r.Track)
                .Include(r => r.Status)
                .Include(r => r.EquipmentReservations)
                .ThenInclude(er => er.Equipment)
                .Select(r => r.ToDto())
                .ToListAsync();
        }

        public async Task<List<ReservationDto>> GetAllInTrack(int trackId)
        {
            return await context.Reservations
                .Where(r => r.TrackId == trackId)
                .Include(r => r.Track)
                .Include(r => r.User)
                .Include(r => r.Status)
                .Include(r => r.EquipmentReservations)
                .ThenInclude(er => er.Equipment)
                .Select(r => r.ToDto())
                .ToListAsync();
        }

        public async Task<List<ReservationDto>> GetAllWithStatus(int statusId)
        {
            return await context.Reservations
                .Where(r => r.StatusId == statusId)
                .Include(r => r.User)
                .Include(r => r.Status)
                .Include(r => r.EquipmentReservations)
                .ThenInclude(er => er.Equipment)
                .Select(r => r.ToDto())
                .ToListAsync();
        }

        public async virtual Task<List<ReservationDto>> GetUserReservations(int userId)
        {
            return await context.Reservations
                .Where(r => r.UserId == userId)
                .Include(r => r.Track)
                .Include(r => r.Status)
                .Include(r => r.EquipmentReservations)
                .ThenInclude(er => er.Equipment)
                .Select(r => r.ToDto())
                .ToListAsync();
        }

        public async Task<List<EquipmentReservationDto>> GetEquipments(int reservationId)
        {
            return await context.EquipmentReservations
                .Where(er => er.ReservationId == reservationId)
                .Select(er => er.ToDto())
                .ToListAsync();
        }

        public async Task<List<ReservationDto>> GetByStartDateAndHour(DateTime date, TimeSpan hour)
        {
            return await context.Reservations
                .Where(r => r.Start.Date == date.Date && r.Start.TimeOfDay == hour)
                .Include(r => r.Track)
                .Include(r => r.Status)
                .Include(r => r.EquipmentReservations)
                .ThenInclude(er => er.Equipment)
                .Select(r => r.ToDto())
                .ToListAsync();
        }

        public async Task<List<ReservationDto>> GetByEndDateAndHour(DateTime date, TimeSpan hour)
        {
            return await context.Reservations
                .Where(r => r.End.Date == date.Date && r.End.TimeOfDay == hour)
                .Include(r => r.Track)
                .Include(r => r.Status)
                .Include(r => r.EquipmentReservations)
                .ThenInclude(er => er.Equipment)
                .Select(r => r.ToDto())
                .ToListAsync();
        }

        public async virtual Task<bool> IsTrackAvailable(int trackId, DateTime start, DateTime end, int? reservationId = null)
        {
            start = start.ToUniversalTime();
            end = end.ToUniversalTime();

            return !await context.Reservations
                .AnyAsync(r =>
                    r.TrackId == trackId &&
                    (reservationId == null || r.Id != reservationId) &&
                    r.Start < end &&
                    r.End > start
                );
        }

        public async virtual Task<List<ReservationDto>> GetUpcomingReservations(int userId)
        {
            var now = DateTime.UtcNow;
            return await context.Reservations
                .Where(r => r.UserId == userId && r.Start > now && r.Start <= now.AddHours(1))
                .Include(r => r.Track)
                .Select(r => r.ToDto())
                .ToListAsync();
        }

        public async virtual Task<Reservation?> GetById(int id)
        {
            return await context.Reservations
                .Include(r => r.EquipmentReservations)
                .ThenInclude(er => er.Equipment)
                .Include(r => r.Track)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async virtual Task<Reservation> Add(Reservation reservation)
        {
            using var transaction = await context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

            reservation.Start = reservation.Start.ToUniversalTime();
            reservation.End = reservation.End.ToUniversalTime();

            if (!await IsTrackAvailable(reservation.TrackId, reservation.Start, reservation.End, null))
            {
                throw new Exception("Tor jest już zarezerwowany w tym czasie.");
            }

            var equipmentReservations = reservation.EquipmentReservations.ToList();
            foreach (var eqRes in equipmentReservations)
            {
                var equipmentExists = await context.Equipments.AnyAsync(e => e.Id == eqRes.EquipmentId);
                if (!equipmentExists)
                {
                    throw new Exception($"Sprzęt {eqRes.Equipment?.Name} nie istnieje.");
                }
            }

            reservation.EquipmentReservations.Clear();
            context.Reservations.Add(reservation);

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("Tor jest już zarezerwowany w tym czasie (wykryto konflikt): ", ex);
            }

            foreach (var eqRes in equipmentReservations)
            {
                var equipmentExists = await context.Equipments.AnyAsync(e => e.Id == eqRes.EquipmentId);
                if (!equipmentExists)
                {
                    throw new Exception("Sprzęt nie istnieje");
                }

                eqRes.ReservationId = reservation.Id;
                context.EquipmentReservations.Add(eqRes);
            }

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                await transaction.RollbackAsync();
                throw new Exception("Tor jest już zarezerwowany w tym czasie (wykryto konflikt).", ex);
            }

            reservation.EquipmentReservations = await context.EquipmentReservations
                .Where(er => er.ReservationId == reservation.Id)
                .ToListAsync();

            await transaction.CommitAsync();

            var user = await context.Users.FirstOrDefaultAsync(u => u.Id == reservation.UserId);
            var track = await context.Tracks.FirstOrDefaultAsync(t => t.Id == reservation.TrackId);
            if (user != null)
            {
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await emailService.SendEmail(
                            user.Email,
                            "Potwierdzenie rezerwacji toru",
                            $@"
                            <div style='font-family: Arial, sans-serif; padding: 10px'>
                                <h2>Witaj {user.Email}!</h2>
                                <p>Dziękujemy za rezerwację toru <strong>{track?.Name}</strong>.</p>
                                <p>Szczegóły rezerwacji możesz sprawdzić w zakładce 'Moje rezerwacje' :)</p>
                            </div>"
                        );
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Błąd wysyłania maila: " + ex.Message);
                    }
                });
            }

            return reservation;
        }

        public async Task<Reservation?> Update(int id, [FromBody] ReservationDto dto, string currentUserRole)
        {
            await using var transaction = await context.Database.BeginTransactionAsync();
            try
            {
                var reservation = await context.Reservations
                    .Include(r => r.EquipmentReservations)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (reservation == null)
                {
                    return null;
                }

                if (!await IsTrackAvailable(dto.TrackId, dto.Start.ToUniversalTime(), dto.End.ToUniversalTime(), id))
                {
                    throw new Exception("Tor jest już zarezerwowany w tym czasie!");
                }

                var existingEquipmentReservations = await context.EquipmentReservations
                        .Where(er => er.ReservationId == reservation.Id)
                        .ToListAsync();

                // Aktualizacja istniejących sprzętów:
                var dtoEquipmentDict = dto.EquipmentReservations.ToDictionary(e => e.EquipmentId);
                foreach (var existing in existingEquipmentReservations)
                {
                    if (!dtoEquipmentDict.ContainsKey(existing.EquipmentId))
                    {
                        context.EquipmentReservations.Remove(existing);
                    }
                    else
                    {
                        var dtoItem = dtoEquipmentDict[existing.EquipmentId];
                        if (dtoItem.Quantity <= 0)
                        {
                            context.EquipmentReservations.Remove(existing);
                        }
                        else if (existing.Quantity != dtoItem.Quantity)
                        {
                            existing.Quantity = dtoItem.Quantity;
                            context.Entry(existing).State = EntityState.Modified;
                        }
                    }
                }

                // Dodawanie nowych sprzętów:
                foreach (var dtoItem in dto.EquipmentReservations)
                {
                    var alreadyExists = existingEquipmentReservations.Any(er => er.EquipmentId == dtoItem.EquipmentId);
                    if (!alreadyExists && dtoItem.Quantity > 0)
                    {
                        var newReservation = new EquipmentReservation
                        {
                            ReservationId = reservation.Id,
                            EquipmentId = dtoItem.EquipmentId,
                            Quantity = dtoItem.Quantity
                        };
                        await context.EquipmentReservations.AddAsync(newReservation);
                    }
                }

                // Aktualizacja głównych parametrów:
                reservation.Start = dto.Start.ToUniversalTime();
                reservation.End = dto.End.ToUniversalTime();
                reservation.Cost = dto.Cost;
                reservation.TrackId = dto.TrackId;

                await context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Wysłanie maila z powiadomieniem o zmodyfikowaniu rezerwacji przez admina:
                if (currentUserRole == "Admin")
                {
                    var user = await context.Users.FirstOrDefaultAsync(u => u.Id == reservation.UserId);
                    var track = await context.Tracks.FirstOrDefaultAsync(t => t.Id == reservation.TrackId);
                    var equipmentListHtml = "<ul>";
                    foreach (var er in reservation.EquipmentReservations)
                    {
                        var eq = await context.Equipments.FirstOrDefaultAsync(e => e.Id == er.EquipmentId);
                        if (eq != null)
                        {
                            equipmentListHtml += $"<li>{eq.Name}: {er.Quantity}</li>";
                        }
                    }
                    equipmentListHtml += "</ul>";

                    if (user != null)
                    {
                        _ = Task.Run(async () =>
                        {
                            try
                            {
                                await emailService.SendEmail(
                                    user.Email,
                                    "Zmodyfikowano szczegóły rezerwacji toru",
                                    $@"
                                    <div style='font-family: Arial, sans-serif; padding: 10px'>
                                        <h2>Witaj {user.Email}!</h2>
                                        <p>Twoja rezerwacja toru <strong>{track?.Name}</strong> została zmodyfikowana.</p>
                                        <p>Obecne szczegóły rezerwacji:</p>
                                        <p>Data: {reservation.Start} - {reservation.End}</p>
                                        <p>Koszt: {reservation.Cost} zł</p>
                                        <p>Sprzęty: {equipmentListHtml}</p>
                                    </div>"
                                );
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine("Błąd wysyłania maila: " + ex.Message);
                            }
                        });
                    }
                }

                return reservation;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> Delete(int id)
        {
            var reservation = await context.Reservations.FindAsync(id);
            if (reservation == null)
            {
                return false;
            }
            context.Reservations.Remove(reservation);
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> Cancel(int id)
        {
            var reservation = await context.Reservations.FindAsync(id);
            if (reservation == null)
            {
                return false;
            }

            var status = await context.Statuses.FirstOrDefaultAsync(s => s.Name == "Anulowano");
            if(status != null)
            {
                reservation.StatusId = status.Id;
            }
            await context.SaveChangesAsync();
            return true;
        }

        public async Task<byte[]> ExportToExcel(int trackId)
        {
            var reservations = await context.Reservations
                .Include(r => r.Track)
                .Include(r => r.User)
                .Include(r => r.Status)
                .Where(r => r.TrackId == trackId)
                .ToListAsync();

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.AddWorksheet("Rezerwacje");

                // Nagłówek tabeli:
                var trackName = reservations.FirstOrDefault()?.Track?.Name ?? $"Tor {trackId}";
                worksheet.Cell(1, 1).Value = $"Rezerwacje dla toru: {trackName}";
                worksheet.Range(1, 1, 1, 6).Merge();
                worksheet.Range(1, 1, 1, 6).Style.Font.SetBold();
                worksheet.Range(1, 1, 1, 6).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

                // Informacje:
                worksheet.Cell(2, 1).Value = "Id rezerwacji";
                worksheet.Cell(2, 2).Value = "Start";
                worksheet.Cell(2, 3).Value = "Koniec";
                worksheet.Cell(2, 4).Value = "Koszt";
                worksheet.Cell(2, 5).Value = "Email użytkownika";
                worksheet.Cell(2, 6).Value = "Status";

                // Wpisywanie danych:
                int row = 3;
                foreach (var r in reservations)
                {
                    worksheet.Cell(row, 1).Value = r.Id;
                    worksheet.Cell(row, 2).Value = r.Start;
                    worksheet.Cell(row, 3).Value = r.End;
                    worksheet.Cell(row, 4).Value = r.Cost;
                    worksheet.Cell(row, 5).Value = r.User?.Email ?? "-";
                    worksheet.Cell(row, 6).Value = r.Status?.Name ?? "-";
                    row++;
                }

                worksheet.Columns().AdjustToContents();
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }

        // TODO: Poprawić wygląd, aby ładniej wyglądało 
        public async Task<byte[]> ExportToPdf(int reservationId)
        {
            var reservation = await context.Reservations
                .Include(r => r.Track)
                .Include(r => r.User)
                .Include(r => r.Status)
                .Include(r => r.EquipmentReservations)
                .ThenInclude(er => er.Equipment)
                .FirstOrDefaultAsync(r => r.Id == reservationId);

            if (reservation == null)
            {
                throw new Exception("Nie znaleziono rezerwacji");
            }

            var document = new PdfDocument();
            document.Info.Title = $"Rezerwacja toru {reservation.Track?.Name} w dniu {reservation.Start.ToLocalTime().ToString("d", CultureInfo.CurrentCulture)}";

            var page = document.AddPage();
            var gfx = XGraphics.FromPdfPage(page);
            var font = new XFont("Verdana", 14);
            int yPoint = 40;

            // Nagłówek:
            gfx.DrawString($"Rezerwacja ID: {reservation.Id}", font, XBrushes.Black, new XRect(20, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
            yPoint += 25;

            // Data startu:
            gfx.DrawString($"Start: {reservation.Start.ToLocalTime().ToString("g", CultureInfo.CurrentCulture)}", font, XBrushes.Black, new XRect(20, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
            yPoint += 20;

            // Dara zakończenia:
            gfx.DrawString($"Koniec: {reservation.End.ToLocalTime().ToString("g", CultureInfo.CurrentCulture)}", font, XBrushes.Black, new XRect(20, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
            yPoint += 20;

            // Koszt:
            gfx.DrawString($"Koszt: {reservation.Cost} zł", font, XBrushes.Black, new XRect(20, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
            yPoint += 30;

            // Tor:
            gfx.DrawString($"Tor: {reservation.Track?.Name ?? "Brak danych"}", font, XBrushes.Black, new XRect(20, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
            yPoint += 30;

            // Sprzęt:
            gfx.DrawString("Wynajęty sprzęt:", font, XBrushes.Black, new XRect(20, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
            yPoint += 20;

            // Gdy jakiś sprzęt został dodany: nazwa + ilość:
            if (reservation.EquipmentReservations != null && reservation.EquipmentReservations.Any())
            {
                foreach (var eqRes in reservation.EquipmentReservations)
                {
                    var eqName = eqRes.Equipment?.Name ?? "Brak nazwy";
                    gfx.DrawString($"- {eqName}: {eqRes.Quantity} szt.", font, XBrushes.Black, new XRect(40, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
                    yPoint += 20;
                }
            }
            else
            {
                gfx.DrawString("Brak wynajętego sprzętu.", font, XBrushes.Black, new XRect(40, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
                yPoint += 20;
            }

            using var stream = new MemoryStream();
            document.Save(stream);
            stream.Position = 0;
            return stream.ToArray();
        }
    }
}
