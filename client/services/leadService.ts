
export interface LeadData {
    email: string;
    name: string;
    organization_type?: string;
    audit_url: string;
}

// Backend URL logic
const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://mus-node-production.up.railway.app' : 'http://localhost:3000');

/**
 * Creates a new lead record via the backend API.
 */
export async function createLead(data: LeadData): Promise<{ error: string | null }> {
    try {
        const response = await fetch(`${backendUrl}/api/v1/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData.error || 'Failed to create lead' };
        }

        return { error: null };
    } catch (err: any) {
        console.error('Unexpected error creating lead:', err);
        return { error: err.message || 'Failed to create lead' };
    }
}

/**
 * Updates a lead status to verified via the backend API.
 */
export async function verifyLead(email: string): Promise<{ error: string | null }> {
    try {
        const response = await fetch(`${backendUrl}/api/v1/leads/verify`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData.error || 'Failed to verify lead' };
        }

        return { error: null };
    } catch (err: any) {
        console.error('Error verifying lead:', err);
        return { error: err.message };
    }
}
