const NS = "http://www.w3.org/2000/svg";

const MARGIN = 20;  // spacing between each box
const TEXT_W = 10;  // average width of a letter
const TEXT_H = 15;  // average height of a letter
const BOX_WH = 40;  // min width/height of var box

const BG_COLOR = "#fafafa";  // TODO use CSS instead
const FG_COLOR = "#000000";  // TODO use CSS instead


function draw_rect(svg, obj) {
    let rect = document.createElementNS(NS, "rect");
    svg.appendChild(rect);

    rect.setAttribute("x", obj.x + obj.name_width);
    rect.setAttribute("y", obj.y + obj.type_height);
    rect.setAttribute("width", obj.width - obj.name_width);
    rect.setAttribute("height", obj.height - obj.type_height - obj.index_height);
    rect.setAttribute("stroke", FG_COLOR);
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
        svg.setAttribute("width", "160");  // TODO left_width + right_width
        svg.setAttribute("height", "80");  // TODO max(left_y, right_y)
        svg.style.backgroundColor = BG_COLOR;
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

class Method{
    constructor(line){
        [this.name, ...this.var] = line.split("/n");
        let variables = [];

        // will need to add a check for whether it is a variable or something else
        for (let i = 0; i < this.var.length; i++){
            variables.push(new Variable(this.var[i]));
        }
        // one is split by new line, then it needs to be split again to pass in the syntax for variables
    }
    render(svg){
        draw_rect(svg, this);
        draw_name(svg, this);
        draw_type(svg, this);
        draw_value(svg, this);
        // should call variables render
        for (let i = 0; i < variables.length; i++){
            variables[i].render(svg);
        }
    }
}

class Variable {
    constructor(line) {
        [this.type, this.name, this.op, ...this.value] = line.split(" ");
        this.value = this.value.join(" ");

        this.x = 60;
        this.y = 0;
        this.width = 60;
        this.height = 60;

        this.name_width = 15;       // TODO name_text.getBBox().width
        this.type_height = TEXT_H;  // TODO type_text.getBBox().height
        this.index_height = 0;      // TODO index_text.getBBox().height
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
    // 3rd parameter is optional too
    if (!image) {
        output = input;
    }

    // construct and render the diagram
    dia = new Diagram(input.textContent);
    dia.render(image);
}

/**
 * Automatically call draw_diagram() on all memdia elements.
 */
document.addEventListener("DOMContentLoaded", function () {
    let divs = document.getElementsByClassName("memdia");
    for (let i = 0; i < divs.length; i++) {
        draw_diagram(divs[i]);
    }
});
