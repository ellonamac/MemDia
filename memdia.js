const NS = "http://www.w3.org/2000/svg";

const TEXT_W = 10  // average width of a letter
const TEXT_H = 15  // average height of a letter

function draw_rect(svg, obj) {
    let rect = document.createElementNS(NS, "rect");
    svg.appendChild(rect);

    rect.setAttribute("x", obj.x + obj.name_width);
    rect.setAttribute("y", obj.y + obj.type_height);
    rect.setAttribute("width", obj.width - obj.name_width);
    rect.setAttribute("height", obj.height - obj.type_height - obj.index_height);
    rect.setAttribute("stroke", "black");
    rect.setAttribute("fill", "none");
}

function draw_name(svg, obj) {
    let text = document.createElementNS(NS, "text");
    svg.appendChild(text);
    text.textContent = obj.name;

    text.setAttribute("x", obj.x + obj.name_width - TEXT_W);
    text.setAttribute("y", obj.y + obj.height / 2 + obj.type_height / 2 - obj.index_height / 2);
    text.setAttribute("text-anchor", "end");
    text.setAttribute("alignment-baseline", "middle");
}

function draw_type(svg, obj) {
    let text = document.createElementNS(NS, "text");
    svg.appendChild(text);
    text.textContent = obj.type;

    text.setAttribute("x", obj.x + obj.name_width);
    text.setAttribute("y", obj.y + TEXT_H / 3);
    text.setAttribute("alignment-baseline", "middle");
    text.setAttribute("font-style", "italic");
    text.setAttribute("font-size", "0.8em");
}

function draw_value(svg, obj) {
    let text = document.createElementNS(NS, "text");
    svg.appendChild(text);
    text.textContent = obj.value;

    text.setAttribute("x", obj.x + obj.width / 2 + obj.name_width / 2);
    text.setAttribute("y", obj.y + obj.height / 2 + obj.type_height / 2 - obj.index_height / 2);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("alignment-baseline", "middle");
}

class Diagram {
    constructor(code) {
        this.nodes = [];
        this.nodes.push(new Variable(code));
    }
    render(div) {
        let svg = document.createElementNS(NS, "svg");
        svg.setAttribute("width", "160");
        svg.setAttribute("height", "80");

        // replace previous contents
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        div.appendChild(svg);

        // append the child elements
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].render(svg);
        }
    }
}

class Variable {
    constructor(line) {
        [self.type, self.name, self.op, ...self.value] = line.split(" ");
        self.value = self.value.join(" ");

        this.x = 60;
        this.y = 0;
        this.width = 60;
        this.height = 60;

        this.name_width = 15;       // TODO name_text.getBBox().width;
        this.type_height = TEXT_H;  // TODO type_text.getBBox().height;
        this.index_height = 0;      // TODO index_text.getBBox().height;

        this.type = self.type;
        this.name = self.name;
        this.value = self.value;
    }
    render(svg) {
        draw_rect(svg, this);
        draw_name(svg, this);
        draw_type(svg, this);
        draw_value(svg, this);
    }

}

/**
 * Draw a memory diagram.
 *
 * @param {string} input element with source code
 * @param {string} image element to add the image
 * @param {string} output where to display output
 */
function draw_diagram(input, image, output) {
    if (typeof input === 'string') {
        input = document.getElementById(input);
    }
    if (typeof image === 'string') {
        image = document.getElementById(image);
    }
    if (typeof output === 'string') {
        output = document.getElementById(output);
    }
    // 2nd parameter is optional
    if (!image) {
        image = input;
    }

    dia = new Diagram(input.textContent);
    // add the name before the box here
    dia.render(image);
}

document.addEventListener("DOMContentLoaded", function () {
    let divs = document.getElementsByClassName("memdia");  // get all divs
    for (let i = 0; i < divs.length; i++) {
        draw_diagram(divs[i]);  // draw each one
    }
});
