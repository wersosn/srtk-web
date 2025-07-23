import { NavLink } from 'react-router-dom';

function Sidebar() {
    const getClassName = ({ isActive }: { isActive: boolean }) => (isActive ? "nav-link active no-wrap" : "nav-link no-wrap");

    return (
        <nav className="admin-nav">
            <ul className="nav flex-column">
                <li className="nav-item">
                    <NavLink to="dashboard" className={getClassName}>
                        Dashboard
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="users" className={getClassName}>
                        Zarządzanie użytkownikami
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="roleManagement" className={getClassName}>
                        Zarządzanie rolami
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="tracks" className={getClassName}>
                        Zarządzanie torami
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="equipments" className={getClassName}>
                        Zarządzanie sprzętem
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="addFacility" className={getClassName}>
                        Zarządzanie obiektem
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="statuses" className={getClassName}>
                        Zarządzanie statusami rezerwacji
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default Sidebar;