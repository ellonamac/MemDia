# Notes

The original [memory.py](memory.py) was written as a hook (plugin) for [MkDocs](https://www.mkdocs.org/) that generated JavaScript code to draw an SVG image using [D3](https://d3js.org/).
In contrast, [memdia.js](../memdia.js) creates the SVG directly, without needing Python or MkDocs or D3.
Most of the Python code was organized into the three classes described below.

**References**

* [Memory Diagrams](https://w3.cs.jmu.edu/cs159/s24/docs/memory/)
* [Memory Diagrams (test)](https://w3.cs.jmu.edu/cs159/s24/docs/memtest/)
* [Mozilla Web Docs](https://developer.mozilla.org/en-US/docs/Web)


## Diagram class

Represents the entire memory diagram.

* Constructor takes the entire source code
* Left side: global variables, stack frames, static data
* Right side: objects, arrays, inline strings/arrays

Attribute    | Description
-------------|------------------------------
id           | Ex: "Diagram1"
code         | diagram's source code
width        | left_width + right_width
height       | max(left_y, right_y)
left_width   | width of the left side
right_width  | width of the right side
left_y       | current height of left side
right_y      | current height of left side
nodes        | LargeBox/SmallBox children


## LargeBox class

Represents a stack frame, heap object, or static data.

* Constructor takes one block of code
* Special case: Array object (type ends with "[]")
* Child nodes are SmallBox

Attribute    | Description
-------------|------------------------------
id           | Ex: "LargeBox1"
code (lines) | block's source code
x            | x of top-left corner
y            | y of top-left corner
width        | total width of LargeBox
height       | total height of LargeBox
margin       | padding around child nodes
name         | block's name (left of colon)
type         | block's type (right of colon)
name_width   | width of the block's name
type_height  | height of the block's type
index_height | height of the block's indexes
nodes        | SmallBox children
refs         | number of arrows to this box


## SmallBox class

Usually represents a variable (or array element).

* Constructor takes one line of code
* Special case: String literal
* Special case: Array literal
* Special case: Array element ("__" in name)

Attribute    | Description
-------------|------------------------------
id           | Ex: "SmallBox1"
code (line)  | var's source code
x            | x of top-left corner
y            | y of top-left corner
width        | total width of SmallBox
height       | total height of SmallBox
name         | the variable's name
type         | the variable's type
op           | operator (`=` or `->`)
value        | the variable's value
name_width   | width of the var's name
type_height  | height of the var's type
index_height | height of the var's index
