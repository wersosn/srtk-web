import { NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useTranslation } from "react-i18next";

function Sidebar() {
    const { t } = useTranslation();
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
                        {t("admin.userM")}
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="tracksManagement" className={getClassName}>
                        {t("admin.trackM")}
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="equipmentsManagement" className={getClassName}>
                        {t("admin.eqM")}
                    </NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="reservationsManagement" className={getClassName}>
                        {t("admin.reservationM")}
                    </NavLink>
                </li>

                {showMore && (
                <>
                    <li className="nav-item">
                        <NavLink to="facilitiesManagement" className={getClassName}>
                            {t("admin.facilityM")}
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="roleManagement" className={getClassName}>
                            {t("admin.roleM")}
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="statusesManagement" className={getClassName}>
                            {t("admin.statusM")}
                        </NavLink>
                    </li>
                </>
                )}
                <li className="nav-item">
                    <NavLink to="adminPanelSettings" className={getClassName}>
                        {t("profile.settings")}
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default Sidebar;