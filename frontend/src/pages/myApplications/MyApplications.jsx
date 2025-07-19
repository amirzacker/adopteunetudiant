import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Pagination } from '@material-ui/lab';
import './myApplications.css';

const MyApplications = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user?.user?.isStudent && (user?.user?.id || user?.user?._id)) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      if (!user?.user?.id && !user?.user?._id) {
        throw new Error('User ID not found');
      }

      if (!user?.token) {
        throw new Error('Authentication token not found');
      }

      const userId = user.user._id || user.user.id;
      const response = await axios.get(`/api/jobApplications/student/${userId}`, {
        headers: {
          'x-access-token': user.token
        }
      });
      setApplications(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement de vos candidatures');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetails(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      reviewed: 'Examinée',
      accepted: 'Acceptée',
      rejected: 'Refusée'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-${status}`;
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  // Pagination logic
  const pages = Math.ceil(filteredApplications.length / itemsPerPage);
  const paginatedData = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  if (!user?.user?.isStudent) {
    return (
      <div className="my-applications-container">
        <div className="access-denied">
          <h2>Accès refusé</h2>
          <p>Cette page est réservée aux étudiants.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-applications-container">
        <div className="loading">Chargement de vos candidatures...</div>
      </div>
    );
  }

  return (
    <main>
      <div className="sidebar">
        <ul>
          <div className="student-avatar-container">
            <li className="student-avatar-dashboard">
              <img src={`${user?.user?.profilePicture ? process.env.REACT_APP_PUBLIC_FOLDER + user?.user?.profilePicture : process.env.REACT_APP_PUBLIC_FOLDER + "pic2.jpg"}`} alt="avatar-student"/>
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
              <a href="/job-board">
                <i className="fas fa-briefcase"></i>
              </a>
            </li>
            <li className="applications-icon" style={{backgroundColor: '#F2F8F1', borderRadius: '40px 0 0 40px', paddingLeft: '10px'}}>
              <a href="/my-applications">
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
        <div className="my-applications-header-card">
          <h4>Mes candidatures</h4>
          <p>Suivez l'état de vos candidatures aux offres d'emploi</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="applications-content-card">
          <div className="filter-buttons">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Toutes ({applications.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          En attente ({applications.filter(app => app.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'reviewed' ? 'active' : ''}`}
          onClick={() => setFilter('reviewed')}
        >
          Examinées ({applications.filter(app => app.status === 'reviewed').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Acceptées ({applications.filter(app => app.status === 'accepted').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Refusées ({applications.filter(app => app.status === 'rejected').length})
        </button>
      </div>

      {filteredApplications.length === 0 ? (
        <div className="no-applications">
          <p>
            {filter === 'all'
              ? "Vous n'avez pas encore postulé à des offres d'emploi."
              : `Aucune candidature ${getStatusLabel(filter).toLowerCase()} trouvée.`
            }
          </p>
          <a href="/job-board" className="browse-jobs-btn">
            Parcourir les offres d'emploi
          </a>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped striped bordered hover">
              <thead>
                <tr>
                  <th>Poste</th>
                  <th>Entreprise</th>
                  <th>Localisation</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Date de candidature</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((application, index) => (
                  <tr key={application._id}>
                    <td>
                      <strong>{application.jobOffer?.title}</strong>
                      <br />
                      <small className="text-muted">
                        {application.jobOffer?.domain?.name || 'Non spécifié'}
                      </small>
                    </td>
                    <td>{application.jobOffer?.company?.name}</td>
                    <td>{application.jobOffer?.location}</td>
                    <td>
                      <span className={`job-type ${application.jobOffer?.jobType}`}>
                        {application.jobOffer?.jobType === 'alternance' ? 'Alternance' : 'Stage'}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${getStatusClass(application.status)}`}>
                        {getStatusLabel(application.status)}
                      </span>
                    </td>
                    <td>{formatDate(application.applicationDate)}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleViewDetails(application)}
                      >
                        Voir détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-center mt-3">
            <Pagination count={pages} page={currentPage} onChange={handlePageChange} />
          </div>
        </>
      )}
        </div>

      </div>
      {showDetails && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => {
            setShowDetails(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </main>
  );
};

// Application Details Modal Component
const ApplicationDetailsModal = ({ application, onClose }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'En attente',
      reviewed: 'Examinée',
      accepted: 'Acceptée',
      rejected: 'Refusée'
    };
    return labels[status] || status;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content application-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Détails de la candidature</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="job-summary">
            <h3>{application.jobOffer?.title}</h3>
            <div className="company-details">
              <p><strong>Entreprise:</strong> {application.jobOffer?.company?.name}</p>
              <p><strong>Localisation:</strong> {application.jobOffer?.location}</p>
              <p><strong>Type:</strong> {application.jobOffer?.jobType === 'alternance' ? 'Alternance' : 'Stage'}</p>
              <p><strong>Domaine:</strong> {application.jobOffer?.domain?.name}</p>
            </div>
          </div>

          <div className="application-status-section">
            <h4>Statut de la candidature</h4>
            <span className={`status status-${application.status}`}>
              {getStatusLabel(application.status)}
            </span>
            <div className="status-timeline">
              <div className="timeline-item">
                <strong>Candidature envoyée:</strong> {formatDate(application.applicationDate)}
              </div>
              {application.reviewDate && (
                <div className="timeline-item">
                  <strong>Candidature examinée:</strong> {formatDate(application.reviewDate)}
                </div>
              )}
              {application.interviewDate && (
                <div className="timeline-item">
                  <strong>Entretien programmé:</strong> {formatDate(application.interviewDate)}
                </div>
              )}
            </div>
          </div>

          <div className="cover-letter-section">
            <h4>Votre lettre de motivation</h4>
            <div className="cover-letter-content">
              {application.coverLetter}
            </div>
          </div>

          <div className="resume-section">
            <h4>CV fourni</h4>
            <p>{application.resume}</p>
          </div>

          {application.reviewNotes && (
            <div className="review-notes-section">
              <h4>Notes de l'entreprise</h4>
              <div className="review-notes">
                {application.reviewNotes}
              </div>
            </div>
          )}

          {application.interviewNotes && (
            <div className="interview-notes-section">
              <h4>Notes d'entretien</h4>
              <div className="interview-notes">
                {application.interviewNotes}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-modal-btn" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
