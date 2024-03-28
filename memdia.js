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

        // NOTE THERE IS PROBABLY AN EASIER WAY TO DO THIS IN LESS LOOPS??

        // variable name
        for (let i = 0; i < this.nodes.length; i++) {
        let text = document.createElementNS(NS, "text");
        text.setAttribute("x", "30");
        text.setAttribute("y", "60");
        text.textContent = this.nodes[i].name;
        svg.appendChild(text);
        }

        // variable type
        for (let i = 0; i < this.nodes.length; i++) {
            let text = document.createElementNS(NS, "text");
            text.setAttribute("x", "80");
            text.setAttribute("y", "30");
            text.textContent = this.nodes[i].type;
            svg.appendChild(text);
        }

        // variable value
        for (let i = 0; i < this.nodes.length; i++) {
            let text = document.createElementNS(NS, "text");
            text.setAttribute("x", "85");
            text.setAttribute("y", "60");
            text.textContent = this.nodes[i].value;
            svg.appendChild(text);
        }
            
        // replace previous contents
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        div.appendChild(svg);
        div

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

        this.type = self.type;
        this.name = self.name;
        this.value = self.value;
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
    // add the name before the box here
    dia.render(image);
}

document.addEventListener("DOMContentLoaded", function () {
    let divs = document.getElementsByClassName("memdia"); // get all divs 
    for (let i = 0; i < divs.length; i++) {
        draw_diagram(divs[i]); // draw each one
    }
});


/**
 * def draw_name(box):
    return f"""
svg.append("text")
  .attr("x", {box.x + box.name_width - TEXT_W})
  .attr("y", {box.y + box.height / 2 + box.type_height / 2 - box.index_height / 2})
  .attr("text-anchor", "end")
  .attr("alignment-baseline", "middle")
  .attr("fill", "{FG_COLOR}")
  .text("{box.name}");
""" if box.name_width else ""


def draw_type(box):
    return f"""
svg.append("text")
  .attr("x", {box.x + box.name_width})
  .attr("y", {box.y + TEXT_H / 3})
  .attr("alignment-baseline", "middle")
  .attr("fill", "{FG_COLOR}")
  .attr("font-style", "italic")
  .style("font-size", "0.8em")
  .text("{box.type}");
""" if box.type_height else ""


def draw_value(box):
    return f"""
svg.append("text")
  .attr("x", {box.x + box.width / 2 + box.name_width / 2})
  .attr("y", {box.y + box.height / 2 + box.type_height / 2 - box.index_height / 2})
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "middle")
  .attr("fill", "{FG_COLOR}")
  .text('{box.value}');
""" if not ARROWS or box.op != "->" else ""
 */