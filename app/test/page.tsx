import { generateGeminiResponse } from '@/utils/generateGeminiResponse'
import React from 'react'
import Markdown from 'react-markdown';

const page = async () => {
    let response = "Loading..."
    // response = await generateGeminiResponse("Explain the theory of relativity in simple terms.")
    response = "Einstein's theory of relativity is actually two theories: special relativity and general relativity. Here's a simplified explanation of each: **Special Relativity (deals with objects moving at constant speeds):** Imagine you're on a train throwing a ball. To you, the ball seems to move at a certain speed. But to someone standing still outside the train, the ball's speed is the speed you threw it *plus* the speed of the train. That's pretty straightforward. Special relativity adds a twist: **the speed of light is constant for everyone, no matter how fast they're moving.** This seems impossible, but it's true. To make this work, space and time become intertwined and relative (hence the name). This leads to some strange consequences: * **Time dilation:** Time slows down for objects moving very fast relative to a stationary observer. The faster you go, the slower time passes for you compared to someone who's still. * **Length contraction:** Objects moving very fast appear shorter in the direction of motion to a stationary observer. * **Mass-energy equivalence (E=mc²):** Energy and mass are equivalent and interchangeable. A small amount of mass can be converted into a huge amount of energy (like in nuclear reactions). **General Relativity (deals with gravity):** Instead of thinking of gravity as a force, general relativity describes it as a **curvature of spacetime**. Imagine spacetime as a trampoline. If you place a bowling ball in the center, it creates a dip. If you roll a marble nearby, it will curve towards the bowling ball, not because the bowling ball is pulling it, but because the marble is following the curve of the trampoline. Similarly, massive objects like planets and stars warp spacetime around them. This warping is what we experience as gravity. Objects move along the curves created by these massive objects. **In short:** * **Special relativity:** The speed of light is constant, leading to time dilation, length contraction, and E=mc². * **General relativity:** Gravity is the curvature of spacetime caused by massive objects. It's important to note that these effects are only noticeable at very high speeds (close to the speed of light) or with extremely strong gravitational fields. In everyday life, the effects of relativity are so small that we don't notice them.";
    let question = "Explain the theory of relativity in simple terms."
    return (
        <div>
            <h1>Gemini Response</h1>
            <h2>Question: {question}</h2>
            <h3>Answer:</h3>
            <Markdown>{response}</Markdown>
        </div>
    )
}

export default page
