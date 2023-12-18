import { Button, Grid, TextField, Typography } from '@mui/material';

import PopupDialog from '../../../../utils/PopupDialog';

import { useAccess } from '../../../../../hooks/useAccess';

import { useAccount } from '../../../../../contexts/useAccount';
import { useJournal } from '../../../../../contexts/useJournal';

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const profileFields = [
    { key: 'fname', label: 'First name', autoComplete: 'first-name', gridSm: 6 },
    { key: 'lname', label: 'Last name', autoComplete: 'last-name', gridSm: 6 },
    { key: 'email', label: 'Email', autoComplete: 'email', gridSm: 12 },
];

export default function Profile({ savedProfile }) {
    const [deleting, setDeleting] = useState(false);

    const { profile, setProfile } = useAccount();
    const { journalId, setJournalId } = useJournal();

    const access = useAccess();
    const navigate = useNavigate();

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfile((prevProfile) => ({
            ...prevProfile,
            [name]: value,
        }));
    };

    const handleDeleting = async () => {
        setDeleting(true);
    }

    const deleteAccount = async () => {
        try {
            await access(
                `/${ journalId }/account?deletionItem=account`,
                'DELETE'
            );

            setJournalId('');
            navigate('/register', { replace: true });

        } catch (error) {
            console.error(error);
        }
    }

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
                <Grid item>
                    <Button
                        color="danger"
                        onClick={handleDeleting}
                        sx={{ mt: '10px' }}
                        variant="contained">Delete Account</Button>
                </Grid>
            </Grid>
            <PopupDialog
                action={deleteAccount}
                buttonAgree="Delete"
                buttonDeny="Cancel"
                description="Are you sure you want to delete your account? This action cannot be undone."
                open={deleting}
                setOpen={setDeleting}
                title="Delete Account"
            />
        </>
    );
}
