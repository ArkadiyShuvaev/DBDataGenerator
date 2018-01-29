import React from "react"
import {render} from "react-dom"

const App = () => {
    return (
        <div>
            <p>Hello world!</p>
        </div>
    );
}
const elementById = document.getElementById("app");
render(<App />, elementById);
