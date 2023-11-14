export default function Messages({ messages }) {
    return (
        <div>
            <h2>Chat</h2>
            {messages.map((message, index) => (
                <div key={index}>
                    <p>TODO: Setup Chat.</p>
                    {/* FIXME: message.content does not work: Objects are not valid as a React Child */}
                    {/* <p>{message.content}</p> */}
                </div>
            ))}
        </div>
    )
}