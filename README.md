# MemDia
JavaScript library for drawing memory diagrams


## Usage

Include `memdia.js` in the document `<head>`:

``` html
<script src="memdia.js"></script>
```

Write your diagram specification in any element with class `memdia`:

``` html
<div class="memdia">
main:
    String hello @ "world"
</div>
```

The library replaces your spec with an `<svg>` when `DOMContentLoaded`.


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

![Memory Diagram for Person.java](Person.svg)


## Language Syntax

The source code for the above diagram is:

```
: Person class
    int count = 2

main:
    Person p1 @ P1
    Person p2 @ P2

P1: Person
    String name @ "Taylor"
    int pin = 1989

P2: Person
    String name @ "Travis"
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

Each subsequent line of the block represents a *variable*.
Each variable has the syntax `type name operator value`.
The type and name must each be one word.
The value can be any string (including spaces).

This diagram syntax is intended to be language agnostic.
The operator can be either `=` (primitive) or `@` (arrow / reference).
The value after `@` can be an object name (like `P1`), a string literal (in double quotes), or an array (in curly braces).

Indentation is optional, and extra whitespace is ignored.
