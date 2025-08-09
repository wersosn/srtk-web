using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using srtk.DTO;
using srtk.Models;
using ClosedXML.Excel;
using System.IO;
using System.Text;
using DocumentFormat.OpenXml.InkML;
using DocumentFormat.OpenXml.Office2019.Presentation;
using PdfSharp.Pdf;
using PdfSharp.Drawing;
using System.Globalization;
using System.Linq;

namespace srtk.Services
{
    public class ReservationService
    {
        protected readonly AppDbContext context;

        public ReservationService(AppDbContext context)
        {
            this.context = context;
        }

        // Pobranie wszystkich rezerwacji (ogółem):
        public async Task<List<Reservation>> GetAll()
        {
            return await context.Reservations.ToListAsync();
        }

        // Pobieranie rezerwacji konkretnego toru:
        public async Task<List<Reservation>> GetAllInTrack(int trackId)
        {
            return await context.Reservations.Where(r => r.TrackId == trackId).ToListAsync();
        }

        // Pobieranie rezerwacji z konkretnym statusem rezerwacji:
        public async Task<List<Reservation>> GetAllWithStatus(int statusId)
        {
            return await context.Reservations.Where(r => r.StatusId == statusId).ToListAsync();
        }

        // Pobieranie rezerwacji konkretnego użytkownika:
        public async virtual Task<List<ReservationDto>> GetUserReservations(int userId)
        {
            return await context.Reservations
                .Where(r => r.UserId == userId)
                .Include(r => r.Track)
                .Include(r => r.Status)
                .Include(r => r.EquipmentReservations)
                .ThenInclude(er => er.Equipment)
                .Select(r => new ReservationDto
                {
                    Id = r.Id,
                    Start = r.Start,
                    End = r.End,
                    Cost = r.Cost,
                    TrackId = r.TrackId,
                    TrackName = r.Track.Name,
                    StatusId = r.StatusId,
                    EquipmentReservations = r.EquipmentReservations.Select(er => new EquipmentReservationDto
                    {
                        EquipmentId = er.EquipmentId,
                        Name = er.Equipment.Name,
                        Quantity = er.Quantity
                    }).ToList()
                }).ToListAsync();
        }

        // Pobieranie sprzętów z konkretnej rezerwacji:
        public async Task<List<EquipmentReservationDto>> GetEquipments(int reservationId)
        {
            return await context.EquipmentReservations
                .Where(er => er.ReservationId == reservationId)
                .Select(er => new EquipmentReservationDto
                {
                    EquipmentId = er.EquipmentId,
                    Name = er.Equipment!.Name,
                    Type = er.Equipment!.Type,
                    Cost = er.Equipment.Cost,
                    Quantity = er.Quantity
                })
                .ToListAsync();
        }

        // Pobieranie rezerwacji rozpoczynających się w określonym dniu i/lub godzinie:
        public async Task<List<Reservation>> GetByStartDateAndHour(DateTime date, TimeSpan hour)
        {
            return await context.Reservations.Where(r => r.Start.Date == date.Date && r.Start.TimeOfDay == hour).ToListAsync();
        }

        // Pobieranie rezerwacji kończących się w określonym dniu:
        public async Task<List<Reservation>> GetByEndDateAndHour(DateTime date, TimeSpan hour)
        {
            return await context.Reservations.Where(r => r.End.Date == date.Date && r.End.TimeOfDay == hour).ToListAsync();
        }

        // Pobieranie rezerwacji, które trwają w określonym przedziale czasowym - do znajdywania kolizji:
        public async virtual Task<bool> IsTrackAvailable(int trackId, DateTime start, DateTime end, int? reservationId = null)
        {
            return !await context.Reservations
                .AnyAsync(r =>
                    r.TrackId == trackId &&
                    (reservationId == null || r.Id != reservationId) &&
                    r.Start < end &&
                    r.End > start
                );
        }

        // Pobranie konkretnej rezerwacji:
        public async virtual Task<Reservation?> GetById(int id)
        {
            return await context.Reservations
                .Include(r => r.EquipmentReservations)
                .ThenInclude(er => er.Equipment)
                .Include(r => r.Track)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        // Dodanie nowej rezerwacji:
        public async virtual Task<Reservation> Add(Reservation reservation)
        {
            reservation.Start = reservation.Start.ToUniversalTime();
            reservation.End = reservation.End.ToUniversalTime();

            if (!await IsTrackAvailable(reservation.TrackId, reservation.Start, reservation.End, null))
            {
                throw new Exception("Tor jest już zarezerwowany w tym czasie.");
            }

            var equipmentReservations = reservation.EquipmentReservations.ToList();
            reservation.EquipmentReservations.Clear();

            context.Reservations.Add(reservation);
            await context.SaveChangesAsync();

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
            await context.SaveChangesAsync();

            reservation.EquipmentReservations = await context.EquipmentReservations
                .Where(er => er.ReservationId == reservation.Id)
                .ToListAsync();

            return reservation;
        }

        // Edycja istniejącej rezerwacji:
        public async Task<Reservation?> Update(int id, [FromBody] ReservationDto dto)
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
            return reservation;
        }

        // Usunięcie istniejącej rezerwacji:
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

        // Eksport danych w formacie .xlsx:
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

        // Eksport danych w formacie .pdf:
        // TODO: Poprawić wygląd, aby ładniej wyglądało c:
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
