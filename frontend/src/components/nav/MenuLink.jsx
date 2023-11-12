import { Outlet, Link } from 'react-router-dom';

export default function MenuLink({ page }) {
    const directTo = (page) => {
        return page === "Home" ? "/" : `/${ page.toLowerCase() }`
    }

    return (
        <>
            <Link to={directTo(page)}>{page}</Link>
        </>
    )
}