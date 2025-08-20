import { useTranslation } from "react-i18next";

function Dashboard() {
  const { t } = useTranslation();

  return (
  <>
    <h1>Dashboard</h1>
    <p>{t("admin.dashboard")}</p>
  </>
  )
}

export default Dashboard;