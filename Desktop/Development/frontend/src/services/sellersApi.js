import { http } from './http';

export const sellersApi = {
  requirements: (payload) => http.post('sellers/requirements/', payload),
  createApplication: (payload) => http.post('sellers/applications/', payload),
  myApplication: () => http.get('sellers/applications/me/'),
  updateApplication: (id, payload) => http.patch(`sellers/applications/${id}/`, payload),
  uploadDocument: (applicationId, { document_type, file, metadata }) => {
    const form = new FormData();
    form.append('document_type', document_type);
    form.append('file', file);
    if (metadata) form.append('metadata', JSON.stringify(metadata));
    return http.post(`sellers/applications/${applicationId}/documents/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  myProfile: () => http.get('sellers/profile/me/'),
  adminListApplications: () => http.get('sellers/admin/seller-applications/'),
  adminGetApplication: (id) => http.get(`sellers/admin/seller-applications/${id}/`),
  adminReviewApplication: (id, payload) => http.post(`sellers/admin/seller-applications/${id}/review/`, payload),
};

