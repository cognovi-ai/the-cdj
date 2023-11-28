import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

const updated = [
    { name: 'Model', desc: 'gpt-3.5-turbo' },
    { name: 'API Key', desc: 'sk-FAKE1wFTtnCV3OKrpHY0T3BlbkFJx3yD1kGvBJUFgkkRzzuR' },
];

export default function Review() {
    return (
        <React.Fragment>
            <Typography gutterBottom variant="h6">
                Update summary
            </Typography>
            <List disablePadding>
                {updated.map((product) => (
                    <ListItem key={product.name} sx={{ py: 1, px: 0 }}>
                        <ListItemText primary={product.name} secondary={product.desc} />
                    </ListItem>
                ))}
            </List>
        </React.Fragment>
    );
}