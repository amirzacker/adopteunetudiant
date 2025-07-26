import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ApplicationManagement from '../companyJobs/ApplicationManagement';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import './companyApplications.css';

const CompanyApplications = () => {
  const { user } = useContext(AuthContext);

  const Logout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  if (!user?.user?.isCompany) {
    return (
      <main>
        <DashboardSidebar
          user={user}
          PF={process.env.REACT_APP_PUBLIC_FOLDER}
          Logout={Logout}
        />

        <div className="dashboard-partition">
          <div className="access-denied-card">
            <h4>Accès refusé</h4>
            <p>Cette page est réservée aux entreprises.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <DashboardSidebar
        user={user}
        PF={process.env.REACT_APP_PUBLIC_FOLDER}
        Logout={Logout}
        activePage="company-applications"
      />

      <div className="dashboard-partition">
        <div className="company-applications-header-card">
          <h4>Candidatures reçues</h4>
          <p>Gérez les candidatures pour vos offres d'emploi</p>
        </div>

        <div className="applications-content-card">
          <ApplicationManagement companyId={user.user._id || user.user.id} />
        </div>
      </div>
    </main>
  );
};

export default CompanyApplications;
