const NS = "http://www.w3.org/2000/svg";

const MARGIN = 20;  // spacing between each box
const TEXT_W = 10;  // average width of a letter
const TEXT_H = 15;  // average height of a letter
const BOX_WH = 40;  // min width/height of var box

const BG_COLOR = "#fafafa";  // TODO use CSS instead
const FG_COLOR = "#000000";  // TODO use CSS instead

// Buffer for creating strings and arrays
const INLINE = [];


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
    if (box.name_width) {
        let text = document.createElementNS(NS, "text");
        svg.appendChild(text);
        text.textContent = box.name;

        text.setAttribute("x", box.x + box.name_width - TEXT_W);
        text.setAttribute("y", box.y + box.height / 2 + box.type_height / 2 - box.index_height / 2);
        text.setAttribute("text-anchor", "end");
        text.setAttribute("alignment-baseline", "middle");
    }
}

function draw_type(svg, box) {
    if (box.type_height) {
        let text = document.createElementNS(NS, "text");
        svg.appendChild(text);
        text.textContent = box.type;

        text.setAttribute("x", box.x + box.name_width);
        text.setAttribute("y", box.y + TEXT_H / 3);
        text.setAttribute("alignment-baseline", "middle");
        text.setAttribute("font-style", "italic");
        text.setAttribute("font-size", "0.8em");
    }
}

function draw_value(svg, box) {
    // TODO if not ARROWS or box.op != "@"
    if (box.value) {
        let text = document.createElementNS(NS, "text");
        svg.appendChild(text);
        text.textContent = box.value;

        text.setAttribute("x", box.x + box.width / 2 + box.name_width / 2);
        text.setAttribute("y", box.y + box.height / 2 + box.type_height / 2 - box.index_height / 2);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("alignment-baseline", "middle");
    }
}

function draw_index(svg, box) {
    if (box.name.includes("__")) {
        let text = document.createElementNS(NS, "text");
        svg.appendChild(text);
        let items = box.name.split("__");
        text.textContent = items[1];

        text.setAttribute("x", box.x + box.width / 2 + box.name_width / 2);
        text.setAttribute("y", box.y + box.height - TEXT_H / 3);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("alignment-baseline", "middle");
        text.setAttribute("font-style", "italic");
        text.setAttribute("font-size", "0.8em");
    }
}

function draw_vline(svg, box, x) {
    let line = document.createElementNS(NS, "line");
    svg.appendChild(line);

    line.setAttribute("x1", x);
    line.setAttribute("y1", box.y);
    line.setAttribute("x2", x);
    line.setAttribute("y2", box.y + BOX_WH);
    line.setAttribute("stroke", FG_COLOR);
}

function draw_string(svg, box) {
    let text = document.createElementNS(NS, "text");
    svg.appendChild(text);
    text.textContent = box.value;

    text.setAttribute("x", box.x + box.width / 2);
    text.setAttribute("y", box.y + box.height / 2);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("alignment-baseline", "middle");
}

function draw_defs(svg) {

}

function draw_arrow(svg, src, dst) {

}

function draw_arrows(svg, dia) {
    // gather all variables including array elements
    let vars = [];
    for (let large of dia.nodes) {
        for (let small in large.nodes) {
            if (Array.isArray(small.value)) {
                for (let box in small.value) {
                    vars.push(box);
                }
            } else {
                vars.push(small);
            }
        }
    }
    // add arrow for each variable that references
    let first = true;
    for (let src of vars) {
        if (src.op == '@') {
            // search for the corresponding object
            for (let dst of dia.nodes) {
                if (dst.name == src.value) {
                    if (first) {
                        draw_defs(svg);
                        first = false;
                    }
                    draw_arrow(svg, src, dst);
                }
            }
        }
    }
}


