import { Grid, TextField, Typography } from '@mui/material';

import { useAccount } from '../../../../../context/useAccount';

const profileFields = [
    { key: 'fname', label: 'First name', autoComplete: 'first-name', gridSm: 6 },
    { key: 'lname', label: 'Last name', autoComplete: 'last-name', gridSm: 6 },
    { key: 'email', label: 'Email', autoComplete: 'email', gridSm: 12 },
];

export default function Profile({ savedProfile }) {
    const { profile, setProfile } = useAccount();

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value,
        }));
    };

    const getFieldValue = (key) => {
        // Use profile value if exists (including empty string), otherwise fallback to savedProfile
        return profile[key] !== undefined ? profile[key] : savedProfile[key] || '';
    };

    return (
        <>
            <Typography gutterBottom variant="h6">
                Profile
            </Typography>
            <Grid container spacing={3}>
                {profileFields.map(({ key, label, autoComplete, gridSm }) => (
                    <Grid item key={key} sm={gridSm} xs={12}>
                        <TextField
                            autoComplete={autoComplete}
                            fullWidth
                            id={key}
                            label={label}
                            name={key}
                            onChange={handleProfileChange}
                            required
                            value={getFieldValue(key)}
                            variant="standard"
                        />
                    </Grid>
                ))}
            </Grid>
        </>
    );
}
