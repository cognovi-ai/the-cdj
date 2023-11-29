import { Grid, TextField, Typography } from '@mui/material';

const profileFields = [
    { key: 'fname', label: 'First name', autoComplete: 'first-name', gridSm: 6 },
    { key: 'lname', label: 'Last name', autoComplete: 'last-name', gridSm: 6 },
    { key: 'email', label: 'Email', autoComplete: 'email', gridSm: 12 },
];

export default function Profile({ profile, setProfile }) {
    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value,
        }));
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
                            value={profile[key]}
                            variant="standard"
                        />
                    </Grid>
                ))}
            </Grid>
        </>
    );
}
