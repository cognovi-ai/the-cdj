import './MenuLink.css';

import { Link } from 'react-router-dom';

export default function MenuLink({ page }) {
    const directTo = (page) => {
        return page.name === 'Home' ? '/' : `/${ page.name.toLowerCase() }`
    }

    return (
        <Link className="MenuLink" to={directTo(page)}>
            {page.label || page.name}
        </Link>
    );
}