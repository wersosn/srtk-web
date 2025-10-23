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

        public async virtual Task<List<ReservationDto>> GetAll()
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

        public async virtual Task<List<ReservationDto>> GetAllInTrack(int trackId)
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

        public async virtual Task<List<ReservationDto>> GetAllWithStatus(int statusId)
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
                .Include(er => er.Equipment)
                .Select(er => er.ToDto())
                .ToListAsync();
        }

        public async virtual Task<List<ReservationDto>> GetByStartDateAndHour(DateTime date, TimeSpan hour)
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

        public async virtual Task<List<ReservationDto>> GetByEndDateAndHour(DateTime date, TimeSpan hour)
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
                    r.End > start &&
                    (r.Status!.Name != "Anulowano")
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

        public async virtual Task<Reservation> Add(Reservation reservation, string language = null)
        {
            using var transaction = await context.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

            reservation.Start = reservation.Start.ToUniversalTime();
            reservation.End = reservation.End.ToUniversalTime();

            if (!await IsTrackAvailable(reservation.TrackId, reservation.Start, reservation.End, null))
            {
                throw new Exception("Tor jest już zarezerwowany w tym czasie.");
            }

            var equipmentIds = reservation.EquipmentReservations.Select(er => er.EquipmentId).ToList();
            var existingEquipmentIds = await context.Equipments
                .Where(e => equipmentIds.Contains(e.Id))
                .Select(e => e.Id)
                .ToListAsync();

            var invalidEquipment = equipmentIds.Except(existingEquipmentIds).ToList();
            if (invalidEquipment.Any())
            {
                throw new InvalidOperationException("Sprzęt nie istnieje.");
            }

            var equipmentReservations = reservation.EquipmentReservations.ToList();
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
                string title, body;
                if (language.Equals("en", StringComparison.OrdinalIgnoreCase))
                {
                    title = "Track reservation confirmation";
                    body = $@"
                            <div style='font-family: Arial, sans-serif; padding: 10px'>
                                <h2>Hello {user.Email}!</h2>
                                <p>Thank you for reserving the track <strong>{track?.Name}</strong>.</p>
                                <p>You can check your reservation details in the 'My Reservations' section :)</p>
                            </div>";
                }
                else
                {
                    title = "Potwierdzenie rezerwacji toru";
                    body = $@"
                            <div style='font-family: Arial, sans-serif; padding: 10px'>
                                <h2>Witaj {user.Email}!</h2>
                                <p>Dziękujemy za rezerwację toru <strong>{track?.Name}</strong>.</p>
                                <p>Szczegóły rezerwacji możesz sprawdzić w zakładce 'Moje rezerwacje' :)</p>
                            </div>";
                }

                _ = Task.Run(async () =>
                {
                    try
                    {
                        await emailService.SendEmail(user.Email, title, body);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Błąd wysyłania maila: " + ex.Message);
                    }
                });
            }

            return reservation;
        }

        public async virtual Task<Reservation?> Update(int id, [FromBody] ReservationDto dto, string currentUserRole, string language = null)
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
                        string title, body;
                        if (language.Equals("en", StringComparison.OrdinalIgnoreCase))
                        {
                            title = "Track reservation details modified";
                            body = $@"
                                    <div style='font-family: Arial, sans-serif; padding: 10px'>
                                        <h2>Hello {user.Email}!</h2>
                                        <p>Your reservation for the track <strong>{track?.Name}</strong> has been modified.</p>
                                        <p>Current reservation details:</p>
                                        <p>Date: {reservation.Start} - {reservation.End}</p>
                                        <p>Cost: {reservation.Cost} zł</p>
                                        <p>Equipment: {equipmentListHtml}</p>
                                    </div>";
                        }
                        else
                        {
                            title = "Zmodyfikowano szczegóły rezerwacji toru";
                            body = $@"
                                    <div style='font-family: Arial, sans-serif; padding: 10px'>
                                        <h2>Witaj {user.Email}!</h2>
                                        <p>Twoja rezerwacja toru <strong>{track?.Name}</strong> została zmodyfikowana.</p>
                                        <p>Obecne szczegóły rezerwacji:</p>
                                        <p>Data: {reservation.Start} - {reservation.End}</p>
                                        <p>Koszt: {reservation.Cost} zł</p>
                                        <p>Sprzęty: {equipmentListHtml}</p>
                                    </div>";
                        }

                        _ = Task.Run(async () =>
                        {
                            try
                            {
                                await emailService.SendEmail(user.Email, title, body);
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

        public async Task<byte[]> ExportToExcel(int trackId, string language = null)
        {
            var reservations = await context.Reservations
                .Include(r => r.Track)
                .Include(r => r.User)
                .Include(r => r.Status)
                .Where(r => r.TrackId == trackId)
                .ToListAsync();

            var translations = new Dictionary<string, Dictionary<string, string>>(StringComparer.OrdinalIgnoreCase)
            {
                ["en"] = new Dictionary<string, string>
                {
                    ["SheetName"] = "Reservations",
                    ["Track"] = "Track",
                    ["Desc"] = "Reservations for track",
                    ["ResId"] = "Reservation Id",
                    ["Cost"] = "Cost",
                    ["End"] = "End",
                    ["Email"] = "User e-mail"
                },
                ["pl"] = new Dictionary<string, string>
                {
                    ["SheetName"] = "Rezerwacje",
                    ["Track"] = "Tor",
                    ["Desc"] = "Rezerwacje dla toru",
                    ["ResId"] = "Id rezerwacji",
                    ["Cost"] = "Koszt",
                    ["End"] = "Koniec",
                    ["Email"] = "E-mail użytkownika"
                }
            };

            var t = translations[language];
            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.AddWorksheet(t["SheetName"]);

                // Nagłówek tabeli:
                var trackName = reservations.FirstOrDefault()?.Track?.Name ?? $"{t["Track"]} {trackId}";
                worksheet.Cell(1, 1).Value = $"{t["Desc"]}: {trackName}";
                worksheet.Range(1, 1, 1, 6).Merge();
                worksheet.Range(1, 1, 1, 6).Style.Font.SetBold();
                worksheet.Range(1, 1, 1, 6).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

                // Nagłówki kolumn:
                worksheet.Cell(2, 1).Value = t["ResId"];
                worksheet.Cell(2, 2).Value = "Start";
                worksheet.Cell(2, 3).Value = t["End"];
                worksheet.Cell(2, 4).Value = t["Cost"];
                worksheet.Cell(2, 5).Value = t["Email"];
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
        public async Task<byte[]> ExportToPdf(int reservationId, string language = null)
        {
            var reservation = await context.Reservations
                .Include(r => r.Track)
                .Include(r => r.User)
                .Include(r => r.Status)
                .Include(r => r.EquipmentReservations)
                .ThenInclude(er => er.Equipment)
                .FirstOrDefaultAsync(r => r.Id == reservationId);

            var translations = new Dictionary<string, Dictionary<string, string>>(StringComparer.OrdinalIgnoreCase)
            {
                ["en"] = new Dictionary<string, string>
                {
                    ["Title"] = "Track reservation",
                    ["TitleCont"] = "on",
                    ["SheetName"] = "Reservations",
                    ["Track"] = "Track",
                    ["Desc"] = "Reservations for track",
                    ["ResId"] = "Reservation Id",
                    ["Cost"] = "Cost",
                    ["End"] = "End",
                    ["Email"] = "User e-mail",
                    ["Equipment"] = "Rented equipment",
                    ["Quantity"] = "pcs.",
                    ["NoName"] = "No name",
                    ["NoEquipment"] = "No rented equipment"
                },
                ["pl"] = new Dictionary<string, string>
                {
                    ["Title"] = "Rezerwacja toru",
                    ["TitleCont"] = "w dniu",
                    ["Track"] = "Tor",
                    ["Desc"] = "Rezerwacje dla toru",
                    ["ResId"] = "Id rezerwacji",
                    ["Cost"] = "Koszt",
                    ["End"] = "Koniec",
                    ["Email"] = "E-mail użytkownika",
                    ["Equipment"] = "Wynajęty sprzęt",
                    ["Quantity"] = "szt.",
                    ["NoName"] = "Brak nazwy",
                    ["NoEquipment"] = "Brak wynajętego sprzętu"
                }
            };

            var t = translations[language];

            if (reservation == null)
            {
                throw new Exception("Nie znaleziono rezerwacji");
            }

            var document = new PdfDocument();
            document.Info.Title = $"{t["Title"]} {reservation.Track?.Name} {t["TitleCont"]} {reservation.Start.ToLocalTime().ToString("d", CultureInfo.CurrentCulture)}";

            var page = document.AddPage();
            var gfx = XGraphics.FromPdfPage(page);
            var font = new XFont("Verdana", 14);
            int yPoint = 40;

            gfx.DrawString($"{t["ResId"]}: {reservation.Id}", font, XBrushes.Black, new XRect(20, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
            yPoint += 25;

            gfx.DrawString($"Start: {reservation.Start.ToLocalTime().ToString("g", CultureInfo.CurrentCulture)}", font, XBrushes.Black, new XRect(20, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
            yPoint += 20;

            gfx.DrawString($"{t["End"]}: {reservation.End.ToLocalTime().ToString("g", CultureInfo.CurrentCulture)}", font, XBrushes.Black, new XRect(20, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
            yPoint += 20;

            gfx.DrawString($"{t["Cost"]}: {reservation.Cost} zł", font, XBrushes.Black, new XRect(20, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
            yPoint += 30;

            gfx.DrawString($"{t["Track"]}: {reservation.Track?.Name ?? t["NoName"]}", font, XBrushes.Black, new XRect(20, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
            yPoint += 30;

            gfx.DrawString($"{t["Equipment"]}:", font, XBrushes.Black, new XRect(20, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
            yPoint += 20;

            // Gdy jakiś sprzęt został dodany: nazwa + ilość:
            if (reservation.EquipmentReservations != null && reservation.EquipmentReservations.Any())
            {
                foreach (var eqRes in reservation.EquipmentReservations)
                {
                    var eqName = eqRes.Equipment?.Name ?? t["NoName"];
                    gfx.DrawString($"- {eqName}: {eqRes.Quantity} {t["Quantity"]}", font, XBrushes.Black, new XRect(40, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
                    yPoint += 20;
                }
            }
            else
            {
                gfx.DrawString($"{t["NoEquipment"]}", font, XBrushes.Black, new XRect(40, yPoint, page.Width, page.Height), XStringFormats.TopLeft);
                yPoint += 20;
            }

            using var stream = new MemoryStream();
            document.Save(stream);
            stream.Position = 0;
            return stream.ToArray();
        }
    }
}
