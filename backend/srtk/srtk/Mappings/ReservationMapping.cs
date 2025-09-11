using srtk.DTO;
using srtk.Models;

namespace srtk.Mappings
{
    public static class ReservationMapping
    {
        public static ReservationDto ToDto(this Reservation reservation)
        {
            return new ReservationDto
            {
                Id = reservation.Id,
                Start = reservation.Start,
                End = reservation.End,
                Cost = reservation.Cost,
                TrackId = reservation.TrackId,
                TrackName = reservation.Track?.Name ?? "",
                StatusId = reservation.StatusId,
                StatusName = reservation.Status?.Name ?? "",
                EquipmentReservations = reservation.EquipmentReservations
                        .Select(er => new EquipmentReservationDto
                        {
                            EquipmentId = er.EquipmentId,
                            Name = er.Equipment?.Name ?? "",
                            Quantity = er.Quantity
                        })
                        .ToList()
            };
        }

        public static Reservation ToReservation(this ReservationDto dto)
        {
            return new Reservation
            {
                Id = dto.Id,
                Start = dto.Start,
                End = dto.End,
                Cost = dto.Cost,
                TrackId = dto.TrackId,
                StatusId = dto.StatusId
            };
        }
    }
}
