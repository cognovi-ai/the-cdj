import './MenuLink.css'

import { Link } from 'react-router-dom';

export default function MenuLink({ page, label }) {
    const directTo = (page) => {
        return page === 'Home' ? '/' : `/${ page.toLowerCase() }`
    }

    return (
        <>
            <Link className="MenuLink" to={directTo(page)}>{label ? label : page}</Link>
        </>
    )
}