import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './jobOffer.css';

const JobOffer = ({ job, onJobClick, onApplyClick, user }) => {
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingApplication, setCheckingApplication] = useState(false);
  // Check if user has already applied when component mounts
  useEffect(() => {
    if (user?.user?.isStudent && user?.token) {
      checkIfApplied();
    }
  }, [user, job._id]);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getJobTypeLabel = (jobType) => {
    // jobType is now a SearchType object with a name property
    return jobType?.name || 'Non spécifié';
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
    if (hasApplied) {
      return; // Do nothing if already applied
    }
    if (user?.user?.isStudent) {
      onApplyClick(job);
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  };

  const getApplyButtonText = () => {
    if (checkingApplication) return 'Vérification...';
    if (hasApplied) return 'Déjà postulé';
    if (user?.user?.isStudent) return 'Postuler';
    return 'Se connecter';
  };

  const isApplyButtonDisabled = () => {
    return checkingApplication || hasApplied;
  };

  return (
    <div className="job-offer-card" onClick={() => onJobClick(job)}>
      <div className="job-offer-header">
        <div className="company-logo">
          <img 
            src={`${process.env.REACT_APP_PUBLIC_FOLDER}${job.company.profilePicture}`} 
            alt={job.company.name}
            onError={(e) => {
              e.target.src = `${process.env.REACT_APP_PUBLIC_FOLDER}pic2.jpg`;
            }}
          />
        </div>
        <div className="job-offer-meta">
          <span className={`job-type-badge ${job.jobType?.name?.toLowerCase()}`}>
            {getJobTypeLabel(job.jobType)}
          </span>
          <span className="job-date">{formatDate(job.publicationDate)}</span>
        </div>
      </div>
      
      <div className="job-offer-content">
        <h3 className="job-title">{job.title}</h3>
        <div className="company-info">
          <h4 className="company-name">{job.company.name}</h4>
          <p className="job-location">
            <i className="fas fa-map-marker-alt"></i>
            {job.location}
          </p>
        </div>
        
        <p className="job-description">
          {job.description.substring(0, 150)}...
        </p>
        
        <div className="job-tags">
          <span className="job-domain">{job.domain?.name}</span>
          {job.salary && <span className="job-salary">{job.salary}</span>}
        </div>
      </div>
      
      <div className="job-offer-footer">
        <div className="job-details">
          <span className="job-duration">
            {job.duration && `Durée: ${job.duration}`}
          </span>
          <span className="job-start-date">
            Début: {formatDate(job.startDate)}
          </span>
        </div>
        
        <div className="job-actions">
          <button className="view-details-btn">
            Voir détails
          </button>
          <button
            className={`apply-btn ${hasApplied ? 'already-applied' : ''}`}
            onClick={handleApplyClick}
            disabled={isApplyButtonDisabled()}
          >
            {getApplyButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobOffer;
