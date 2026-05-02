# Git & Version Control

    - After completing any meaningful unit of work (a feature, a screen, a fix, a refactor), commit the changes to Git immediately.
    - Push to GitHub after every commit — do not let commits accumulate locally.                                                                                                                                                    
    - Commit messages must be clean, descriptive, and follow this format:
      - `feat: add TagSelectionScreen with hierarchical picker`                                                                                                                                                                     
      - `fix: correct onboarding completion flag not persisting`                                                                                                                                                                    
      - `chore: install React Navigation and configure RootNavigator`
    - Never batch unrelated changes into a single commit — keep commits focused and atomic.                                                                                                                                         
    - The goal is that the GitHub remote always reflects the latest working state, so no progress is ever lost.

# concept

“Find People in Your Communities

CORE IDEA:

so Community is going to be a social media platform that serves as purpose to users to find people who have the same passions as them and bridge that online-IRL connection to allow these individuals to meet.

community combines interest-based communities, local discovery and easy event creation in a single platform.

community first, interaction second and individuals third.
The core Idea is to be given the opportunity to share your passion/interests with people similar to you.

One of the defining aspects of Community is its emphasis on **local interaction**. Communities are geographically relevant, meaning users are primarily connected with people in their area.

[Features to implement]
-PURPLE (name of the feature / function / tool)
-YELLOW(Implementation)
-WHITE (Explanation)
-ORANGE(FEATURE INSIDE A FEATURE)
-BLUE(EXAMPLE)
-RED(External ideas for implementations)
# Profiles and Onboarding

User Profiles and Onboarding
-Users will be required to create their profile right when they open the app.  Tags will be utilized instead of a bio to stray away from dating apps.

-The goal here is not to make the user think that he’s marketing himself like one a dating app but rather to give other parties and himself the opportunity to orient themselves to others categorized in the same age group and interest group.

-Examples:

Sports → Football → Arsenal

Gaming → FIFA

Entertainment → Anime
# Community Discovery

Community Discovery
-the core feature of the app is it’s community discovery system.
After their profile creation the user is going to be given recommendations of communities to join based on his interests (his entered tags) and their location.

-the whole point is to assist the user to his first community and avoid any discomfort or feeling to have been dropped into cold water with no navigation.
This system is inspired by the community structure of platforms like Reddit, but adapted to focus on local participation and real-world interaction.

-Example:
An user situated in stuttgart who selected as tag
”football”, “arsenal”, “athlete”, is gonna be recommended
”arsenal fans Stuttgart” or “football free time Stuttgart”.

-(Aiden implementation Idea) :
A button that says Broaden your horizons and gives the user new and different community suggestions derived from the ones he already joined or derived from his interests and tags

-(Aiden implementation idea):
big company's should be allowed to buy a lease/license to organize events every month trough the app and they should be “Community events” organized by us the creators which feature big celebrities.
# Event Creation

-Event creation

-The event creation process is intentionally simple to encourage participation. A user can create an event by selecting a community, choosing a location and time, and writing a short description of the activity.
Other members can then join the event and see who else will be attending.

-shared and synced calendar to implement.
just like in football apps the location and time will be written in the calendar to avoid confusions and ensure that everyone meets up safely with no troubles.

-This feature encourages natural social interaction because participants already share a common interest before meeting.
The event-based structure is partially inspired by platforms like Meetup and Meet5, but Community focuses on younger audiences and interest-driven communities rather than structured group outings.

-Example
An user wants to organize a watch party for the “Arsenal vs Chelsea” game on Friday.
He goes on the app and texts “who’s free on Friday to watch the game?” after determining who has time, he creates an event and enters it in the community shared and synced calendar.

community members will automatically receive a notification that a new event has been created be given the opportunity to join/decline event from the comfort of their home.
# Discovering people

-Discovering People

-While the app is primarily community-focused, it also allows users to discover and connect with individuals who share their interests. Instead of browsing random profiles, users are recommended people who belong to the same communities or who share similar interest tags.

-A possible implementation of that would be:
An user “Simon” is recommended to him. On his profile it doesn’t reveal all his information but rather just the common “tags” that the user shares with “Simon”.

-Each recommended user profile clearly shows the interests and communities that connect the two individuals. This shared context helps users understand why they are being recommended to each other and reduces the feeling of browsing strangers.

The concept of recommending people based on shared interests is inspired by the “Find Friends” feature in Instagram, but the focus is on meaningful common ground rather than follower networks.

-For example, a recommendation might display that two users both enjoy Arsenal and are members of the same local football community. This creates a natural starting point for interaction.
# Interaction and Communication

-Interaction and Communication

-Interaction inside the app is designed to remain casual and low-pressure. Once users join communities or events, they can communicate with other members through simple messaging or community chats.

