import { NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Sidebar() {
    const getClassName = ({ isActive }: { isActive: boolean }) => (isActive ? "nav-link active no-wrap" : "nav-link no-wrap");

    let showMore = false;
    let facilityId: number | undefined;
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const decoded: any = jwtDecode(token);
            if (decoded && decoded.FacilityId) {
                facilityId = parseInt(decoded.FacilityId, 10);
                if(!facilityId || facilityId === 0) {
                    showMore = true;
                }
            }
        } catch { }
    }

    return (
        <nav className="admin-nav">
            <ul className="nav flex-column">
                <li className="nav-item">
                    <NavLink to="." end className={getClassName}>
                        Dashboard
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="usersManagement" className={getClassName}>
                        Zarządzanie użytkownikami
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="tracksManagement" className={getClassName}>
                        Zarządzanie torami
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="equipmentsManagement" className={getClassName}>
                        Zarządzanie sprzętem
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="reservationsManagement" className={getClassName}>
                        Zarządzanie rezerwacjami
                    </NavLink>
                </li>

                {showMore && (
                <>
                    <li className="nav-item">
                        <NavLink to="facilitiesManagement" className={getClassName}>
                            Zarządzanie obiektami
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="roleManagement" className={getClassName}>
                            Zarządzanie rolami
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="statusesManagement" className={getClassName}>
                            Zarządzanie statusami rezerwacji
                        </NavLink>
                    </li>
                </>
                )}
                <li className="nav-item">
                    <NavLink to="adminPanelSettings" className={getClassName}>
                        Ustawienia
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default Sidebar;