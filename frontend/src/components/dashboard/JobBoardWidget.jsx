import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const JobBoardWidget = () => {
  const { user } = useContext(AuthContext);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.user?.isStudent) {
      fetchRecommendedJobs();
      fetchMyApplications();
      fetchStats();
    }
  }, [user]);

  const fetchRecommendedJobs = async () => {
    try {
      if ((!user?.user?.id && !user?.user?._id) || !user?.token) {
        return;
      }

      const userId = user.user._id || user.user.id;
      const response = await axios.get(`/api/jobOffers/student/${userId}/recommended?limit=3`, {
        headers: {
          'x-access-token': user.token
        }
      });
      setRecommendedJobs(response.data);
    } catch (err) {
      console.error('Error fetching recommended jobs:', err);
    }
  };

  const fetchMyApplications = async () => {
    try {
      if ((!user?.user?.id && !user?.user?._id) || !user?.token) {
        return;
      }

      const userId = user.user._id || user.user.id;
      const response = await axios.get(`/api/jobApplications/student/${userId}`, {
        headers: {
          'x-access-token': user.token
        }
      });
      setMyApplications(response.data.slice(0, 3)); // Get latest 3 applications
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const fetchStats = async () => {
    try {
      if ((!user?.user?.id && !user?.user?._id) || !user?.token) {
        setLoading(false);
        return;
      }

      const userId = user.user._id || user.user.id;
      const response = await axios.get(`/api/jobApplications/student/${userId}/stats`, {
        headers: {
          'x-access-token': user.token
        }
      });
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="job-board-widget">
        <div className="widget-loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="job-board-widget">
      <div className="widget-header">
        <h3>Offres d'emploi</h3>
        <Link to="/job-board" className="view-all-link">
          Voir toutes les offres
        </Link>
      </div>

      {/* Application Stats */}
      <div className="application-stats">
        <div className="stat-item">
          <span className="stat-number">{stats.total || 0}</span>
          <span className="stat-label">Candidatures</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.pending || 0}</span>
          <span className="stat-label">En attente</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{stats.accepted || 0}</span>
          <span className="stat-label">Acceptées</span>
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="widget-section">
        <h4>Offres recommandées</h4>
        {recommendedJobs.length === 0 ? (
          <p className="no-data">Aucune offre recommandée pour le moment.</p>
        ) : (
          <div className="job-list">
            {recommendedJobs.map(job => (
              <div key={job._id} className="job-item">
                <div className="job-header">
                  <h5>{job.title}</h5>
                  <span className={`job-type ${job.jobType}`}>
                    {job.jobType === 'alternance' ? 'Alternance' : 'Stage'}
                  </span>
                </div>
                <div className="job-details">
                  <span className="company">{job.company?.name}</span>
                  <span className="location">{job.location}</span>
                </div>
                <div className="job-meta">
                  <span className="domain">{job.domain?.name}</span>
                  <span className="date">{formatDate(job.publicationDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div className="widget-section">
        <h4>Mes candidatures récentes</h4>
        {myApplications.length === 0 ? (
          <p className="no-data">Vous n'avez pas encore postulé à des offres.</p>
        ) : (
          <div className="application-list">
            {myApplications.map(application => (
              <div key={application._id} className="application-item">
                <div className="application-header">
                  <h5>{application.jobOffer?.title}</h5>
                  <span className={`status ${getStatusClass(application.status)}`}>
                    {getStatusLabel(application.status)}
                  </span>
                </div>
                <div className="application-details">
                  <span className="company">{application.jobOffer?.company?.name}</span>
                  <span className="date">Candidature du {formatDate(application.applicationDate)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="widget-actions">
        <Link to="/job-board" className="action-btn primary">
          Parcourir les offres
        </Link>
        <Link to="/my-applications" className="action-btn secondary">
          Mes candidatures
        </Link>
      </div>
    </div>
  );
};

export default JobBoardWidget;
