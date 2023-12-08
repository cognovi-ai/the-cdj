import FlashMessage from './FlashMessage';

export default function FlashMessages({ flash, setFlash }) {
    const handleClose = (severity, index, setFlash) => {
        setFlash(prevFlash => {
            const newMessages = [...prevFlash[severity]];
            newMessages.splice(index, 1);
            return { ...prevFlash, [severity]: newMessages };
        });
    }

    return (
        <>
            {Object.entries(flash).map(([severity, messages]) =>
                messages.map((message, index) => (
                    <FlashMessage
                        key={`${ severity }-${ index }`}
                        message={message}
                        onClose={() => handleClose(severity, index, setFlash)}
                        severity={severity}
                    />
                ))
            )}
        </>
    );
}