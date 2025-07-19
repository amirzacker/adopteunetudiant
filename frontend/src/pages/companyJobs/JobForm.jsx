import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const JobForm = ({ job, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    requirements: '',
    jobType: 'stage',
    domain: '',
    searchType: '',
    salary: '',
    duration: '',
    startDate: '',
    endDate: '',
    applicationDeadline: '',
    benefits: '',
    workingHours: '',
    status: 'draft'
  });
  const [domains, setDomains] = useState([]);
  const [searchTypes, setSearchTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDomains();
    fetchSearchTypes();
    
    if (job) {
      // Populate form with existing job data
      setFormData({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        requirements: job.requirements || '',
        jobType: job.jobType || 'stage',
        domain: job.domain?._id || '',
        searchType: job.searchType?._id || '',
        salary: job.salary || '',
        duration: job.duration || '',
        startDate: job.startDate ? new Date(job.startDate).toISOString().split('T')[0] : '',
        endDate: job.endDate ? new Date(job.endDate).toISOString().split('T')[0] : '',
        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
        benefits: job.benefits || '',
        workingHours: job.workingHours || '',
        status: job.status || 'draft'
      });
    }
  }, [job]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['title', 'description', 'location', 'requirements', 'jobType', 'domain', 'searchType', 'startDate', 'endDate'];
    
    for (let field of required) {
      if (!formData[field]) {
        setError(`Le champ ${getFieldLabel(field)} est requis`);
        return false;
      }
    }

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const today = new Date();
    
    if (startDate < today) {
      setError('La date de début doit être dans le futur');
      return false;
    }
    
    if (endDate <= startDate) {
      setError('La date de fin doit être après la date de début');
      return false;
    }

    if (formData.applicationDeadline) {
      const deadline = new Date(formData.applicationDeadline);
      if (deadline < today || deadline > startDate) {
        setError('La date limite de candidature doit être entre aujourd\'hui et la date de début');
        return false;
      }
    }

    return true;
  };

  const getFieldLabel = (field) => {
    const labels = {
      title: 'Titre',
      description: 'Description',
      location: 'Localisation',
      requirements: 'Exigences',
      jobType: 'Type d\'emploi',
      domain: 'Domaine',
      searchType: 'Type de recherche',
      startDate: 'Date de début',
      endDate: 'Date de fin'
    };
    return labels[field] || field;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const jobData = { ...formData };
      
      if (job) {
        // Update existing job
        await axios.put(`/api/jobOffers/${job._id}`, jobData, {
          headers: {
            'x-access-token': user.token,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Create new job
        await axios.post('/api/jobOffers', jobData, {
          headers: {
            'x-access-token': user.token,
            'Content-Type': 'application/json'
          }
        });
      }

      onSuccess();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Erreur lors de la sauvegarde de l\'offre d\'emploi');
      }
      console.error('Error saving job offer:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content job-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{job ? 'Modifier l\'offre d\'emploi' : 'Créer une nouvelle offre d\'emploi'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">
                  Titre du poste <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Ex: Développeur Web Junior"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  Localisation <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ex: Paris, France"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="jobType">
                  Type d'emploi <span className="required">*</span>
                </label>
                <select
                  id="jobType"
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="stage">Stage</option>
                  <option value="alternance">Alternance</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="domain">
                  Domaine <span className="required">*</span>
                </label>
                <select
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Sélectionner un domaine</option>
                  {domains.map(domain => (
                    <option key={domain._id} value={domain._id}>
                      {domain.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="searchType">
                  Type de recherche <span className="required">*</span>
                </label>
                <select
                  id="searchType"
                  name="searchType"
                  value={formData.searchType}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                >
                  <option value="">Sélectionner un type</option>
                  {searchTypes.map(type => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="salary">Salaire</label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="Ex: 1200€/mois"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">
                Description du poste <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez le poste, les missions, l'environnement de travail..."
                rows={6}
                required
                disabled={loading}
              />
              <div className="char-count">
                {formData.description.length}/2000 caractères
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="requirements">
                Exigences et qualifications <span className="required">*</span>
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="Listez les compétences, diplômes et expériences requis..."
                rows={4}
                required
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">
                  Date de début <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">
                  Date de fin <span className="required">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duration">Durée</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="Ex: 6 mois"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="applicationDeadline">Date limite de candidature</label>
                <input
                  type="date"
                  id="applicationDeadline"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="benefits">Avantages</label>
              <textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleInputChange}
                placeholder="Tickets restaurant, télétravail, formation..."
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="workingHours">Horaires de travail</label>
                <input
                  type="text"
                  id="workingHours"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleInputChange}
                  placeholder="Ex: 9h-17h, temps partiel..."
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Statut</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Sauvegarde...' : (job ? 'Mettre à jour' : 'Créer l\'offre')}
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

export default JobForm;
