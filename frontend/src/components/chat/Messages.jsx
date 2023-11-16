import { useState, useEffect } from "react";

export default function Messages({ journalId, messages, setMessages, focusedEntryId }) {
    useEffect(() => {
        const getMessages = async () => {
            try {
                // Construct the URL with the specific journal ID
                const chatEntryUrl = `http://192.168.50.157:3000/journals/${ journalId }/entries/${ focusedEntryId }/chat`;

                const response = await fetch(chatEntryUrl);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();

                data.messages ? setMessages([...data.messages]) : setMessages([]);
            } catch (error) {
                console.error("Error:", error);
            }
        };

        getMessages();
    }, []);

    return (
        <div>
            <h2>Chat</h2>
            {messages.map((message, index) => (
                <div key={index}>
                    <p>{message.message_content}</p>
                </div>
            ))}
        </div>
    )
}