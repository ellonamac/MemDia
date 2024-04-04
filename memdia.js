const NS = "http://www.w3.org/2000/svg";

const MARGIN = 20;  // spacing between each box
const TEXT_W = 10;  // average width of a letter
const TEXT_H = 15;  // average height of a letter
const BOX_WH = 40;  // min width/height of var box

const BG_COLOR = "#fafafa";  // TODO use CSS instead
const FG_COLOR = "#000000";  // TODO use CSS instead


//  QUESTIONNS : left_y, and line 112

function draw_rect(svg, box) {
    let rect = document.createElementNS(NS, "rect");
    svg.appendChild(rect);

    rect.setAttribute("x", box.x + box.name_width);
    rect.setAttribute("y", box.y + box.type_height);
    rect.setAttribute("width", box.width - box.name_width);
    rect.setAttribute("height", box.height - box.type_height - box.index_height);
    rect.setAttribute("stroke", FG_COLOR);
    rect.setAttribute("fill", "none");
}

function draw_name(svg, box) {
    let text = document.createElementNS(NS, "text");
    svg.appendChild(text);
    text.textContent = box.name;

    text.setAttribute("x", box.x + box.name_width - TEXT_W);
    text.setAttribute("y", box.y + box.height / 2 + box.type_height / 2 - box.index_height / 2);
    text.setAttribute("text-anchor", "end");
    text.setAttribute("alignment-baseline", "middle");
}

function draw_type(svg, box) {
    let text = document.createElementNS(NS, "text");
    svg.appendChild(text);
    text.textContent = box.type;

    text.setAttribute("x", box.x + box.name_width);
    text.setAttribute("y", box.y + TEXT_H / 3);
    text.setAttribute("alignment-baseline", "middle");
    text.setAttribute("font-style", "italic");
    text.setAttribute("font-size", "0.8em");
}

function draw_value(svg, box) {
    let text = document.createElementNS(NS, "text");
    svg.appendChild(text);
    text.textContent = box.value;

    text.setAttribute("x", box.x + box.width / 2 + box.name_width / 2);
    text.setAttribute("y", box.y + box.height / 2 + box.type_height / 2 - box.index_height / 2);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("alignment-baseline", "middle");
}

class Diagram {
    constructor(code) {
        this.left_y = MARGIN; // was just let
        this.left_width = 3 * MARGIN; 
        this.right_y = this.left_y; // was just let
        this.right_width = this.left_width;

        this.nodes = [];

        let blocks = code.trim().split("\n\n");


        for (let i = 0; i < blocks.length; i++) {
            let node = new LargeBox(blocks[i], MARGIN, this.left_y);
            this.nodes.push(node);
            this.left_y += node.height + MARGIN;
            this.left_width = Math.max(this.left_width, 3 * MARGIN + node.width);
        }

        // diagram size
        this.width = this.left_width + this.right_width;
        this.height = Math.max(this.left_y, this.right_y); // NAN

    }
    render(div) {
        let svg = document.createElementNS(NS, "svg");
        svg.setAttribute("width", this.left_width + this.right_width);  // TODO left_width + right_width ("width", "160")
        svg.setAttribute("height", Math.max(this.left_y, this.right_y));  // TODO max(left_y, right_y) ("height", "80")
        svg.style.backgroundColor = BG_COLOR;
        svg.setAttribute("width", this.width); // 220 think deals with diagram not svg
        svg.setAttribute("height", this.height); // 95


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

class LargeBox {
    constructor(code, x, y) {
        this.nodes = [];
        this.x = x;
        this.y = y;

        let lines = code.split("\n");
        if (lines[0].includes(":")) {
            // parse the block specifiation
            let parts = lines[0].split(":");
            this.name = parts[0].trim();
            this.type = parts[1].trim();

            this.margin = MARGIN;
            this.width = 2 * MARGIN;
            this.height = MARGIN;
        } else {
            // noname block (global variables)
            this.name = "";
            this.type = ""; // no type = function

            this.margin = 0;
            this.width = 0;
            this.height = -MARGIN;
        }

        if (this.name && this.height > 0) {
            this.name_width = (this.name.length + 1) * TEXT_W;
            this.width += this.name_width;
        } else {
            this.name_width = 0;
        }
        // deal with adding type in the future
        this.type_height = 0;
        this.index_height = 0;

        // parse the remaining lines
        let i = 0;
        if (lines[0].includes(":")) {
            i = 1;
        }
        for (; i < lines.length; i++) {
            let node = new SmallBox(lines[i], x + this.name_width + this.margin, y + this.margin);
            this.nodes.push(node);
            this.width = Math.max(this.width, 2 * this.margin + this.name_width + node.width); // BECOMING NAN HERE
            this.height += node.height + MARGIN; // AND HERE
            y += node.height + MARGIN; // check on this (should it just be y or this.y)
        }
    }
    render(svg) {
        if (!this.name == ""){
            draw_rect(svg, this);
        }
        draw_name(svg, this);
        draw_type(svg, this);
        draw_value(svg, this);
        // should call small boxes render
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].render(svg);
        }
    }
}

class SmallBox {
    constructor(code, x, y) {
        let line = code.trim();
        [this.type, this.name, this.op, ...this.value] = line.split(" ");
        this.value = this.value.join(" ");

        this.x = x; // 60
        this.y = y; // 0
        this.width = BOX_WH; // BOX_WH
        this.height = BOX_WH; // BOX_WH


        this.name_width = (this.name.length + 1) * TEXT_W;
        this.type_height = TEXT_H;
        this.index_height = 0;

        this.width = this.name_width + Math.max(BOX_WH, (this.value.length + 1) * TEXT_W);
        this.height = this.type_height + BOX_WH + this.index_height;

        //this.name_width = 15;       // TODO name_text.getBBox().width
        //this.type_height = TEXT_H;  // TODO type_text.getBBox().height
        //this.index_height = 0;      // TODO index_text.getBBox().height

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
