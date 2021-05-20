# World Flags Similarity

Team Members: Richard Liu

Paper: ...

Video: https://youtu.be/jRLdbcQv3uQ

Application: https://6859-sp21.github.io/final-project-sovereign-states-flags/

![Project Preview](https://raw.githubusercontent.com/6859-sp21/final-project-sovereign-states-flags/main/data/svg/none.png)

Flag designs from around the world may appear simple, yet they can capture the rich history and culture of a country. This project aims to help the user learn something new about sovereign state flags, through the lens of flag similarity. By highlighting trends across flags and the history behind certain flag features, this project seeks to make flags more accessible and allow users to explore the data to gain deeper insights.
The final interactive visualization, which offers a variety of interaction techniques, can be overwhelming for a new user. To this end, we also present a walkthrough tool which, inspired by scrollytelling techniques, introduces users to all of the features of the visualization.

## Running the Application Locally

* `python -m SimpleHTTPServer`
* Open the app at http://localhost:8000/

## Changes Since Assignment 4

### Development Process

After reviewing user feedback, I focused on a couple of choice issues related to user concerns. Of primary focus were the "onboarding" experience and the ability to discover flag trends. Towards each of these points I developed the walkthrough feature and the insights feature, respecitvely. Other nice changes added since Assignment 4 were the ability to reverse country order in the flag similarity panel, allowing for exploration of "least similar" flags, and the ability to query for countries through a dropdown autosuggestion menu, which helped users explore even the flags of countries they were not previously familiar with.

Regarding the development work done, I spent roughly 30-40 hours, with two aspects taking the most time: curating the data insights and implementing the walkthrough system.

### Walkthrough/Tutorial

From user feedback, it was clear that my original prototype visualization was not always successful in "onboarding" new users to the different features offered by the application. To this end, and inspired by scrollytelling techniques and video game tutorials, I implemented a (novel?) walkthrough system. In the final interactive visualization, the walkthrough takes the user through the application as follows:

1. In what country were you born? - User learns how to query by country name.
2. Which flag is most similar ... ? - User learns interactions with the top similar countries panel.
3. Now, navigate ... - User learns interactions with the chloropleth map; in particular, panning, zooming, reset, and query by location.
4. Interesting trend ... - User learns that through the visualization, interesting trends may surface ...
5. Similar design? - ... and through the details table, the user can read about the history and culture which underlies some of the interesting trends they discover.
6. On your own - Finally, the walkthrough concludes with direction to the settings and about pages, and encouragement for the user to discover new trends!

Section ? of the paper ?link describes ?.

### Insights Panels

Reading through user feedback, I noticed that there was not much commentary on interesting trends the user may or may not have discovered. Furthermore, trends that might be discovered, nonetheless exist in a kind of vacuum, without cultural or historical context to really explain the trend. To this end, and (again) inspired by scrollytelling techniques, I implemented several "insights panels" to accompany each of the flag features in the details table panel.

To take an example, the "crosses" insights panel explains how the Nordic cross design is used in the national flags of all independent Nordic countries, and represents Christianity and has an interesting origin in its traditions which date back to 11 June 1748 and regulations regarding Danish merchant ships.

Section ? of the paper ?link describes ?.
