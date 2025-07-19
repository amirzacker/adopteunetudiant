import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Pagination } from '@material-ui/lab';

const ApplicationManagement = ({ companyId }) => {
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
    if (companyId) {
      fetchApplications();
    }
  }, [companyId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      if (!companyId) {
        throw new Error('Company ID is required');
      }

      if (!user?.token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`/api/jobApplications/company/${companyId}`, {
        headers: {
          'x-access-token': user.token
        }
      });
      setApplications(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des candidatures');
      console.error('Error fetching applications:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus, reviewNotes = '') => {
    try {
      await axios.put(`/api/jobApplications/${applicationId}/status`, {
        status: newStatus,
        reviewNotes
      }, {
        headers: {
          'x-access-token': user.token,
          'Content-Type': 'application/json'
        }
      });
      
      fetchApplications();
      if (selectedApplication && selectedApplication._id === applicationId) {
        setSelectedApplication(prev => ({ ...prev, status: newStatus, reviewNotes }));
      }
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut');
      console.error('Error updating application status:', err);
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

  if (loading) {
    return <div className="loading">Chargement des candidatures...</div>;
  }

  return (
    <div className="application-management">
      {error && <div className="error-message">{error}</div>}

      {/* Filter Buttons */}
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

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="no-applications">
          <p>Aucune candidature trouvée pour ce filtre.</p>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-striped striped bordered hover">
              <thead>
                <tr>
                  <th>Candidat</th>
                  <th>Poste</th>
                  <th>Domaine</th>
                  <th>Email</th>
                  <th>Date de candidature</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((application, index) => (
                  <tr key={application._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={`${process.env.REACT_APP_PUBLIC_FOLDER}${application.student.profilePicture}`}
                          alt={`${application.student.firstname} ${application.student.lastname}`}
                          onError={(e) => {
                            e.target.src = `${process.env.REACT_APP_PUBLIC_FOLDER}pic2.jpg`;
                          }}
                          style={{width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px'}}
                        />
                        <div>
                          <strong>{application.student.firstname} {application.student.lastname}</strong>
                        </div>
                      </div>
                    </td>
                    <td>{application.jobOffer?.title}</td>
                    <td>{application.student.domain?.name || 'Non spécifié'}</td>
                    <td>{application.student.email}</td>
                    <td>{formatDate(application.applicationDate)}</td>
                    <td>
                      <span className={`status ${getStatusClass(application.status)}`}>
                        {getStatusLabel(application.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm mr-1"
                        onClick={() => handleViewDetails(application)}
                      >
                        Voir détails
                      </button>

                      {(application.status === 'pending' || application.status === 'reviewed') && (
                        <>
                          <button
                            className="btn btn-success btn-sm mr-1"
                            onClick={() => handleStatusUpdate(application._id, 'accepted')}
                          >
                            Accepter
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleStatusUpdate(application._id, 'rejected')}
                          >
                            Refuser
                          </button>
                        </>
                      )}
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

      {/* Application Details Modal */}
      {showDetails && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => {
            setShowDetails(false);
            setSelectedApplication(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

// Application Details Modal Component
const ApplicationDetailsModal = ({ application, onClose, onStatusUpdate }) => {
  const [reviewNotes, setReviewNotes] = useState(application.reviewNotes || '');
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    await onStatusUpdate(application._id, newStatus, reviewNotes);
    setUpdating(false);
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content application-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Détails de la candidature</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="candidate-profile">
            <div className="profile-header">
              <img 
                src={`${process.env.REACT_APP_PUBLIC_FOLDER}${application.student.profilePicture}`} 
                alt={`${application.student.firstname} ${application.student.lastname}`}
                className="profile-avatar"
                onError={(e) => {
                  e.target.src = `${process.env.REACT_APP_PUBLIC_FOLDER}pic2.jpg`;
                }}
              />
              <div className="profile-info">
                <h3>{application.student.firstname} {application.student.lastname}</h3>
                <p>{application.student.email}</p>
                <span className={`status status-${application.status}`}>
                  {getStatusLabel(application.status)}
                </span>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Domaine:</strong> {application.student.domain?.name || 'Non spécifié'}
                </div>
                <div className="detail-item">
                  <strong>Type de recherche:</strong> {application.student.searchType?.name || 'Non spécifié'}
                </div>
                <div className="detail-item">
                  <strong>CV:</strong> {application.resume || 'Non fourni'}
                </div>
                <div className="detail-item">
                  <strong>Date de candidature:</strong> {formatDate(application.applicationDate)}
                </div>
              </div>
            </div>
          </div>

          <div className="job-info">
            <h4>Poste: {application.jobOffer?.title}</h4>
          </div>

          <div className="cover-letter">
            <h4>Lettre de motivation</h4>
            <div className="cover-letter-content">
              {application.coverLetter}
            </div>
          </div>

          <div className="review-section">
            <h4>Notes d'évaluation</h4>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Ajoutez vos notes sur cette candidature..."
              rows={4}
              disabled={updating}
            />
          </div>
        </div>

        <div className="modal-footer">
          {application.status !== 'accepted' && (
            <button 
              className="accept-btn"
              onClick={() => handleStatusUpdate('accepted')}
              disabled={updating}
            >
              {updating ? 'Mise à jour...' : 'Accepter'}
            </button>
          )}
          
          {application.status !== 'rejected' && (
            <button 
              className="reject-btn"
              onClick={() => handleStatusUpdate('rejected')}
              disabled={updating}
            >
              {updating ? 'Mise à jour...' : 'Refuser'}
            </button>
          )}
          
          {application.status === 'pending' && (
            <button 
              className="review-btn"
              onClick={() => handleStatusUpdate('reviewed')}
              disabled={updating}
            >
              {updating ? 'Mise à jour...' : 'Marquer comme examinée'}
            </button>
          )}
          
          <button className="cancel-btn" onClick={onClose} disabled={updating}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationManagement;
