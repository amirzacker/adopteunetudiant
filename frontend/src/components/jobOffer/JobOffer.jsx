import React from 'react';
import './jobOffer.css';

const JobOffer = ({ job, onJobClick, onApplyClick, user }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getJobTypeLabel = (jobType) => {
    return jobType === 'alternance' ? 'Alternance' : 'Stage';
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
    if (user?.user?.isStudent) {
      onApplyClick(job);
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
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
          <span className={`job-type-badge ${job.jobType}`}>
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
            className="apply-btn"
            onClick={handleApplyClick}
          >
            {user?.user?.isStudent ? 'Postuler' : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobOffer;
