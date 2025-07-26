import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardSidebar = ({
  user,
  PF,
  userssColor1,
  userssColor2,
  handleHome,
  handleAdoption,
  Logout,
  activePage // New prop to handle active states for different pages
}) => {
  const navigate = useNavigate();

  // Helper function to get active class for different pages
  const getActiveClass = (page) => {
    if (activePage === page) {
      return { backgroundColor: '#F2F8F1', borderRadius: '40px 0 0 40px', paddingLeft: '10px' };
    }
    return {};
  };

  const getActiveIconColor = (page) => {
    if (activePage === page) {
      return { color: '#262D2A' };
    }
    return {};
  };

  // Navigation handlers that work from any page
  const handleHomeNavigation = (e) => {
    e.preventDefault();
    if (handleHome && activePage === 'dashboard') {
      // If we're on the dashboard page, use the component handler
      handleHome();
    } else {
      // Otherwise, navigate to dashboard and let it show the home view
      navigate('/dashboard');
    }
  };

  const handleAdoptionNavigation = (e) => {
    e.preventDefault();
    if (handleAdoption && activePage === 'dashboard') {
      // If we're on the dashboard page, use the component handler
      handleAdoption();
    } else {
      // Otherwise, navigate to dashboard and let it show the adoption view
      // We can use URL parameters to indicate which view to show
      navigate('/dashboard?view=adoptions');
    }
  };

  return (
    <nav className="sidebar" role="navigation" aria-label="Navigation du tableau de bord">
      <ul role="menubar" aria-orientation="vertical">
        <div className="student-avatar-container">
          <li className="student-avatar-dashboard" role="none">
            <img
              src={`${user?.user?.profilePicture ? PF + user?.user?.profilePicture : PF + "pic2.jpg"}`}
              alt={`Profil de ${user?.user?.firstname} ${user?.user?.lastname}`}
            />
          </li>
        </div>
        <div className="center-icons-dashboard">
          <li className={`home-icon ${userssColor2}`} role="none">
            <Link
              onClick={handleHomeNavigation}
              to="#"
              role="menuitem"
              aria-label="Aller à l'accueil du tableau de bord"
              tabIndex={0}
            >
              <i className="fas fa-house-user" aria-hidden="true"></i>
              <span className="sr-only">Accueil</span>
            </Link>
          </li>
          <li className="messages-icon" role="none" style={getActiveClass('messenger')}>
            <Link
              to="/messenger"
              role="menuitem"
              aria-label="Accéder à la messagerie"
              tabIndex={0}
            >
              <i className="fas fa-comment" aria-hidden="true" style={getActiveIconColor('messenger')}></i>
              <span className="sr-only">Messages</span>
            </Link>
          </li>
          <li className={`users-icon ${userssColor1}`} role="none">
            <Link
              onClick={handleAdoptionNavigation}
              to="#"
              role="menuitem"
              aria-label="Gérer les adoptions"
              tabIndex={0}
            >
              <i className="fas fa-users" aria-hidden="true"></i>
              <span className="sr-only">Adoptions</span>
            </Link>
          </li>
          {user?.user?.isCompany && (
            <li className="job-board-icon" role="none" style={getActiveClass('company-jobs')}>
              <Link
                to="/company-jobs"
                role="menuitem"
                aria-label="Gérer mes offres d'emploi"
                tabIndex={0}
              >
                <i className="fas fa-briefcase" aria-hidden="true" style={getActiveIconColor('company-jobs')}></i>
                <span className="sr-only">Mes offres d'emploi</span>
              </Link>
            </li>
          )}
          {user?.user?.isStudent && (
            <li className="job-board-icon" role="none">
              <Link
                to="/job-board"
                role="menuitem"
                aria-label="Consulter les offres d'emploi"
                tabIndex={0}
              >
                <i className="fas fa-briefcase" aria-hidden="true"></i>
                <span className="sr-only">Offres d'emploi</span>
              </Link>
            </li>
          )}
          {user?.user?.isStudent && (
            <li className="applications-icon" role="none" style={getActiveClass('my-applications')}>
              <Link
                to="/my-applications"
                role="menuitem"
                aria-label="Voir mes candidatures"
                tabIndex={0}
              >
                <i className="fas fa-file-alt" aria-hidden="true" style={getActiveIconColor('my-applications')}></i>
                <span className="sr-only">Mes candidatures</span>
              </Link>
            </li>
          )}
          {user?.user?.isCompany && (
            <li className="applications-icon" role="none" style={getActiveClass('company-applications')}>
              <Link
                to="/company-applications"
                role="menuitem"
                aria-label="Gérer les candidatures reçues"
                tabIndex={0}
              >
                <i className="fas fa-file-alt" aria-hidden="true" style={getActiveIconColor('company-applications')}></i>
                <span className="sr-only">Candidatures reçues</span>
              </Link>
            </li>
          )}
          <li className="bell-icon" role="none">
            <Link
              to="#"
              role="menuitem"
              aria-label="Voir les notifications"
              tabIndex={0}
            >
              <i className="fas fa-bell" aria-hidden="true"></i>
              <span className="sr-only">Notifications</span>
            </Link>
          </li>

          <li role="none">
            <Link
              onClick={Logout}
              to="#"
              role="menuitem"
              aria-label="Se déconnecter"
              tabIndex={0}
            >
              <img src="/assets/svg/iconnavdashboard/deconnexion.svg" alt="Se déconnecter" id="logout-icon"/>
            </Link>
          </li>
        </div>
      </ul>
    </nav>
  );
};

export default DashboardSidebar;
