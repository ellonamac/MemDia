const NS = "http://www.w3.org/2000/svg";

function draw_rect(svg, obj) {
    let rect = document.createElementNS(NS, "rect");
    svg.appendChild(rect);

    rect.setAttribute("x", obj.x);
    rect.setAttribute("y", obj.y);
    rect.setAttribute("width", obj.width);
    rect.setAttribute("height", obj.height);
    rect.setAttribute("stroke", "black");
    rect.setAttribute("fill", "none");
}

class Diagram {
    constructor(code) {
        this.nodes = [];
        this.nodes.push(new Variable(code));
    }
    render(div) {
        let svg = document.createElementNS(NS, "svg");
        svg.setAttribute("width", "220");
        svg.setAttribute("height", "95");

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

        this.x = 80;
        this.y = 35;
        this.width = 40;
        this.height = 40;
        this.name_width = 0;
        this.type_height = 0;
    }
    render(svg) {
        draw_rect(svg, this);
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
    dia.render(image);
}

document.addEventListener("DOMContentLoaded", function () {
    let divs = document.getElementsByClassName("memdia");
    for (let i = 0; i < divs.length; i++) {
        draw_diagram(divs[i]);
    }
});
