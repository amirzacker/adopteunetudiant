import axios from "axios";

export const loginCall = async (userCredential, dispatch) => {
  dispatch({ type: "LOGIN_START" });
  try {
    const res = await axios.post("/api/login", userCredential);
    dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
  } catch (err) {
    dispatch({ type: "LOGIN_FAILURE", payload: err });
  }
};

// Job Offers API calls
export const getJobOffers = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  });

  const response = await axios.get(`/api/jobOffers?${params.toString()}`);
  return response.data;
};

export const getJobOfferById = async (id) => {
  const response = await axios.get(`/api/jobOffers/${id}`);
  return response.data;
};

export const createJobOffer = async (jobData, token) => {
  const response = await axios.post('/api/jobOffers', jobData, {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const updateJobOffer = async (id, jobData, token) => {
  const response = await axios.put(`/api/jobOffers/${id}`, jobData, {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const deleteJobOffer = async (id, token) => {
  await axios.delete(`/api/jobOffers/${id}`, {
    headers: {
      'x-access-token': token
    }
  });
};

export const publishJobOffer = async (id, token) => {
  const response = await axios.put(`/api/jobOffers/${id}/publish`, {}, {
    headers: {
      'x-access-token': token
    }
  });
  return response.data;
};

export const closeJobOffer = async (id, token) => {
  const response = await axios.put(`/api/jobOffers/${id}/close`, {}, {
    headers: {
      'x-access-token': token
    }
  });
  return response.data;
};

// Job Applications API calls
export const submitJobApplication = async (applicationData, token) => {
  const response = await axios.post('/api/jobApplications', applicationData, {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const getStudentApplications = async (studentId, token) => {
  const response = await axios.get(`/api/jobApplications/student/${studentId}`, {
    headers: {
      'x-access-token': token
    }
  });
  return response.data;
};

export const getCompanyApplications = async (companyId, token) => {
  const response = await axios.get(`/api/jobApplications/company/${companyId}`, {
    headers: {
      'x-access-token': token
    }
  });
  return response.data;
};

export const updateApplicationStatus = async (applicationId, status, reviewNotes, token) => {
  const response = await axios.put(`/api/jobApplications/${applicationId}/status`, {
    status,
    reviewNotes
  }, {
    headers: {
      'x-access-token': token,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const checkIfApplied = async (studentId, jobOfferId, token) => {
  const response = await axios.get(`/api/jobApplications/check/${studentId}/${jobOfferId}`, {
    headers: {
      'x-access-token': token
    }
  });
  return response.data;
};

