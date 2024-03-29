"""Draw memory diagrams in Markdown using D3."""

import re

MARGIN = 20  # spacing between each box
TEXT_W = 10  # average width of a letter
TEXT_H = 15  # average height of a letter
BOX_WH = 40  # min width/height of var box

BG_COLOR = ""  # var(--md-code-bg-color)
FG_COLOR = "var(--md-code-fg-color)"

# Buffer for creating strings and arrays
INLINE = []


def draw_titles(dia):
    return f"""
svg.append("text")
  .attr("x", {dia.left_width / 2})
  .attr("y", {MARGIN + TEXT_H / 3})
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "middle")
  .attr("fill", "{FG_COLOR}")
  .attr("font-weight", "bold")
  .text("Stack (Frames)");

svg.append("text")
  .attr("x", {dia.left_width + dia.right_width / 2})
  .attr("y", {MARGIN + TEXT_H / 3})
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "middle")
  .attr("fill", "{FG_COLOR}")
  .attr("font-weight", "bold")
  .text("Heap (Objects)");

svg.append("line")
  .attr("x1", {dia.left_width})
  .attr("y1", 0)
  .attr("x2", {dia.left_width})
  .attr("y2", {dia.height})
  .attr("stroke", "{FG_COLOR}")
  .attr("stroke-dasharray", "10,10");
"""


def draw_rect(box):
    return f"""
{box.id} = svg.append("rect")
  .attr("x", {box.x + box.name_width})
  .attr("y", {box.y + box.type_height})
  .attr("width", {box.width - box.name_width})
  .attr("height", {box.height - box.type_height - box.index_height})
  .attr("stroke", "{FG_COLOR if "__" not in box.name else ""}")
  .attr("fill", "none");
"""


def draw_name(box):
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


def draw_index(box):
    return f"""
svg.append("text")
  .attr("x", {box.x + box.width / 2 + box.name_width / 2})
  .attr("y", {box.y + box.height - TEXT_H / 3})
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "middle")
  .attr("fill", "{FG_COLOR}")
  .attr("font-style", "italic")
  .style("font-size", "0.8em")
  .text("{box.name[box.name.rfind("_")+1:]}");
""" if INDEXES and "__" in box.name else ""


def draw_arrows(dia):
    # gather all variables including array elements
    vars = []
    for large in dia.nodes:
        for small in large.nodes:
            if type(small.value) is list:
                for box in small.value:
                    vars.append(box)
            else:
                vars.append(small)
    # build JavaScript string
    js = ""
    for src in vars:
        if src.op == "->":
            # search for corresponding object
            for dst in dia.nodes:
                if dst.name == src.value:
                    js += f"""
x1 = {src.id}.attr("x") / 1 + {src.id}.attr("width") / 2;
y1 = {src.id}.attr("y") / 1 + {src.id}.attr("height") / 2;
x2 = {dst.id}.attr("x") - 8;
y2 = {dst.id}.attr("y") / 1 + {dst.id}.attr("height") / 2 + {dst.add_ref() * 8 - 12};
x3 = {dia.left_width} + 8;
y3 = (y1 + y2) / 2;

svg.append("circle")
  .attr("cx", x1)
  .attr("cy", y1)
  .attr("r", 2)
  .attr("fill", "{FG_COLOR}");

if (x1 > x2) {{
  svg.append("line")
    .attr("x1", x1)
    .attr("y1", y1)
    .attr("x2", x3)
    .attr("y2", y3)
    .attr("stroke", "{FG_COLOR}");
}} else {{
  x3 = x1;
  y3 = y1;
}}

svg.append("line")
  .attr("x1", x3)
  .attr("y1", y3)
  .attr("x2", x2)
  .attr("y2", y2)
  .attr("stroke", "{FG_COLOR}")
  .attr("marker-end", "url(#arrow)");
"""
    # append marker only if arrows exist
    return f"""
svg.append("defs").append("marker")
  .attr("id", "arrow")
  .attr("markerWidth", 16)
  .attr("markerHeight", 16)
  .attr("viewBox", "0 0 12 12")
  .attr("refX", 6)
  .attr("refY", 6)
  .attr("orient", "auto")
  .append("path")
    .attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
    .attr("fill", "{FG_COLOR}");
""" + js if js else ""


