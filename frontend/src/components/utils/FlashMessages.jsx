import FlashMessage from './FlashMessage';

import { Item } from '../../styles/components/Item.jsx';

import { useFlash } from '../../contexts/useFlash.jsx';

export default function FlashMessages() {
    const { flash, setFlash } = useFlash();

    const handleClose = (severity, messageId) => {
        setFlash(prevFlash => {
            const newMessages = prevFlash[severity].filter(message => message.id !== messageId);
            return { ...prevFlash, [severity]: newMessages };
        });
    };

    return (
        <Item>
            {Object.entries(flash).map(([severity, messages]) =>
                messages.map(message => (
                    <FlashMessage
                        key={message.id}
                        message={message.text}
                        onClose={() => handleClose(severity, message.id)}
                        severity={severity}
                    />
                ))
            )}
        </Item>
    );
}
