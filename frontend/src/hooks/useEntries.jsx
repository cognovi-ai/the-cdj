import { useJournal } from '../context/useJournal';

const BASE_URL = 'http://192.168.50.157:3000/journals/';

export function useEntries() {
    const { journalId } = useJournal();

    const response = async (endpoint, method, headers = {}, body = {}) => {
        try {
            // Construct the URL with the specific journal ID
            const url = BASE_URL + journalId + '/entries' + endpoint;

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

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return await response.json();

        } catch (error) {
            throw new Error(error);
        }
    }

    return response;
}
