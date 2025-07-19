import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { Pagination } from '@material-ui/lab';
import JobOffer from '../../components/jobOffer/JobOffer';
import ApplicationForm from './ApplicationForm';
import './jobBoard.css';

const JobBoard = () => {
  const { user } = useContext(AuthContext);
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    domain: '',
    jobType: '',
    location: ''
  });
  const [domains, setDomains] = useState([]);
  const [searchTypes, setSearchTypes] = useState([]);

  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const pages = Math.ceil(jobOffers.length / itemsPerPage);

  useEffect(() => {
    fetchJobOffers();
    fetchDomains();
    fetchSearchTypes();

  }, []);

  useEffect(() => {
    fetchJobOffers();
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters]);

  const fetchJobOffers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`/api/jobOffers?${params.toString()}`);
      setJobOffers(response.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des offres d\'emploi');
      console.error('Error fetching job offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDomains = async () => {
    try {
      const response = await axios.get('/api/domains');
      setDomains(response.data);
    } catch (err) {
      console.error('Error fetching domains:', err);
    }
  };

  const fetchSearchTypes = async () => {
    try {
      const response = await axios.get('/api/searchTypes');
      setSearchTypes(response.data);
    } catch (err) {
      console.error('Error fetching search types:', err);
    }
  };



  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      domain: '',
      jobType: '',
      location: ''
    });
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setShowApplicationForm(true);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return jobOffers.slice(startIndex, endIndex);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getJobTypeLabel = (jobType) => {
    // jobType is now a SearchType object with a name property
    return jobType?.name || 'Non spécifié';
  };

  if (loading) {
    return (
      <div className="job-board-public-container">
        <div className="loading">Chargement des offres d'emploi...</div>
      </div>
    );
  }

  return (
    <div className="job-board-public-container">
      {/* Header Section */}
      <div className="job-board-public-header">
        <h1>Offres d'emploi</h1>
        <p>Trouvez votre prochaine opportunité professionnelle</p>
      </div>

      {/* Filters Section */}
      <section className="job-board-filters">
        <div className="container">
          <div className="filters-container">
            <div className="filters-row">
              <div className="filter-group">
                <select
                  className="form-control"
                  value={filters.domain}
                  onChange={(e) => handleFilterChange('domain', e.target.value)}
                >
                  <option value="">Tous les domaines</option>
                  {domains.map(domain => (
                    <option key={domain._id} value={domain._id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher par mot-clé..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <select
                  className="form-control"
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                >
                  <option value="">Tous les types</option>
                  {searchTypes.map(type => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Localisation..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              <div className="filter-group">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-secondary clear-btn"
                >
                  Effacer
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && <div className="error-message">{error}</div>}

      {/* Job Results Section */}
      <div className="job-board-results">
        <div className="container">
          <div className="results-header">
            <div className="results-info">
              <h2>{jobOffers.length} offre(s) trouvée(s)</h2>
              {pages > 1 && (
                <span className="page-info">
                  Page {currentPage} sur {pages}
                </span>
              )}
            </div>

            {/* Pagination Top */}
            {pages > 1 && (
              <div className="pagination-top">
                <Pagination
                  count={pages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="medium"
                  showFirstButton
                  showLastButton
                />
              </div>
            )}
          </div>

          {jobOffers.length === 0 ? (
            <div className="no-results">
              <p>Aucune offre d'emploi ne correspond à vos critères.</p>
            </div>
          ) : (
            <>
              <div className="job-offers-grid">
                {getCurrentPageItems().map(job => (
                  <JobOffer
                    key={job._id}
                    job={job}
                    onJobClick={handleJobClick}
                    onApplyClick={handleApplyClick}
                    user={user}
                  />
                ))}
              </div>

              {/* Pagination Bottom */}
              {pages > 1 && (
                <div className="pagination-bottom">
                  <Pagination
                    count={pages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && !showApplicationForm && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => setShowApplicationForm(true)}
          user={user}
        />
      )}

      {/* Application Form Modal */}
      {showApplicationForm && selectedJob && (
        <ApplicationForm
          job={selectedJob}
          onClose={() => {
            setShowApplicationForm(false);
            setSelectedJob(null);
          }}
          onSuccess={() => {
            setShowApplicationForm(false);
            setSelectedJob(null);
            alert('Candidature envoyée avec succès!');
          }}
        />
      )}
    </div>
  );
};

// Job Detail Modal Component
const JobDetailModal = ({ job, onClose, onApply, user }) => {
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);

  // Check if user has already applied when component mounts
  useEffect(() => {
    if (user?.user?.isStudent && user?.token) {
      checkIfApplied();
    }
  }, [user, job._id]);

  const getJobTypeLabel = (jobType) => {
    // jobType is now a SearchType object with a name property
    return jobType?.name || 'Non spécifié';
  };

  const checkIfApplied = async () => {
    if (!user?.user?.isStudent || !user?.token) return;

    // Use _id instead of id for consistency
    const userId = user.user._id || user.user.id;
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    setCheckingApplication(true);
    try {
      const response = await axios.get(
        `/api/jobApplications/check/${userId}/${job._id}`,
        {
          headers: {
            'x-access-token': user.token
          }
        }
      );
      setHasApplied(response.data.hasApplied);
    } catch (err) {
      console.error('Error checking application status:', err);
      // Don't set hasApplied to true on error, keep it false
    } finally {
      setCheckingApplication(false);
    }
  };

  const handleApplyClick = () => {
    if (hasApplied) return;
    onApply();
  };

  const getApplyButtonText = () => {
    if (checkingApplication) return 'Vérification...';
    if (hasApplied) return 'Déjà postulé';
    return 'Postuler à cette offre';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content job-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{job.title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="job-detail-header">
            <div className="company-info">
              <h3>{job.company.name}</h3>
              <p>{job.company.city}</p>
            </div>
            <div className="job-meta-detail">
              <span className={`job-type ${job.jobType?.name?.toLowerCase()}`}>
                {getJobTypeLabel(job.jobType)}
              </span>
              <span className="job-location">{job.location}</span>
            </div>
          </div>

          <div className="job-detail-content">
            <section>
              <h4>Description du poste</h4>
              <p>{job.description}</p>
            </section>

            <section>
              <h4>Exigences</h4>
              <p>{job.requirements}</p>
            </section>

            <div className="job-detail-grid">
              <div className="detail-item">
                <strong>Domaine:</strong> {job.domain?.name}
              </div>
              <div className="detail-item">
                <strong>Type d'emploi:</strong> {job.jobType?.name}
              </div>
              {job.salary && (
                <div className="detail-item">
                  <strong>Salaire:</strong> {job.salary}
                </div>
              )}
              {job.duration && (
                <div className="detail-item">
                  <strong>Durée:</strong> {job.duration}
                </div>
              )}
              <div className="detail-item">
                <strong>Date de début:</strong> {new Date(job.startDate).toLocaleDateString('fr-FR')}
              </div>
              <div className="detail-item">
                <strong>Date de fin:</strong> {new Date(job.endDate).toLocaleDateString('fr-FR')}
              </div>
            </div>

            {job.benefits && (
              <section>
                <h4>Avantages</h4>
                <p>{job.benefits}</p>
              </section>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {user?.user?.isStudent && (
            <button
              className={`apply-btn-modal ${hasApplied ? 'already-applied' : ''}`}
              onClick={handleApplyClick}
              disabled={checkingApplication || hasApplied}
            >
              {getApplyButtonText()}
            </button>
          )}
          <button className="cancel-btn" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};



export default JobBoard;
