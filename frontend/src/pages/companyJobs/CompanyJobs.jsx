import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import JobForm from './JobForm';
import ApplicationManagement from './ApplicationManagement';
import { Pagination } from '@material-ui/lab';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import './companyJobs.css';

const CompanyJobs = () => {
  const { user } = useContext(AuthContext);
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (user?.user?.isCompany) {
      fetchJobOffers();
    }
  }, [user]);

  const fetchJobOffers = async () => {
    try {
      setLoading(true);

      if (!user?.user?.id && !user?.user?._id) {
        throw new Error('User ID not found');
      }

      if (!user?.token) {
        throw new Error('Authentication token not found');
      }

      const userId = user.user._id || user.user.id;

      const response = await axios.get(`/api/jobOffers/company/${userId}?includeAll=true`, {
        headers: {
          'x-access-token': user.token
        }
      });
      setJobOffers(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des offres d\'emploi');
      console.error('Error fetching job offers:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleCreateJob = () => {
    setEditingJob(null);
    setShowJobForm(true);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre d\'emploi ?')) {
      return;
    }

    try {
      await axios.delete(`/api/jobOffers/${jobId}`, {
        headers: {
          'x-access-token': user.token
        }
      });
      fetchJobOffers();
    } catch (err) {
      setError('Erreur lors de la suppression de l\'offre d\'emploi');
      console.error('Error deleting job offer:', err);
    }
  };

  const handlePublishJob = async (jobId) => {
    try {
      await axios.put(`/api/jobOffers/${jobId}/publish`, {}, {
        headers: {
          'x-access-token': user.token
        }
      });
      fetchJobOffers();
    } catch (err) {
      setError('Erreur lors de la publication de l\'offre d\'emploi');
      console.error('Error publishing job offer:', err);
    }
  };

  const handleCloseJob = async (jobId) => {
    try {
      await axios.put(`/api/jobOffers/${jobId}/close`, {}, {
        headers: {
          'x-access-token': user.token
        }
      });
      fetchJobOffers();
    } catch (err) {
      setError('Erreur lors de la fermeture de l\'offre d\'emploi');
      console.error('Error closing job offer:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusLabel = (status) => {
    const labels = {
      draft: 'Brouillon',
      published: 'Publiée',
      closed: 'Fermée'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-${status}`;
  };

  // Pagination logic
  const pages = Math.ceil(jobOffers.length / itemsPerPage);
  const paginatedData = jobOffers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  if (!user?.user?.isCompany) {
    return (
      <div className="company-jobs-container">
        <div className="access-denied">
          <h2>Accès refusé</h2>
          <p>Cette page est réservée aux entreprises.</p>
        </div>
      </div>
    );
  }

  const Logout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <main>
      <DashboardSidebar
        user={user}
        PF={process.env.REACT_APP_PUBLIC_FOLDER}
        Logout={Logout}
        activePage="company-jobs"
      />

      <div className="dashboard-partition">
        <div className="company-jobs-header-card">
          <div className="header-content">
            <h4>Gestion des offres d'emploi</h4>
            <button className="create-job-btn" onClick={handleCreateJob}>
              <i className="fas fa-plus"></i>
              Créer une nouvelle offre
            </button>
          </div>
        </div>



        {/* Content Card */}
        <div className="content-card">
          <h4>Mes offres d'emploi</h4>
          {error && <div className="error-message">{error}</div>}
          
          {loading ? (
            <div className="loading">Chargement...</div>
          ) : jobOffers.length === 0 ? (
            <div className="no-jobs">
              <p>Vous n'avez pas encore créé d'offres d'emploi.</p>
              <button className="create-first-job-btn" onClick={handleCreateJob}>
                Créer votre première offre
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped striped bordered hover">
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Type</th>
                      <th>Localisation</th>
                      <th>Domaine</th>
                      <th>Candidatures</th>
                      <th>Statut</th>
                      <th>Créé le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((job, index) => (
                      <tr key={job._id}>
                        <td>
                          <strong>{job.title}</strong>
                          <br />
                          <small className="text-muted">
                            {job.description.substring(0, 50)}...
                          </small>
                        </td>
                        <td>{typeof job.jobType === 'object' ? (job.jobType?.name || 'Non spécifié') : (job.jobType || 'Non spécifié')}</td>
                        <td>{job.location}</td>
                        <td>{job.domain?.name || 'Non spécifié'}</td>
                        <td>{job.applicationCount || 0}</td>
                        <td>
                          <span className={`status ${getStatusClass(job.status)}`}>
                            {getStatusLabel(job.status)}
                          </span>
                        </td>
                        <td>{formatDate(job.createdAt)}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm mr-1"
                            onClick={() => handleEditJob(job)}
                            title="Modifier"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {job.status === 'draft' && (
                            <button
                              className="btn btn-success btn-sm mr-1"
                              onClick={() => handlePublishJob(job._id)}
                              title="Publier"
                            >
                              <i className="fas fa-paper-plane"></i>
                            </button>
                          )}
                          {job.status === 'published' && (
                            <button
                              className="btn btn-warning btn-sm mr-1"
                              onClick={() => handleCloseJob(job._id)}
                              title="Fermer"
                            >
                              <i className="fas fa-times-circle"></i>
                            </button>
                          )}
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteJob(job._id)}
                            title="Supprimer"
                          >
                            <i className="fas fa-trash"></i>
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

      {/* Job Form Modal */}
      {showJobForm && (
        <JobForm
          job={editingJob}
          onClose={() => {
            setShowJobForm(false);
            setEditingJob(null);
          }}
          onSuccess={() => {
            setShowJobForm(false);
            setEditingJob(null);
            fetchJobOffers();
          }}
        />
      )}
    </main>
  );
};

export default CompanyJobs;
