import { Outlet, Link } from 'react-router-dom';
import "./MenuLink.css"

export default function MenuLink({ page }) {
    const directTo = (page) => {
        return page === "Home" ? "/" : `/${ page.toLowerCase() }`
    }

    return (
        <>
            <Link className='MenuLink' to={directTo(page)}>{page}</Link>
        </>
    )
}