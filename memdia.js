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
 * @param {string} input_id element with source code
 * @param {string} image_id element to add the image
 * @param {string} output_id where to display output
 */
function draw_diagram(input_id, image_id, output_id) {
    input = document.getElementById(input_id);
    image = document.getElementById(image_id);
    output = document.getElementById(output_id);

    dia = new Diagram(input.textContent);
    dia.render(image);
}