class Diagram:
    count = 0

    def __init__(self, code):
        Diagram.count += 1
        self.id = "Diagram" + str(Diagram.count)

        # coordinates and dimensions
        if TITLES:
            left_y = MARGIN + TEXT_H + MARGIN
            self.left_width = MARGIN + 14*TEXT_W + 2*MARGIN
        else:
            left_y = MARGIN
            self.left_width = 3*MARGIN
        right_y = left_y
        self.right_width = self.left_width

        # parse the methods and objects
        self.nodes = []
        for block in code.split("\n\n"):
            lines = block.splitlines()
            if lines[0].startswith(":") or lines[0].endswith(":"):
                # Stack (Frames)
                node = LargeBox(lines, MARGIN, left_y)
                self.nodes.append(node)
                left_y += node.height + MARGIN
                self.left_width = max(self.left_width, 3*MARGIN + node.width)
            else:
                # Heap (Objects)
                node = LargeBox(lines, self.left_width + 2*MARGIN, right_y)
                self.nodes.append(node)
                right_y += node.height + MARGIN
                self.right_width = max(self.right_width, 3*MARGIN + node.width)

            while INLINE:
                # string or array (keep code in sync with else block)
                lines = INLINE.pop(0).splitlines()
                node = LargeBox(lines, self.left_width + 2*MARGIN, right_y)
                self.nodes.append(node)
                right_y += node.height + MARGIN
                self.right_width = max(self.right_width, 3*MARGIN + node.width)

        # determine the diagram size
        self.width = self.left_width + self.right_width
        self.height = max(left_y, right_y)

    def __str__(self):
        nodes = "".join([str(node) for node in self.nodes])
        return f"""
<div class="md-typeset__scrollwrap">
    <div id="{self.id}" class="md-typeset__table">
    </div>
</div>
<script>
document.addEventListener("DOMContentLoaded", function () {{

svg = d3.select("#{self.id}")
  .append("svg")
  .attr("width", {self.width})
  .attr("height", {self.height});

svg.style("background", "{BG_COLOR}");
svg.style("max-width", "unset");

{draw_titles(self) if TITLES else ""}
{nodes}
{draw_arrows(self) if ARROWS else ""}
}});
</script>
"""

# # TODO add "Copy to clipboard" button in upper right corner?
# <div><a style="cursor: pointer" onclick="download_{self.id}()">Download</a></div>

# function download_{self.id}() {{
#   const image = document.getElementById("{self.id}").innerHTML;
#   const xml = image.toString().replaceAll("{FG_COLOR}", "black");
#   const blob = new Blob([xml], {{type: "image/svg+xml"}});
#   const link = document.createElement("a");
#   link.download = "{self.id}.svg";
#   link.href = window.URL.createObjectURL(blob);
#   link.click();
#   link.remove();
# }}


class LargeBox:
    count = 0

    def __init__(self, lines, x, y):
        LargeBox.count += 1
        self.id = "LargeBox" + str(LargeBox.count)
        self.x = x
        self.y = y

        # parse name and type (before and after the colon)
        self.name, self.type = [s.strip() for s in lines[0].split(":")]
        if not SHOW_MAIN and self.name == "main":
            self.margin = 0
            self.width = 0
            self.height = -MARGIN
        elif self.type.endswith("[]"):
            self.margin = 0
            self.width = 0
            self.height = MARGIN
        else:
            self.margin = MARGIN
            self.width = 2*MARGIN
            self.height = MARGIN

        # estimate width and height
        if self.name and self.height > 0 and not (self.type and ARROWS):
            self.name_width = (len(self.name) + 1) * TEXT_W
            self.width += self.name_width
            x += self.name_width
        else:
            self.name_width = 0
        if self.type and OBJ_TYPES:
            self.type_height = TEXT_H
            self.height += self.type_height
            y += self.type_height
        else:
            self.type_height = 0
        if self.type.endswith("[]"):
            self.index_height = TEXT_H if INDEXES else 0
            self.height += self.index_height
        else:
            self.index_height = 0

        # parse the variables
        self.nodes = []
        for i in range(1, len(lines)):
            node = SmallBox(lines[i], x + self.margin, y + self.margin)
            self.nodes.append(node)
            self.width = max(self.width, 2 * self.margin + self.name_width + node.width)
            self.height += node.height + MARGIN
            y += node.height + MARGIN

    def add_ref(self):
        if not hasattr(self, "refs"):
            self.refs = 0
        self.refs += 1
        return self.refs

    def __str__(self):
        nodes = "".join([str(node) for node in self.nodes])

        return f"""
{draw_rect(self) if self.margin or self.type.endswith("[]") else ""}
{draw_name(self)}
{draw_type(self)}
{nodes}
"""