class Diagram {
    constructor(code) {

        // coordinates and dimensions
        this.left_y = MARGIN;
        this.left_width = 3 * MARGIN;
        this.right_y = this.left_y;
        this.right_width = this.left_width;

        // parse functions and objects
        this.nodes = [];
        let blocks = code.trim().split("\n\n");
        for (const block of blocks) {
            let lines = block.split("\n");
            if (lines[0].startsWith(":") || lines[0].endsWith(":") || !lines[0].includes(":")) {
                // Stack (Frames)
                let node = new LargeBox(lines, MARGIN, this.left_y);
                this.nodes.push(node);
                this.left_y += node.height + MARGIN;
                this.left_width = Math.max(this.left_width, 3 * MARGIN + node.width);
            } else {
                // Heap (Objects)
                let node = new LargeBox(lines, this.left_width + 2 * MARGIN, this.right_y);
                this.nodes.push(node);
                this.right_y += node.height + MARGIN;
                this.right_width = Math.max(this.right_width, 3 * MARGIN + node.width);
            }

            while (INLINE.length > 0) {
                // string or array (keep code in sync with else block)
                lines = INLINE.shift().split();
                let node = new LargeBox(lines, this.left_width + 2 * MARGIN, this.right_y);
                this.nodes.push(node);
                this.right_y += node.height + MARGIN;
                this.right_width = Math.max(this.right_width, 3 * MARGIN + node.width);
            }
        }

        // diagram size
        this.width = this.left_width + this.right_width;
        this.height = Math.max(this.left_y, this.right_y);
    }
    render(div) {
        let svg = document.createElementNS(NS, "svg");
        svg.setAttribute("width", this.width);
        svg.setAttribute("height", this.height);
        svg.style.backgroundColor = BG_COLOR;

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
    constructor(lines, x, y) {
        this.x = x;
        this.y = y;

        if (lines[0].includes(":")) {
            // parse the block specification
            let parts = lines[0].split(":");
            this.name = parts[0].trim();
            this.type = parts[1].trim();

            this.margin = MARGIN;
            this.width = 2 * MARGIN;
            this.height = MARGIN;
        } else {
            // noname block (global variables)
            this.name = "";
            this.type = "";  // no type = function

            this.margin = 0;
            this.width = 0;
            this.height = -MARGIN;
        }

        if (this.type.endsWith("[]")) {
            this.margin = 0;
            this.width = 0;
            this.height = MARGIN;
        }

        // estimate width and height
        if (this.name && this.height > 0) {
            this.name_width = (this.name.length + 1) * TEXT_W;
            this.width += this.name_width;
            x += this.name_width;
        } else {
            this.name_width = 0;
        }

        if (this.type) {
            this.type_height = TEXT_H;
            this.height += this.type_height
            y += this.type_height;
        }
        else {
            this.type_height = 0;
        }

        if (this.type.endsWith("[]")) {
            this.index_height = TEXT_H;
            this.height += this.index_height;
        } else {
            this.index_height = 0;
        }

        // parse the remaining lines
        this.nodes = [];
        let i = 0;
        if (lines[0].includes(":")) {
            i = 1;
        }

        // parse the variables
        for (; i < lines.length; i++) {
            let node = new SmallBox(lines[i], x + this.margin, y + this.margin);
            this.nodes.push(node);
            this.width = Math.max(this.width, 2 * this.margin + this.name_width + node.width);
            this.height += node.height + MARGIN;
            y += node.height + MARGIN;
        }
    }
    render(svg) {
        if (this.name != "") {
            draw_rect(svg, this);
        }
        draw_name(svg, this);
        draw_type(svg, this);
        draw_value(svg, this);
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].render(svg);
        }
    }
}

class SmallBox {
    constructor(code, x, y) {
        this.x = x;
        this.y = y;

        let line = code.trim();
        if (line.startsWith('"') && line.endsWith('"')) {
            // String literal
            this.name = "";
            this.op = "";
            this.value = line;
            this.width = (this.value.length - 2) * TEXT_W;
            this.height = 0;

            this.name_width = 0;
            this.type_height = 0;
            this.index_height = 0;
        } else if (line.startsWith('{') && line.endsWith('}')) {
            // Array literal
            this.op = '@';
            this.value = [];
            this.width = 0;
            this.height = 0;

            let values = line.slice(1, -1).split(",");
            let op = " = "; // TODO type inference
            for (let i = 0; i < values.length; i++) {
                // TODO in the future, get the type from LargeBox
                let cell = "TODO ix__" + i + op + values[i];
                let box = new SmallBox(cell, x, y);
                x += box.width;
                this.width += box.width;
                this.value.push(box);
            }
        } else {
            // Variable box
            [this.type, this.name, this.op, ...this.value] = line.split(" ");
            this.value = this.value.join(" ");  // TODO add trim here?

            if (code.includes("__")) {
                this.name_width = 0;
                this.type_height = 0;
                this.index_height = TEXT_H;
            } else {
                this.name_width = (this.name.length + 1) * TEXT_W;
                this.type_height = TEXT_H;
                this.index_height = 0;
            }

            // width depends on whether we are drawing an arrow
            if (this.op != "@") {
                this.width = this.name_width + Math.max(BOX_WH, (this.value.length + 1) * TEXT_W);
            } else {
                this.width = this.name_width + BOX_WH;
            }
            this.height = this.type_height + BOX_WH + this.index_height;
        }
    }
    render(svg) {
        if (!this.op) {
            // Draw string literal text
            draw_string(svg, this);

        } else if (this.value instanceof Array) {
            // Draw array vertical lines
            let x = this.x;
            for (let i = 1; i < this.value.length; i++) {
                x += this.value[i - 1].width;
                draw_vline(svg, this, x);
            }
            // Draw array elements (variables)
            for (let i = 0; i < this.value.length; i++) {
                this.value[i].render(svg);
            }

        } else {
            // Draw variable box
            if (!this.name.includes("__")) {
                draw_rect(svg, this);
                draw_name(svg, this);
                draw_type(svg, this);
            }
            draw_value(svg, this);
            draw_index(svg, this);
        }
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
    if (!output) {
        output = input;
    }

    // construct and render the diagram
    let code = input.value ? input.value : input.textContent;
    dia = new Diagram(code);
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
