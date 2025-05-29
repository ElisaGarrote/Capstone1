// Update the accessories API base URL
export const ACCESSORIES_API_BASE_URL = 'http://localhost:8004';

// Function to fetch accessories
export const fetchAccessories = async () => {
  try {
    const response = await fetch(`${ACCESSORIES_API_BASE_URL}/accessories/`);
    if (!response.ok) {
      throw new Error('Failed to fetch accessories');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching accessories:', error);
    throw error;
  }
};