class SmallBox:
    count = 0

    def __init__(self, line, x, y):
        SmallBox.count += 1
        self.id = "SmallBox" + str(SmallBox.count)
        self.x = x
        self.y = y

        line = line.lstrip()
        if line.startswith('"') and line.endswith('"'):
            # String literal
            self.op = ""
            self.value = line
            self.width = (len(self.value) - 2) * TEXT_W
            self.height = 0
        elif line.startswith('{') and line.endswith('}'):
            # Array literal
            self.op = "->"
            self.value = []
            self.width = 0
            self.height = 0
            # Create array elements
            for i, val in enumerate(line[1:-1].split(",")):
                val = val.strip()
                # Type inference
                if val[0] == '"':
                    obj_id = "Obj" + str(SmallBox.count)
                    INLINE.append(f'{obj_id}: String\n{val}')
                    op = "->"
                    val = obj_id
                elif val[0].isupper():  # existing obj_id
                    op = "->"
                else:
                    op = "="
                line = f"[] {self.id}__{i} {op} {val}"
                box = SmallBox(line, x, y)
                x += box.width
                self.width += box.width
                self.value.append(box)
        else:
            # Variable box
            self.type, self.name, self.op, self.value = line.split(maxsplit=3)
            # Special case: inline string or array
            if self.value.startswith('"') and self.value.endswith('"') \
            or self.value.startswith('{') and self.value.endswith('}'):
                obj_id = "Obj" + str(SmallBox.count)
                INLINE.append(f'{obj_id}: {self.type}\n{self.value}')
                self.op = "->"
                self.value = obj_id
            # figure out the dimensions
            if "__" not in self.name:
                self.name_width = (len(self.name) + 1) * TEXT_W
                self.type_height = TEXT_H if VAR_TYPES else 0
                self.index_height = 0
            else:
                self.name_width = 0
                self.type_height = 0
                self.index_height = TEXT_H if INDEXES else 0
            if not ARROWS or self.op != "->":
                self.width = self.name_width + max(BOX_WH, (len(self.value) + 1) * TEXT_W)
            else:
                self.width = self.name_width + BOX_WH
            self.height = self.type_height + BOX_WH + self.index_height

    def __str__(self):
        if not self.op:
            # Draw string text
            return f"""
svg.append("text")
  .attr("x", {self.x + self.width / 2})
  .attr("y", {self.y + self.height / 2})
  .attr("text-anchor", "middle")
  .attr("alignment-baseline", "middle")
  .attr("fill", "{FG_COLOR}")
  .text('{self.value}');
"""

        elif type(self.value) is list:
            # Draw array vertical lines
            x = self.x
            lines = ""
            for i in range(1, len(self.value)):
                x += self.value[i-1].width
                lines += f"""
svg.append("line")
  .attr("x1", {x})
  .attr("y1", {self.y})
  .attr("x2", {x})
  .attr("y2", {self.y + BOX_WH})
  .attr("stroke", "{FG_COLOR}")
"""
            return lines + "".join([str(node) for node in self.value])

        else:
            # Draw variable box / array element
            return f"""
{draw_rect(self)}
{draw_name(self)}
{draw_type(self)}
{draw_value(self)}
{draw_index(self)}
"""


def init_globals(options):

    # Set to False to show object ids instead
    global ARROWS
    ARROWS = options.get("arrows", True)

    # Set to False to hide Stack/Heap titles
    global TITLES
    TITLES = options.get("titles", False)

    # Set to False to hide main method's box
    global SHOW_MAIN
    SHOW_MAIN = options.get("show_main", False)

    # Set to False to hide object data types
    global OBJ_TYPES
    OBJ_TYPES = options.get("obj_types", True)

    # Set to True to show variable data types
    global VAR_TYPES
    VAR_TYPES = options.get("var_types", False)

    # Set to True to show array element indexes
    global INDEXES
    INDEXES = options.get("indexes", False)


def on_page_markdown(markdown, page, config, files):
    """Called after the page's markdown is loaded from the source file."""

    # Reset diagram counters
    Diagram.count = 0
    LargeBox.count = 0
    SmallBox.count = 0

    # For each memory diagram
    offset = 0
    for m in re.finditer(r"``` *memory\b(.*?)\n(.*?)\n *```", markdown, re.DOTALL):

        # Parse the options
        options = {}
        for opt in m.group(1).split():
            key, val = opt.split("=")
            options[key] = (val == "1")
        init_globals(options)

        # Build the replacement
        code = m.group(2)
        dia = Diagram(code)
        repl = str(dia)

        # Alter the Markdown source
        beg = m.start() + offset
        end = m.end() + offset
        markdown = markdown[:beg] + repl + markdown[end:]

        # Update offset for next match
        offset += len(repl) - (end - beg)

    # Return new markdown if modified
    if offset > 0:
        return markdown
