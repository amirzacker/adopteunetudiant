import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getJobOffers } from '../../apiCalls';
import './jobOffersPreview.css';

const JobOffersPreview = () => {
  const [jobOffers, setJobOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestJobOffers();
  }, []);

  const fetchLatestJobOffers = async () => {
    try {
      const offers = await getJobOffers();
      // Get the 6 most recent job offers
      setJobOffers(offers.slice(0, 6));
    } catch (err) {
      console.error('Error fetching job offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getJobTypeLabel = (jobType) => {
    return jobType === 'alternance' ? 'Alternance' : 'Stage';
  };

  if (loading) {
    return (
      <section className="job-offers-preview">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h2>DERNIÈRES OFFRES D'EMPLOI</h2>
              <div className="loading-preview">Chargement des offres...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (jobOffers.length === 0) {
    return (
      <section className="job-offers-preview">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h2>DERNIÈRES OFFRES D'EMPLOI</h2>
              <div className="no-offers">
                <p>Aucune offre d'emploi disponible pour le moment.</p>
                <Link to="/job-board" className="browse-all-btn">
                  Voir toutes les offres
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="job-offers-preview">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <h2>DERNIÈRES OFFRES D'EMPLOI</h2>
            <p className="section-subtitle">Découvrez les opportunités récemment publiées</p>
          </div>
        </div>
        
        <div className="row">
          {jobOffers.map(job => (
            <div key={job._id} className="col-md-6 col-lg-4">
              <div className="job-preview-card">
                <div className="job-preview-header">
                  <div className="company-logo">
                    <img 
                      src={`${process.env.REACT_APP_PUBLIC_FOLDER}${job.company.profilePicture}`} 
                      alt={job.company.name}
                      onError={(e) => {
                        e.target.src = `${process.env.REACT_APP_PUBLIC_FOLDER}pic2.jpg`;
                      }}
                    />
                  </div>
                  <div className="job-preview-meta">
                    <span className={`job-type-badge ${job.jobType}`}>
                      {getJobTypeLabel(job.jobType)}
                    </span>
                    <span className="job-date">{formatDate(job.publicationDate)}</span>
                  </div>
                </div>
                
                <div className="job-preview-content">
                  <h4 className="job-title">{job.title}</h4>
                  <p className="company-name">{job.company.name}</p>
                  <p className="job-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {job.location}
                  </p>
                  <p className="job-description">
                    {job.description.substring(0, 100)}...
                  </p>
                  
                  <div className="job-preview-footer">
                    <span className="job-domain">{job.domain?.name}</span>
                    <Link to="/job-board" className="view-job-btn">
                      Voir l'offre
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="row">
          <div className="col-md-12 text-center">
            <Link to="/job-board" className="view-all-jobs-btn">
              Voir toutes les offres d'emploi
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobOffersPreview;
