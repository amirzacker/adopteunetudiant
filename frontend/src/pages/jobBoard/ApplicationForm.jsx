import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const ApplicationForm = ({ job, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    coverLetter: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  // Check if user has already applied when component mounts
  React.useEffect(() => {
    checkIfApplied();
  }, []);

  const checkIfApplied = async () => {
    if (!user?.user?.isStudent || !user?.token) return;

    // Use _id instead of id for consistency
    const userId = user.user._id || user.user.id;
    if (!userId) {
      console.error('User ID not found');
      return;
    }

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
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.coverLetter.trim()) {
      setError('La lettre de motivation est requise');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const applicationData = {
        jobOffer: job._id,
        coverLetter: formData.coverLetter,
        resume: user?.user?.cv || 'CV from profile'
      };

      await axios.post('/api/jobApplications', applicationData, {
        headers: {
          'x-access-token': user.token,
          'Content-Type': 'application/json'
        }
      });

      onSuccess();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Erreur lors de l\'envoi de la candidature');
      }
      console.error('Error submitting application:', err);
    } finally {
      setLoading(false);
    }
  };

  if (hasApplied) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content application-form-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Candidature déjà envoyée</h2>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="already-applied-message">
              <div className="success-icon">✓</div>
              <h3>Vous avez déjà postulé à cette offre</h3>
              <p>Votre candidature pour le poste "{job.title}" chez {job.company.name} a déjà été envoyée.</p>
              <p>Vous pouvez suivre le statut de votre candidature dans votre tableau de bord.</p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="cancel-btn" onClick={onClose}>Fermer</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content application-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Postuler à: {job.title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="job-summary">
              <h3>{job.company.name}</h3>
              <p><strong>Poste:</strong> {job.title}</p>
              <p><strong>Localisation:</strong> {job.location}</p>
              <p><strong>Type:</strong> {job.jobType?.name || 'Non spécifié'}</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="coverLetter">
                Lettre de motivation <span className="required">*</span>
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleInputChange}
                placeholder="Expliquez pourquoi vous êtes intéressé(e) par ce poste et ce que vous pouvez apporter à l'entreprise..."
                rows={8}
                required
                disabled={loading}
              />
              <div className="char-count">
                {formData.coverLetter.length}/2000 caractères
              </div>
            </div>



            <div className="application-info">
              <h4>Informations de candidature</h4>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Nom:</strong> {user.user.firstname} {user.user.lastname}
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {user.user.email}
                </div>
                <div className="info-item">
                  <strong>Domaine:</strong> {user.user.domain?.name || 'Non spécifié'}
                </div>
                <div className="info-item">
                  <strong>Type de recherche:</strong> {user.user.searchType?.name || 'Non spécifié'}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer ma candidature'}
            </button>
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm;
