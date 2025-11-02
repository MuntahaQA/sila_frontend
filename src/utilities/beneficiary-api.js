import { getRequest, postRequest, patchRequest, deleteRequest } from './sendRequest';

// Beneficiary API functions
export const getBeneficiaries = () => getRequest('/api/beneficiaries/');
export const getBeneficiary = (id) => getRequest(`/api/beneficiaries/${id}/`);
export const createBeneficiary = (data) => postRequest('/api/beneficiaries/', data);
export const updateBeneficiary = (id, data) => patchRequest(`/api/beneficiaries/${id}/`, data);
export const deleteBeneficiary = (id) => deleteRequest(`/api/beneficiaries/${id}/`);

// Programs API functions
export const getPrograms = () => getRequest('/api/programs/');
export const getProgram = (id) => getRequest(`/api/programs/${id}/`);
export const applyToProgram = (id) => postRequest(`/api/programs/${id}/apply/`);

// Events API functions
export const getEvents = () => getRequest('/api/events/');
export const getEvent = (id) => getRequest(`/api/events/${id}/`);
export const createEvent = (data) => postRequest('/api/events/', data);
export const updateEvent = (id, data) => patchRequest(`/api/events/${id}/`, data);
export const deleteEvent = (id) => deleteRequest(`/api/events/${id}/`);
export const registerForEvent = (id) => postRequest(`/api/events/${id}/register/`);

// Applications API functions
export const getApplications = () => getRequest('/api/applications/');
export const getApplication = (id) => getRequest(`/api/applications/${id}/`);

// Charities API functions
export const getCharities = () => getRequest('/api/charities/');
export const getCharity = (id) => getRequest(`/api/charities/${id}/`);
export const createCharity = (data) => postRequest('/api/charities/', data);
export const updateCharity = (id, data) => patchRequest(`/api/charities/${id}/`, data);

