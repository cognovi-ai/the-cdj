import { styled } from '@mui/material/styles';
import { Paper, Grid } from '@mui/material';
import { useState, useEffect } from "react";
import Thoughts from './thought/Thoughts';
import Analysis from './thought/Analysis';
import Entry from './thought/Entry';

const testJournal = "6552c74152807822e7df31a1";

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
    const [focusedData, setFocusedData] = useState({
        title: '',
        content: '',
        mood: '',
        tags: [],
        privacy_settings: {},
    });
    const [focusedEntryId, setFocusedEntryId] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatData, setChatData] = useState({
        content: '',
        createdAt: Date(),
    });

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
    }, [entries]);

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
                        testJournal={testJournal} />
                </Item>
            </Grid>
            <Grid item xs={12} md={6}>
                <Item>
                    {focusing ? (
                        <Analysis
                            focusedData={focusedData}
                            setFocusing={setFocusing}
                            messages={messages}
                            setMessages={setMessages}
                            chatData={chatData}
                            setChatData={setChatData}
                        />
                    ) : (
                        <Thoughts
                            journalId={journalId}
                            entries={entries}
                            setEntries={setEntries}
                            setFocusing={setFocusing}
                            setFocusedData={setFocusedData}
                            setFocusedEntryId={setFocusedEntryId}
                        />
                    )}

                </Item>
            </Grid>
        </Grid>
    );
}
