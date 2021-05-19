# World Flags Similarity

Team Members: Richard Liu

Paper: ...

Video: ...

Application: https://6859-sp21.github.io/final-project-sovereign-states-flags/

<!-- summary image, abstract -->

## Flags Data Set

Inside `data`

* `flag.data` to determine similarity (CSV file)
    * Source: https://archive.ics.uci.edu/ml/datasets/Flags
* to display flag image
    * Source: https://www.fotw.info/flags/cou_2010.html
    * Source: https://www.fotw.info/flags/country.html
    * Source: https://en.wikipedia.org/wiki/Gallery_of_sovereign_state_flags

## Design Decisions

A major point of focus around my visualization design were the principles of simplicity and exploration. Inspired by Ben Fry's zipdecode, I wanted to pursue a dataset like Sovereign State Flags, a kind of simple data that is commonplace yet we don't often think about, with the additional goal of letting users drill down into trends that they are interested in.

A key design decision for this project was to use simple visual encodings. This is inspired by zipdecode which has a similar principle, using just scatter plots, and explains why most of the complexity instead lies in the user interface. In particular, I feel that this decision, by cutting out heavily complex interactions, better enables the reader's natural exploration of the data, and their learning about common elements in flag design and the cultural connection of countries’ flags, and forming hypotheses about how a country’s flag design might have came to be.

## Development Process

After looking through the dataset and deciding on a focus on flag similarity, I brainstormed ways to enhance the reader's ability to "drill down" into the data with potential missing interactions or features or relations that the reader may wish the visualization let them drill down into. At this point, I added to my planning the interaction with clicking on flag features to visualize e.g. how many stars are in each country's flag.

Regarding the development work done, I spent roughly 30-40 hours, with two aspects taking the most time: data cleaning and porting out of ObservableHQ.

## Changes Since Assignment 4

Added walkthrough.
Added insights.

...