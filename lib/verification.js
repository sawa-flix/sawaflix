import { createClient } from "../utils/supabase/client";
import { BACKEND_URL } from "./apiConfig";

const BASE_URL = `${BACKEND_URL}/api`;

/**
 * Gets or creates a local visitor ID for anonymous tracking.
 */
function getVisitorId() {
  if (typeof window === "undefined") return null;
  let id = localStorage.getItem("sawaflix_visitor_id");
  if (!id) {
    id =
      "visitor_" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    localStorage.setItem("sawaflix_visitor_id", id);
  }
  return id;
}

/**
 * Gets auth and visitor headers.
 */
async function getHeaders(contentType = null) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { data: { user } } = await supabase.auth.getUser(); // Suppress Next.js warning
  const token = session?.access_token;
  console.log("Getting Token", token)
  const visitorId = getVisitorId();

  const headers = {};
  if (contentType) headers["Content-Type"] = contentType;

  if (token) {
    headers["authorization"] = `Bearer ${token}`;
  } else if (visitorId) {
    headers["x-visitor-id"] = visitorId;
  }
  return headers;
}

/**
 * Uploads a file to the server.
 * @param {File} file - The file to upload.
 * @param {string} category - The category for the file (e.g., 'profile_picture', 'document').
 * @returns {Promise<object>} - The response from the server.
 */
export async function uploadFile(file, category) {
  const formData = new FormData();
  
  // Map frontend categories to backend expected fields
  let fieldName = category;
  if (category === 'id') fieldName = 'national_id';
  if (category === 'endorsements') fieldName = 'endorsement_letter';
  if (category === 'recording') fieldName = 'recording';
  
  formData.append(fieldName, file);
  formData.append("category", category);

  const headers = await getHeaders();
  // FormData automatically sets Content-Type: multipart/form-data with boundary,
  // so we don't explicitly set it here.

  const response = await fetch(`${BASE_URL}/verification/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: response.statusText };
    }
    throw new Error(
      errorData.details ||
      errorData.error ||
      `Upload failed: ${response.status} ${response.statusText}`,
    );
  }

  const result = await response.json();
  
  // The hosted backend secretly merges the URLs into the data object
  // Let's extract the URL so the frontend components don't break
  let extractedUrl = result.url; // In case the backend was updated to return it directly
  if (!extractedUrl && result.data && result.data.form_data && result.data.form_data.documents) {
      if (category === 'id') extractedUrl = result.data.form_data.documents.id_url;
      else if (category === 'endorsements') extractedUrl = result.data.form_data.documents.endorsements_url;
      else if (category === 'recording') extractedUrl = result.data.form_data.documents.recording_url || result.data.form_data.documents.recordings_url;
      else extractedUrl = result.data.form_data.documents[`${fieldName}_url`];
  }

  return { ...result, url: extractedUrl };
}

/**
 * Retrieves saved verification progress (Draft Recovery).
 * @returns {Promise<{message: string, data: any} | null>}
 */
export async function getDraft() {
  const headers = await getHeaders();

  const response = await fetch(`${BASE_URL}/verification/form`, {
    headers,
  });

  if (response.status === 404 || response.status === 401) return null;
  if (!response.ok) throw new Error("Failed to retrieve draft");

  const result = await response.json();
  return result.data ? result : null;
}

/**
 * Saves verification progress as a draft.
 * @param {object} data - { category, form_data }
 */
export async function saveDraft(data) {
  const headers = await getHeaders("application/json");

  const response = await fetch(`${BASE_URL}/verification/draft`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to save draft");
  }

  return response.json();
}

/**
 * Finalizes and submits the verification application.
 * @param {object} data - Full verification form data
 */
export async function submitVerification(data) {
  const headers = await getHeaders("application/json");

  const response = await fetch(`${BASE_URL}/verification/submit_verification`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to submit verification");
  }

  return response.json();
}
