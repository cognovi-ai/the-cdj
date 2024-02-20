import { useFlash } from '../contexts/useFlash';
import { useJournal } from '../contexts/useJournal';

import { v4 as uuid } from 'uuid';

const BASE_URL = import.meta.env.VITE_REPORTS_URL;

export function useReports() {
    const { journalId } = useJournal();
    const { setFlash } = useFlash();

    const response = async (endpoint, method, headers = {}, body = {}) => {
        try {
            // Construct the URL with the specific journal ID
            const url = BASE_URL + journalId + '/reports' + endpoint;

            // Prepare the options for the fetch request
            const options = {
                method,
                headers,
                credentials: 'include'
            };

            // Add body to the options if the method is not GET
            if (method !== 'GET' && method !== 'HEAD') {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url, options);
            const data = await response.json();

            if (data.flash) {
                // Append new flash messages with UUIDs
                setFlash(prevFlash => {
                    const newFlash = { ...prevFlash };
                    Object.keys(data.flash).forEach(severity => {
                        const messagesWithIds = data.flash[severity].map(text => ({
                            id: uuid(),
                            text
                        }));
                        newFlash[severity] = newFlash[severity] ? [...newFlash[severity], ...messagesWithIds] : [...messagesWithIds];
                    });
                    return newFlash;
                });
            }

            if (!response.ok) {
                throw 'Network response was not ok';
            }

            return data;

        } catch (error) {
            throw new Error(error);
        }
    }

    return response;
}
