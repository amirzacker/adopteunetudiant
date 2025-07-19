import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ApplicationManagement from '../companyJobs/ApplicationManagement';
import './companyApplications.css';

const CompanyApplications = () => {
  const { user } = useContext(AuthContext);

  if (!user?.user?.isCompany) {
    return (
      <main>
        <div className="sidebar">
          <ul>
            <div className="student-avatar-container">
              <li className="student-avatar-dashboard">
                <img src={`${process.env.REACT_APP_PUBLIC_FOLDER}pic2.jpg`} alt="avatar"/>
              </li>
            </div>
            <div className="center-icons-dashboard">
              <li className="home-icon">
                <a href="/dashboard">
                  <i className="fas fa-house-user"></i>
                </a>
              </li>
              <li className="messages-icon">
                <a href="/messenger">
                  <i className="fas fa-comment"></i>
                </a>
              </li>
              <li className="users-icon">
                <a href="/dashboard">
                  <i className="fas fa-users"></i>
                </a>
              </li>
              <li className="bell-icon">
                <a href="#">
                  <i className="fas fa-bell"></i>
                </a>
              </li>
              <li>
                <a href="/dashboard"><img src="/assets/svg/iconnavdashboard/deconnexion.svg" alt="deconnexion" id="logout-icon"/></a>
              </li>
            </div>
          </ul>
        </div>

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
      <div className="sidebar">
        <ul>
          <div className="student-avatar-container">
            <li className="student-avatar-dashboard">
              <img src={`${user?.user?.profilePicture ? process.env.REACT_APP_PUBLIC_FOLDER + user?.user?.profilePicture : process.env.REACT_APP_PUBLIC_FOLDER + "pic2.jpg"}`} alt="avatar-company"/>
            </li>
          </div>
          <div className="center-icons-dashboard">
            <li className="home-icon">
              <a href="/dashboard">
                <i className="fas fa-house-user"></i>
              </a>
            </li>
            <li className="messages-icon">
              <a href="/messenger">
                <i className="fas fa-comment"></i>
              </a>
            </li>
            <li className="users-icon">
              <a href="/dashboard">
                <i className="fas fa-users"></i>
              </a>
            </li>
            <li className="job-board-icon">
              <a href="/company-jobs">
                <i className="fas fa-briefcase"></i>
              </a>
            </li>
            <li className="applications-icon" style={{backgroundColor: '#F2F8F1', borderRadius: '40px 0 0 40px', paddingLeft: '10px'}}>
              <a href="/company-applications">
                <i className="fas fa-file-alt" style={{color: '#262D2A'}}></i>
              </a>
            </li>
            <li className="bell-icon">
              <a href="#">
                <i className="fas fa-bell"></i>
              </a>
            </li>
            <li>
              <a href="/dashboard"><img src="/assets/svg/iconnavdashboard/deconnexion.svg" alt="deconnexion" id="logout-icon"/></a>
            </li>
          </div>
        </ul>
      </div>

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
