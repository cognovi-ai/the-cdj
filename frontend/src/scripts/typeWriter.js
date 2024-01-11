export default async function typeWriter(text, setter, duration) {
    for (let i = 0; i < text.length; i++) {
        await new Promise(resolve => setTimeout(resolve, duration));
        setter(prev => prev + text.charAt(i));
    }
}