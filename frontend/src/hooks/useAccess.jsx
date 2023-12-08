import { useFlash } from '../context/useFlash';

const BASE_URL = 'http://192.168.50.157:3000/access';

export function useAccess() {
    const { setFlash } = useFlash();

    const response = async (endpoint, method, headers = {}, body = {}) => {
        try {
            // Construct the URL with the specific journal ID
            const url = BASE_URL + endpoint;

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
                // Append new flash messages
                setFlash(prevFlash => {
                    const newFlash = { ...prevFlash };
                    Object.keys(data.flash).forEach(key => {
                        newFlash[key] = newFlash[key] ? [...newFlash[key], ...data.flash[key]] : [...data.flash[key]];
                    });
                    return newFlash;
                });
            }

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return data;

        } catch (error) {
            throw new Error(error);
        }
    }

    return response;
}
