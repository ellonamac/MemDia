# MemDia
JavaScript library for drawing memory diagrams.


## Usage

Include `memdia.js` in the document `<head>`:

``` html
<script src="memdia.js"></script>
```

Write code in an element with class `memdia`:

``` html
<div class="memdia">
main:
    String hello -> "world"
</div>
```

The library replaces your code with an `<svg>` when `DOMContentLoaded`.


## Example Diagram

The following Java program defines a `Person` class and creates two `Person` objects:

``` java
public class Person {

    private static int count = 0;

    private String name;
    private int pin;

    public Person(String name, int pin) {
        count++;
        this.name = name;
        this.pin = pin;
    }

    public static void main(String[] args) {
        Person p1 = new Person("Taylor", 1989);
        Person p2 = new Person("Travis", 8713);
    }

}
```

A memory diagram has two sides: static data and stack frames are on the left, and heap objects are on the right.
At the end of `main()`, the memory diagram looks like this:

<svg width="410" height="520" style="background-color: white;">
    <rect x="20" y="35" width="140" height="80" stroke="black" fill="none"></rect>
    <text x="20" y="25" alignment-baseline="middle" fill="black" font-style="italic" style="font-size: 0.8em;">Person class</text>
    <rect x="100" y="55" width="40" height="40" stroke="black" fill="none"></rect>
    <text x="90" y="75" text-anchor="end" alignment-baseline="middle" fill="black">count</text>
    <text x="120" y="75" text-anchor="middle" alignment-baseline="middle" fill="black">2</text>
    <rect x="70" y="135" width="110" height="140" stroke="black" fill="none"></rect>
    <text x="60" y="205" text-anchor="end" alignment-baseline="middle" fill="black">main</text>
    <rect x="120" y="155" width="40" height="40" stroke="black" fill="none"></rect>
    <text x="110" y="175" text-anchor="end" alignment-baseline="middle" fill="black">p1</text>
    <rect x="120" y="215" width="40" height="40" stroke="black" fill="none"></rect>
    <text x="110" y="235" text-anchor="end" alignment-baseline="middle" fill="black">p2</text>
    <rect x="260" y="35" width="130" height="140" stroke="black" fill="none"></rect>
    <text x="260" y="25" alignment-baseline="middle" fill="black" font-style="italic" style="font-size: 0.8em;">Person</text>
    <rect x="330" y="55" width="40" height="40" stroke="black" fill="none"></rect>
    <text x="320" y="75" text-anchor="end" alignment-baseline="middle" fill="black">name</text>
    <rect x="320" y="115" width="50" height="40" stroke="black" fill="none"></rect>
    <text x="310" y="135" text-anchor="end" alignment-baseline="middle" fill="black">pin</text>
    <text x="345" y="135" text-anchor="middle" alignment-baseline="middle" fill="black">1989</text>
    <rect x="260" y="210" width="100" height="40" stroke="black" fill="none"></rect>
    <text x="260" y="200" alignment-baseline="middle" fill="black" font-style="italic" style="font-size: 0.8em;">String</text>
    <text x="310" y="230" text-anchor="middle" alignment-baseline="middle" fill="black">"Taylor"</text>
    <rect x="260" y="285" width="130" height="140" stroke="black" fill="none"></rect>
    <text x="260" y="275" alignment-baseline="middle" fill="black" font-style="italic" style="font-size: 0.8em;">Person</text>
    <rect x="330" y="305" width="40" height="40" stroke="black" fill="none"></rect>
    <text x="320" y="325" text-anchor="end" alignment-baseline="middle" fill="black">name</text>
    <rect x="320" y="365" width="50" height="40" stroke="black" fill="none"></rect>
    <text x="310" y="385" text-anchor="end" alignment-baseline="middle" fill="black">pin</text>
    <text x="345" y="385" text-anchor="middle" alignment-baseline="middle" fill="black">8713</text>
    <rect x="260" y="460" width="100" height="40" stroke="black" fill="none"></rect>
    <text x="260" y="450" alignment-baseline="middle" fill="black" font-style="italic" style="font-size: 0.8em;">String</text>
    <text x="310" y="480" text-anchor="middle" alignment-baseline="middle" fill="black">"Travis"</text>
    <defs>
        <marker id="arrow" markerWidth="16" markerHeight="16" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">
            <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="black"></path>
        </marker>
    </defs>
    <circle cx="140" cy="175" r="2" fill="black"></circle>
    <line x1="140" y1="175" x2="252" y2="101" stroke="black" marker-end="url(#arrow)"></line>
    <circle cx="140" cy="235" r="2" fill="black"></circle>
    <line x1="140" y1="235" x2="252" y2="351" stroke="black" marker-end="url(#arrow)"></line>
    <circle cx="350" cy="75" r="2" fill="black"></circle>
    <line x1="350" y1="75" x2="228" y2="150.5" stroke="black"></line>
    <line x1="228" y1="150.5" x2="252" y2="226" stroke="black" marker-end="url(#arrow)"></line>
    <circle cx="350" cy="325" r="2" fill="black"></circle>
    <line x1="350" y1="325" x2="228" y2="400.5" stroke="black"></line>
    <line x1="228" y1="400.5" x2="252" y2="476" stroke="black" marker-end="url(#arrow)"></line>
</svg>


## Language Syntax

The source code for the above diagram is:

```
: Person class
    int count = 2

main:
    Person p1 -> P1
    Person p2 -> P2

P1: Person
    String name -> "Taylor"
    int pin = 1989

P2: Person
    String name -> "Travis"
    int pin = 8713
```

A diagram specification is sequence of *blocks* (multiple lines) separated by a blank line.
The first line of each block specifies the block's *name* and *type* separated by a colon.

* If no name is given before the colon, the block represents static data.
    * Example: `: Person class`
* If no type is given after the colon, the block represents a stack frame.
    * Example: `main:`
* If both a name and type are given, the block represents a heap object.
    * Example: `P1: Person`

Each subsequent line of a block represents a *variable*.
Each variable has the syntax `type name operator value`.
The type and name must be one word.
The value can be any string (including spaces).

This diagram syntax is intended to be language agnostic.
The operator can be either `=` (primitive) or `->` (reference).
The value after `->` can be an object name (like `P1`), a string literal (in double quotes), or an array (in curly braces).

Indentation is optional, and extra whitespace is ignored.
