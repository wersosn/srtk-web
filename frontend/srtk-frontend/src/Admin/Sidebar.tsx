import { NavLink } from 'react-router-dom';

function Sidebar() {
    const getClassName = ({ isActive }: { isActive: boolean }) => (isActive ? "nav-link active no-wrap" : "nav-link no-wrap");

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
                    <NavLink to="roleManagement" className={getClassName}>
                        Zarządzanie rolami
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
                    <NavLink to="facilitiesManagement" className={getClassName}>
                        Zarządzanie obiektem
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="statusesManagement" className={getClassName}>
                        Zarządzanie statusami rezerwacji
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default Sidebar;