-Unlike traditional social media platforms, Community avoids features that encourage comparison or popularity metrics. There are no follower counts, like counts, or ranking systems that might pressure users to perform socially. Instead, the focus remains on participation and shared experiences.

-These conversations are meant to help coordinate activities, discuss shared interests, or simply get to know other members before meeting in person.
The lack of follower count also helps the users stay down the earth and maintain human behavior and not preferential behavior depending on fame. (follower count, popularity).
# Live Map
-Community Activity Map

-Community includes a live map feature that allows users to discover activities happening nearby. The map is inspired by the Snap Map from Snapchat but redesigned to focus on communities and events rather than individual user locations.

-To avoid clutter and maintain relevance, the map only displays events from communities that the user has already joined. This ensures that the map always shows activities that are directly connected to the user’s interests and communities.

-Each event appears as a marker on the map. When users tap on a marker, they can see details about the event, including the community hosting it, the location, the time, and which members are attending.

-The purpose of this feature is to allow users to have an easier time finding events and their friends.
Once users open the App during the day, it should their primary focus (what’s happening around me)
of course by doing that they expect to be met by events that fit their interests.

-In the future, communities will have the option to create **open events**. These events can be discovered by users outside the community and serve as a way to introduce new members to different groups. Open events help expand social discovery while still maintaining the community-based structure of the platform.

-A potential premium feature may later allow users to receive recommendations for open events that match their interests, enabling them to explore communities they have not yet joined while keeping the core experience free and focused on existing communities.

Map Feature — Event Discovery

A map displaying markers/standpoints across different geographic areas, each representing an active event.
On top of each marker, a counter shows the current number of attendees out of the maximum capacity allowed for that event.
When zooming out, nearby events cluster together into grouped markers for readability. When zooming back in, clusters dissemble and display each event individually with precise location accuracy.
Tapping on an event marker triggers a pop-up panel with detailed information about that event.
Each marker displays the event name above the attendee counter.
A persistent search bar sits above the map, allowing users to look up a specific address or location.
Once an address is searched, the map automatically navigates and zooms into that location.
A secondary button (3-dot / list button) switches the view from the map to a list format, displaying all events within the searched address or area, each shown with their name and corresponding symbol/icon.


-(Aiden Implemented Idea)
Map above Icon

-(Aiden implemented Idea)
Speak bubbbles above characters
# tracking system

# Participation Tracker- Stat tracking

-Community includes a participation tracking feature designed to recognize and encourage members who actively attend events and engage with their communities. The goal of this feature is not to pressure users into attending events, but rather to highlight and reward consistent participation in a subtle and positive way.

-The goal of this feature is to show that a user is **a reliable and active member of a community**, without making anyone feel punished for missing events.

Instead of tracking “attendance streaks” or ranking people, the system should simply show **participation over time**.

Think of it as **community involvement**, not performance.
(this sentence should be kept while the app guides the party trough the app)

-Community Activity

Events Attended: 12
Communities Active In: 3
Last Event: Arsenal Watch Party – March 2
# Ai implementation
effective Ai implementation

-The application uses artificial intelligence to perform data cross-referencing between user profiles and community profiles.
Each community is defined by structured attributes such as topic, activity level, event frequency, and social dynamics, while user profiles are generated through onboarding and behavioral data.
AI is used selectively to optimize performance while maintaining cost efficiency.

-the main purpose of Ai is to maximize the amount of users using the app.
By including Ai, we can aim to reach people have yet to have discovered their passion but still crave that human contact or the need to be apart of a community.
”the more we reach the bigger we get”

UX Summary (Example):

1.AI asks a few smart questions
2.Builds profile instantly
3.Suggests relevant communities/events
4.Occasionally helps when user is unsure
5.Stays mostly invisible
# Passion into interaction

# ***Encouraging Real Participation***

**-To ensure that communities remain active and meaningful, the platform encourages participation through event attendance and interaction within groups. Users are encouraged to take part in events, discussions, or spontaneous meetups rather than passively scrolling through content.**

**-The design philosophy of the platform is to reduce passive consumption and instead promote active involvement.**

**-Every major feature of the app from community suggestions to event discovery is built to guide users toward interaction with others who share their interests.**
# Long term vision

-The long-term goal of Community is to become a platform where people can easily find others who share their passions and turn those connections into real-world experiences. By combining interest-based communities, local discovery, and simple event organization, the app aims to create an environment where belonging and interaction happen naturally.

Instead of functioning as another content-driven social media platform, Community focuses on helping users build meaningful connections through shared hobbies, activities, and discussions.

The platform ultimately seeks to redefine how people form communities in the digital age by making it easier to transform online interests into real-life relationships.
# Use Case (User orientated)

WHO is the user?

-people trying to find a community that welcomes them for sharing the same interests as them.

WHAT do they want?

-Growing their Community

HOW does the app help them?

It helps them by making their Events accessible and visible to the local Users
