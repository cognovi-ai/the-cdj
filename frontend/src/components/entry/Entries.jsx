import { styled } from '@mui/material/styles';
import { Paper, Grid } from '@mui/material';

import { useState, useEffect } from "react";

import Thoughts from './thought/Thoughts';
import Analysis from './thought/Analysis';
import Entry from './thought/Entry';

const testJournal = "6555c8b561fb25d5edb15ea7";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#282828' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    color: theme.palette.text.primary,
    boxShadow: 'none',
}));

export default function Entries() {
    const [entries, setEntries] = useState([]);
    const [journalId, setJournalId] = useState('');
    const [focusing, setFocusing] = useState(false);
    const [focusedEntryId, setFocusedEntryId] = useState('');

    useEffect(() => {
        const makeRequest = async () => {
            try {
                // Construct the URL with the specific journal ID
                setJournalId(testJournal);
                const url = `http://192.168.50.157:3000/journals/${ testJournal }/entries`;

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                setEntries([...data.entries]);
            } catch (error) {
                console.error("Error:", error);
            }
        };

        makeRequest();
    }, []);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Item>
                    <h1>Ryan&apos;s Thought Journal</h1>
                </Item>
            </Grid>
            <Grid item xs={12} md={6}>
                <Item>
                    <Entry
                        testJournal={testJournal}
                        setEntries={setEntries}
                        setFocusing={setFocusing}
                    />
                </Item>
            </Grid>
            <Grid item xs={12} md={6}>
                <Item>
                    {focusing ? (
                        <Analysis
                            journalId={journalId}
                            focusedEntryId={focusedEntryId}
                            setFocusing={setFocusing}
                        />
                    ) : (
                        <Thoughts
                            journalId={journalId}
                            entries={entries}
                            setEntries={setEntries}
                            setFocusing={setFocusing}
                            setFocusedEntryId={setFocusedEntryId}
                        />
                    )}

                </Item>
            </Grid>
        </Grid>
    );
}
