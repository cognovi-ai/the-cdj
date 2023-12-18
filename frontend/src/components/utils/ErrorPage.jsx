import { Item } from '../../styles/components';
import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <Item id="error-page">
            <h1>Request Error</h1>
            <p>There was a problem processing your request.</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </Item>
    );
}