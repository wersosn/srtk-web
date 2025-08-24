import React from 'react';
import { useTranslation } from "react-i18next";
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer>
      <p>© 2025 System rezerwacji toru kolarskiego - Weronika Sosnowska</p>
      <nav>
        <a href="https://www.flaticon.com/" className="links">{t("footer.icons")}</a>
        <a href="https://storyset.com" className="links">{t("footer.illustrations")}</a>
      </nav>
    </footer>
  );
};

export default Footer;
