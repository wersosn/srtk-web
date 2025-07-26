import { useState, useEffect } from 'react';
import editIcon from '../assets/edit.png';
import AddTrack from './AddTrack';
import EditTrack from './EditTrack';
import DeleteTrack from './DeleteTrack';

type Track = {
    id: number;
    name: string;
    typeOfSurface: string;
    length: number;
    facilityId: number;
};

function TrackManagement() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [editingTrack, setEditingTrack] = useState<Track | null>(null);
    const [showDetails, setShowDetails] = useState<Track | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pobieranie wszystkich torów z bazy:
    useEffect(() => {
        const fetchAllTracks = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('/api/tracks', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    throw new Error('Błąd podczas pobierania obiektów');
                }
                const data = await res.json();
                setTracks(data);
            } catch (err: any) {
                setError(err.message || 'Wystąpił błąd');
            } finally {
                setLoading(false);
            }
        };
        fetchAllTracks();

        // TODO: Dodać pobieranie torów należących jedynie do obiektu, którego adminiem jest użytkownik
    }, []);

    // Obsługa dodawania toru:
    const handleAdd = (newTrack: Track) => {
        setTracks(prev => [...prev, newTrack]);
    };

    // Obsługa edycji toru:
    const handleEdit = (updated: Track) => {
        const updatedTrack = tracks.map(r => r.id === updated.id ? updated : r);
        setTracks(updatedTrack);
        setEditingTrack(null);
    };

    // Obsługa usuwania toru:
    const handleDelete = (id: number) => {
        setTracks(prevTrack => prevTrack.filter(track => track.id !== id));
    };

    return (
        <div className="admin-content p-4">
            <h2 className="mb-3">Zarządzanie torami</h2>
            <hr />

            {loading ? (
                <p>Ładowanie torów...</p>
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : (
                <>
                    <h5 className="mt-4">Lista torów</h5>
                    <ul className="list-group">
                        {tracks.map((track) => (
                            <li key={track.id} className="list-group-item p-0">
                                <div onClick={() => setShowDetails(prev => (prev?.id === track.id ? null : track))} className="d-flex justify-content-between align-items-center px-3 py-2">
                                    {track.name}
                                    <div className="d-flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => setEditingTrack(track)} disabled={loading} className="icon-button">
                                            <img src={editIcon} alt="Edytuj" style={{ width: '16px', height: '16px' }} />
                                        </button>
                                        <DeleteTrack trackId={track.id} onDeleted={() => handleDelete(track.id)} />
                                    </div>
                                </div>

                                {showDetails?.id === track.id && (
                                    <div className="mt-2 ps-2 details">
                                        <div><strong>Rodzaj nawierzchni:</strong> {track.typeOfSurface} <br/> <strong>Długość:</strong> {track.length} <br/> <strong>Obiekt:</strong> {track.facilityId}</div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                    <hr />
                    {editingTrack ? (
                        <>
                            <h5 className="mt-4">Edycja toru</h5>
                            <EditTrack trackId={editingTrack.id} currentName={editingTrack.name} currentTypeOfSurface={editingTrack.typeOfSurface} currentLength={editingTrack.length} currentFacilityId={editingTrack.facilityId} onUpdated={handleEdit} onCancel={() => setEditingTrack(null)} />
                        </>
                    ) : (
                        <>
                            <h5 className="mt-4">Nowy tor</h5>
                            <AddTrack onAddTrack={handleAdd} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default TrackManagement;