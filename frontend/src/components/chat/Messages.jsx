import { useState, useEffect } from "react";

export default function Messages({ chat }) {
    return (
        <div>
            <h2>Chat</h2>
            {chat.messages && chat.messages.map((message, index) => (
                <div key={index}>
                    <p>{message.message_content}</p>
                </div>
            ))}
        </div>
    )
}