import MenuLink from '../nav/menus/MenuLink';
import { Typography } from '@mui/material';

export default function Copyright(props) {
    return (
        <Typography align="center" color="text.secondary" variant="body2" {...props}>
            {`© ${ new Date().getFullYear() } `}
            <MenuLink
                page={{
                    label: 'The Cognitive Distortion Journal',
                    name: '',
                    visibility: ''
                }} />
        </Typography>
    );
}